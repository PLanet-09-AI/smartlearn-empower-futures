import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, updateDoc, addDoc, 
  serverTimestamp, getDocs, query, where, Timestamp 
} from 'firebase/firestore';
import { 
  Course, 
  Quiz, 
  QuizQuestion, 
  QuizResult, 
  QuizAnswer,
  LeaderboardEntry 
} from '@/types';
import { azureOpenAIService } from './azureOpenAIService';
import { v4 as uuidv4 } from 'uuid';

export class QuizService {
  private coursesCollection = 'courses';
  private quizResultsCollection = 'quizResults';
  private quizAnswersCollection = 'quizAnswers';

  /**
   * Starts a new AI-powered quiz based on course content
   * @param courseId The ID of the course to generate a quiz for
   * @param userId The ID of the user taking the quiz
   * @param numQuestions Number of questions to generate (default: 5)
   */
  async startQuiz(courseId: string, userId: string, numQuestions: number = 5): Promise<{
    quiz: Quiz,
    quizResultId: string,
    generatedAt: Date
  }> {
    try {
      console.log(`Starting AI quiz for course ${courseId} with ${numQuestions} questions`);
      
      // Get the course content
      const courseRef = doc(db, this.coursesCollection, courseId);
      const courseDoc = await getDoc(courseRef);
      
      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }
      
      const courseData = courseDoc.data() as Course;
      
      // Extract text content from the course
      const contentTexts = courseData.content
        ?.map(item => ({
          title: item.title,
          content: item.content || ''
        }))
        .filter(item => item.content.length > 0) || [];
      
      // Format the course content for the AI prompt
      const contentForPrompt = contentTexts
        .map(item => `Section: ${item.title}\nContent: ${item.content}`)
        .join('\n\n')
        .substring(0, 4000); // Limit to 4000 chars to ensure it fits in the prompt
      
      const generatedAt = new Date();
      
      // Generate quiz questions using Azure OpenAI directly from course content
      const quizPrompt = `
I need you to create a quiz based on the following course content:

Course Title: ${courseData.title}
Course Description: ${courseData.description || ''}

COURSE CONTENT:
${contentForPrompt}

Please generate ${numQuestions} multiple-choice questions that test understanding of key concepts from this course content.

Return your response as a JSON array of objects, each with:
• id (number)
• text (string) - the question text
• options: array of 4 objects { id (number), text (string), isCorrect (boolean), explanation (string) }

Make sure questions are varied and cover different sections of the content. The correct answer should be well-explained.
`;

      const questionsJson = await azureOpenAIService.generateText([
        { role: "system", content: "You are a quiz generator specializing in accountancy education." },
        { role: "user", content: quizPrompt }
      ]);
      
      // 3) Parse and clean up the JSON response
      const questionsData = this.deserializeQuestions(questionsJson);
      
      // 4) Create a new quiz object
      const quiz: Quiz = {
        id: `quiz_ai_${Date.now()}`,
        title: `AI Quiz: ${courseData.title}`,
        courseId: courseId,
        questions: questionsData.map(q => ({
          id: `q_${q.id}`,
          question: q.text,
          options: q.options.map(o => o.text),
          correctAnswer: q.options.findIndex(o => o.isCorrect),
          explanation: q.options.find(o => o.isCorrect)?.explanation || ''
        }))
      };
      
      // 5) Save the quiz result to Firebase
      const quizResultId = uuidv4();
      await addDoc(collection(db, this.quizResultsCollection), {
        id: quizResultId,
        userId: userId,
        courseId: courseId,
        contentSummary: courseData.title,
        questionsJson: questionsJson,
        generatedAt: Timestamp.fromDate(generatedAt),
        attemptedAt: null,
        score: 0,
        isCompleted: false
      });
      
      return {
        quiz,
        quizResultId,
        generatedAt
      };
    } catch (error) {
      console.error('Error generating AI quiz:', error);
      throw new Error('Failed to generate AI quiz');
    }
  }

  /**
   * Submit quiz answers and calculate results
   * @param quizResultId The ID of the quiz result document
   * @param userId The ID of the user submitting the quiz
   * @param submission The user's quiz submission with answers
   */
  async submitQuiz(quizResultId: string, userId: string, submission: {
    questions: { questionId: string, selectedOptionId: number }[]
  }): Promise<{
    score: number,
    selectedAnswers: Record<string, boolean>,
    explanations: Record<string, string>,
    correctAnswers: Record<string, string>,
    userAnswers: Record<string, string>,
    attemptedAt: Date
  }> {
    try {
      // 1) Load the quiz result
      const quizResultsRef = collection(db, this.quizResultsCollection);
      const q = query(quizResultsRef, where("id", "==", quizResultId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Quiz result not found');
      }
      
      const quizResultDoc = snapshot.docs[0];
      const quizResult = quizResultDoc.data() as any;
      
      if (quizResult.userId !== userId) {
        throw new Error('Unauthorized access to quiz result');
      }
      
      if (quizResult.isCompleted) {
        throw new Error('Quiz already submitted');
      }
      
      // 2) Parse the questions JSON
      const questions = this.deserializeQuestions(quizResult.questionsJson);
      
      // 3) Calculate results
      const attemptedAt = new Date();
      let correctCount = 0;
      const selectedAnswers: Record<string, boolean> = {};
      const explanations: Record<string, string> = {};
      const correctAnswers: Record<string, string> = {};
      const userAnswers: Record<string, string> = {};
      
      // Process each submitted answer
      for (const answer of submission.questions) {
        const questionId = answer.questionId;
        const selectedOptionId = answer.selectedOptionId;
        
        // Find the corresponding question in our parsed data
        const questionData = questions.find(q => `q_${q.id}` === questionId);
        
        if (!questionData) {
          console.error(`Question with ID ${questionId} not found`);
          continue;
        }
        
        const selectedOption = questionData.options[selectedOptionId];
        const correctOption = questionData.options.find(o => o.isCorrect);
        
        if (!selectedOption || !correctOption) {
          console.error(`Invalid option data for question ${questionId}`);
          continue;
        }
        
        const isCorrect = selectedOption.isCorrect;
        if (isCorrect) correctCount++;
        
        selectedAnswers[questionId] = isCorrect;
        explanations[questionId] = selectedOption.explanation;
        correctAnswers[questionId] = correctOption.text;
        userAnswers[questionId] = selectedOption.text;
        
        // Save individual answer
        await addDoc(collection(db, this.quizAnswersCollection), {
          quizResultId: quizResultId,
          userId: userId,
          questionId: questionId,
          selectedOptionId: selectedOptionId,
          isCorrect: isCorrect,
          submittedAt: Timestamp.fromDate(attemptedAt)
        });
      }
      
      // 4) Calculate score as percentage
      const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
      
      // 5) Update the quiz result
      await updateDoc(quizResultDoc.ref, {
        attemptedAt: Timestamp.fromDate(attemptedAt),
        score: score,
        isCompleted: true
      });
      
      return {
        score,
        selectedAnswers,
        explanations,
        correctAnswers,
        userAnswers,
        attemptedAt
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw new Error('Failed to submit quiz');
    }
  }

  /**
   * Get leaderboard entries for quizzes
   * @param courseId Optional course ID to filter by
   * @param topCount Number of entries to return
   */
  async getLeaderboard(courseId?: string, topCount: number = 10): Promise<LeaderboardEntry[]> {
    try {
      // 1) Query completed quiz results
      let quizResultsRef = collection(db, this.quizResultsCollection);
      let q = query(quizResultsRef, where("isCompleted", "==", true));
      
      // Filter by course if provided
      if (courseId) {
        q = query(q, where("courseId", "==", courseId));
      }
      
      const snapshot = await getDocs(q);
      
      // 2) Map to leaderboard entries
      const entries: Record<string, LeaderboardEntry[]> = {};
      
      for (const doc of snapshot.docs) {
        const data = doc.data() as any;
        const userId = data.userId;
        const userName = await this.getUserName(userId);
        const courseRef = await getDoc(doc(db, this.coursesCollection, data.courseId));
        const courseName = courseRef.exists() ? courseRef.data().title : 'Unknown Course';
        
        const generatedAt = data.generatedAt?.toDate() || new Date();
        const attemptedAt = data.attemptedAt?.toDate() || new Date();
        const timeTaken = attemptedAt.getTime() - generatedAt.getTime();
        
        const entry: LeaderboardEntry = {
          id: doc.id,
          userId: userId,
          userName: userName,
          courseId: data.courseId,
          courseName: courseName,
          score: data.score,
          timeTaken: timeTaken,
          attemptedAt: attemptedAt
        };
        
        if (!entries[userId]) {
          entries[userId] = [];
        }
        entries[userId].push(entry);
      }
      
      // 3) Pick each user's best attempt (highest score, then fastest)
      const bestPerUser = Object.values(entries).map(userEntries => {
        return userEntries
          .sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;
            return a.timeTaken - b.timeTaken;
          })[0];
      });
      
      // 4) Sort and return top N entries
      return bestPerUser
        .sort((a, b) => {
          if (a.score !== b.score) return b.score - a.score;
          return a.timeTaken - b.timeTaken;
        })
        .slice(0, topCount);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw new Error('Failed to get leaderboard');
    }
  }

  /**
   * Check if a user has attempted a quiz for a course
   * @param userId User ID to check
   * @param courseId Course ID to check
   */
  async hasAttempted(userId: string, courseId: string): Promise<boolean> {
    try {
      const quizResultsRef = collection(db, this.quizResultsCollection);
      const q = query(
        quizResultsRef,
        where("userId", "==", userId),
        where("courseId", "==", courseId),
        where("isCompleted", "==", true)
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking quiz attempts:', error);
      return false;
    }
  }

  /**
   * Get a user's name from their ID
   * @param userId User ID to lookup
   */
  private async getUserName(userId: string): Promise<string> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().displayName || 'Anonymous User';
      }
      return 'Anonymous User';
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Anonymous User';
    }
  }

  /**
   * Parse and clean the JSON response from Azure OpenAI
   * @param rawJson The raw JSON string from the AI
   */
  private deserializeQuestions(rawJson: string): Array<{
    id: number;
    text: string;
    options: Array<{
      id: number;
      text: string;
      isCorrect: boolean;
      explanation: string;
    }>;
  }> {
    try {
      // Clean up the JSON string - remove markdown code blocks if present
      let clean = rawJson.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
      
      // Ensure it starts with an array
      if (!clean.startsWith('[')) {
        clean = '[' + clean + ']';
      }
      
      // Remove trailing commas which can cause JSON parse errors
      clean = clean.replace(/,\s*([}\]])/g, '$1');
      
      // Parse the JSON
      const parsed = JSON.parse(clean);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing quiz questions JSON:', error);
      return [];
    }
  }

  /**
   * Generate AI quiz questions based on course content
   * @param courseId The ID of the course
   * @param numQuestions Number of questions to generate
   */
  async generateAIQuiz(courseId: string, numQuestions: number = 5): Promise<Quiz> {
    const { quiz } = await this.startQuiz(courseId, 'system', numQuestions);
    return quiz;
  }

  /**
   * Save quiz results
   * @param courseId The ID of the course
   * @param userId The ID of the user
   * @param score The user's score
   */
  async saveQuizResult(courseId: string, userId: string, score: number): Promise<void> {
    try {
      await addDoc(collection(db, this.quizResultsCollection), {
        courseId,
        userId,
        score,
        isCompleted: true,
        generatedAt: serverTimestamp(),
        attemptedAt: serverTimestamp()
      });
      
      console.log('Quiz result saved successfully');
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw new Error('Failed to save quiz result');
    }
  }

  /**
   * Get quiz results for a user
   * @param userId The ID of the user
   */
  async getUserQuizResults(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.quizResultsCollection),
        where("userId", "==", userId),
        where("isCompleted", "==", true)
      );
      
      const snapshot = await getDocs(q);
      const results: any[] = [];
      
      snapshot.forEach(doc => {
        results.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return results;
    } catch (error) {
      console.error('Error getting user quiz results:', error);
      throw new Error('Failed to get user quiz results');
    }
  }
}

export const quizService = new QuizService();
