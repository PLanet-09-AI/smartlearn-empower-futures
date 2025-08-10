import { db } from '@/lib/firebase';
import { 
  collection, doc, getDoc, updateDoc, addDoc, setDoc,
  serverTimestamp, getDocs, query, where, Timestamp 
} from 'firebase/firestore';
import { 
  Course, 
  Quiz, 
  QuizQuestion, 
  QuizResult, 
  QuizAnswer,
  LeaderboardEntry,
  QuizAnalytics,
  QuestionAnalytics,
  UserQuizResult
} from '@/types';
import { openAIService } from './openAIService';
import { v4 as uuidv4 } from 'uuid';

export class QuizService {
  private coursesCollection = 'courses';
  private quizResultsCollection = 'quizResults';
  private quizAnswersCollection = 'quizAnswers';
  private quizAnalyticsCollection = 'quizAnalytics';

  /**
   * Starts a new AI-powered quiz based on course content
   * @param courseId The ID of the course to generate a quiz for
   * @param userId The ID of the user taking the quiz
   * @param numQuestions Number of questions to generate (default: 5)
   * @param customPrompt Optional custom prompt from the lecturer
   * @param temperature Optional temperature setting (0.0-1.0)
   */
  async startQuiz(
    courseId: string, 
    userId: string, 
    numQuestions: number = 5,
    customPrompt?: string,
    temperature: number = 0.7
  ): Promise<{
    quiz: Quiz,
    quizResultId: string,
    generatedAt: Date
  }> {
    try {
      console.log(`Starting AI quiz for course ${courseId} with ${numQuestions} questions`);
      console.log(`Using temperature: ${temperature}`);
      if (customPrompt) console.log(`Using custom prompt engineering`);
      
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
      
      // Generate quiz questions using OpenAI directly from course content
      const defaultQuizPrompt = `
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

      // Use custom prompt if provided, otherwise use default
      const finalPrompt = customPrompt 
        ? customPrompt.replace("{contentForPrompt}", contentForPrompt)
                      .replace("{courseTitle}", courseData.title)
                      .replace("{courseDescription}", courseData.description || '')
                      .replace("{numQuestions}", numQuestions.toString())
        : defaultQuizPrompt;

      const questionsJson = await openAIService.generateText([
        { role: "system", content: "You are a quiz generator specializing in accountancy education." },
        { role: "user", content: finalPrompt }
      ], temperature);
      
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
    attemptedAt: Date,
    isNewHighScore: boolean,
    previousHighScore: number
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
      
      // 2.1) Check user's previous highest score for this course
      const previousScores = await this.getUserCourseScores(userId, quizResult.courseId);
      const previousHighScore = previousScores.length > 0 ? Math.max(...previousScores) : 0;
      
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
      
      // 4.1) Determine if this is a new high score
      const isNewHighScore = score > previousHighScore;
      
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
        attemptedAt,
        isNewHighScore,
        previousHighScore
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
      
      for (const quizDoc of snapshot.docs) {
        const data = quizDoc.data() as any;
        const userId = data.userId;
        const userName = await this.getUserName(userId);
        const courseRef = await getDoc(doc(db, this.coursesCollection, data.courseId));
        const courseName = courseRef.exists() ? (courseRef.data() as any)?.title || 'Unknown Course' : 'Unknown Course';
        
        const generatedAt = data.generatedAt?.toDate() || new Date();
        const attemptedAt = data.attemptedAt?.toDate() || new Date();
        const timeTaken = attemptedAt.getTime() - generatedAt.getTime();
        
        const entry: LeaderboardEntry = {
          id: quizDoc.id,
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
   * @param customPrompt Optional custom prompt from the lecturer
   * @param temperature Optional temperature setting (0.0-1.0)
   */
  async generateAIQuiz(
    courseId: string, 
    numQuestions: number = 5,
    customPrompt?: string,
    temperature: number = 0.7
  ): Promise<Quiz> {
    const { quiz } = await this.startQuiz(courseId, 'system', numQuestions, customPrompt, temperature);
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

  /**
   * Get user's previous scores for a specific course
   * @param userId The ID of the user
   * @param courseId The ID of the course
   */
  async getUserCourseScores(userId: string, courseId: string): Promise<number[]> {
    try {
      const q = query(
        collection(db, this.quizResultsCollection),
        where("userId", "==", userId),
        where("courseId", "==", courseId),
        where("isCompleted", "==", true)
      );
      
      const snapshot = await getDocs(q);
      const scores: number[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.score !== undefined) {
          scores.push(data.score);
        }
      });
      
      console.log(`Previous scores for user ${userId} in course ${courseId}:`, scores);
      return scores;
    } catch (error) {
      console.error('Error getting user course scores:', error);
      return [];
    }
  }

  /**
   * Get detailed quiz analytics for lecturers and admins
   * @param courseId Optional course ID to filter by
   */
  async getQuizAnalytics(courseId?: string): Promise<QuizAnalytics[]> {
    try {
      // 1) Query the analytics collection first for cached analytics
      let quizAnalyticsRef = collection(db, this.quizAnalyticsCollection);
      let q = courseId 
        ? query(quizAnalyticsRef, where("courseId", "==", courseId))
        : quizAnalyticsRef;
      
      const analyticsSnapshot = await getDocs(q);
      const analyticsExists = !analyticsSnapshot.empty;
      
      // If we have cached analytics and they're recent (within 1 hour), use them
      if (analyticsExists) {
        const analytics: QuizAnalytics[] = [];
        analyticsSnapshot.forEach(doc => {
          const data = doc.data() as any;
          // Convert timestamps to dates
          const userResults = data.userResults?.map((user: any) => ({
            ...user,
            attemptedAt: user.attemptedAt?.toDate() || new Date()
          })) || [];
          
          analytics.push({
            ...data,
            userResults
          });
        });
        
        // Check if the analytics are fresh (within the last hour)
        const isFresh = analytics.every(a => {
          const lastUpdated = a.lastUpdated?.toDate() || new Date(0);
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          return lastUpdated > oneHourAgo;
        });
        
        if (isFresh) {
          console.log('Using cached quiz analytics');
          return analytics;
        }
      }
      
      // Otherwise, generate new analytics
      console.log('Generating fresh quiz analytics');
      
      // 2) Query quiz results
      let quizResultsRef = collection(db, this.quizResultsCollection);
      let resultsQuery = query(quizResultsRef, where("isCompleted", "==", true));
      
      if (courseId) {
        resultsQuery = query(resultsQuery, where("courseId", "==", courseId));
      }
      
      const resultsSnapshot = await getDocs(resultsQuery);
      
      // 3) Group results by quiz ID
      const quizGroups: Record<string, any[]> = {};
      
      for (const resultDoc of resultsSnapshot.docs) {
        const resultData = resultDoc.data();
        const quizId = resultData.id;
        
        if (!quizGroups[quizId]) {
          quizGroups[quizId] = [];
        }
        
        quizGroups[quizId].push(resultData);
      }
      
      // 4) For each quiz, calculate analytics
      const allAnalytics: QuizAnalytics[] = [];
      
      for (const [quizId, results] of Object.entries(quizGroups)) {
        // Skip if no results
        if (results.length === 0) continue;
        
        // Use first result to get course info
        const courseRef = doc(db, this.coursesCollection, results[0].courseId);
        const courseDoc = await getDoc(courseRef);
        const courseName = courseDoc.exists() ? (courseDoc.data() as Course).title : 'Unknown Course';
        
        // Calculate average score
        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        const averageScore = Math.round(totalScore / results.length);
        
        // Group attempts by date
        const attemptsByDate: Record<string, number> = {};
        for (const result of results) {
          if (!result.attemptedAt) continue;
          
          const date = result.attemptedAt.toDate().toISOString().split('T')[0];
          attemptsByDate[date] = (attemptsByDate[date] || 0) + 1;
        }
        
        // Calculate score distribution
        const scoreDistribution = {
          excellent: 0, // 90-100%
          good: 0,      // 70-89% 
          average: 0,   // 50-69%
          poor: 0       // 0-49%
        };
        
        for (const result of results) {
          const score = result.score;
          if (score >= 90) scoreDistribution.excellent++;
          else if (score >= 70) scoreDistribution.good++;
          else if (score >= 50) scoreDistribution.average++;
          else scoreDistribution.poor++;
        }
        
        // Get user details and individual answers
        const userResults: UserQuizResult[] = [];
        for (const result of results) {
          // Get user name
          const userName = await this.getUserName(result.userId);
          
          // Get answers for this quiz attempt
          const answersQuery = query(
            collection(db, this.quizAnswersCollection),
            where("quizResultId", "==", result.id)
          );
          const answersSnapshot = await getDocs(answersQuery);
          
          // Parse questions from JSON
          const questions = this.deserializeQuestions(result.questionsJson);
          
          // Process answers
          const answers: any[] = [];
          answersSnapshot.forEach(answerDoc => {
            const answerData = answerDoc.data();
            const questionId = answerData.questionId;
            
            // Find question data
            const questionData = questions.find(q => `q_${q.id}` === questionId);
            if (!questionData) return;
            
            // Find selected and correct options
            const selectedOptionId = answerData.selectedOptionId;
            const selectedOption = questionData.options[selectedOptionId];
            const correctOption = questionData.options.find(o => o.isCorrect);
            
            if (!selectedOption || !correctOption) return;
            
            answers.push({
              questionId: questionId,
              questionText: questionData.text,
              selectedOption: selectedOption.text,
              isCorrect: answerData.isCorrect,
              correctOption: correctOption.text
            });
          });
          
          // Add to user results
          userResults.push({
            userId: result.userId,
            userName: userName,
            score: result.score,
            timeTaken: result.attemptedAt && result.generatedAt ? 
              result.attemptedAt.toDate().getTime() - result.generatedAt.toDate().getTime() : 0,
            attemptedAt: result.attemptedAt ? result.attemptedAt.toDate() : null,
            answers: answers
          });
        }
        
        // Calculate question analytics
        const questionAnalytics: QuestionAnalytics[] = [];
        const firstQuizResult = results[0];
        if (firstQuizResult && firstQuizResult.questionsJson) {
          const questions = this.deserializeQuestions(firstQuizResult.questionsJson);
          
          for (const question of questions) {
            const questionId = `q_${question.id}`;
            
            // Count correct/incorrect answers for this question
            let correctCount = 0;
            let incorrectCount = 0;
            const optionCounts: Record<number, number> = {};
            
            // Initialize option counts
            question.options.forEach((_, index) => {
              optionCounts[index] = 0;
            });
            
            // Aggregate answers from all users
            for (const userResult of userResults) {
              const answer = userResult.answers.find(a => a.questionId === questionId);
              if (answer) {
                if (answer.isCorrect) correctCount++;
                else incorrectCount++;
                
                // Find the option index
                const optionIndex = question.options.findIndex(o => o.text === answer.selectedOption);
                if (optionIndex >= 0) {
                  optionCounts[optionIndex] = (optionCounts[optionIndex] || 0) + 1;
                }
              }
            }
            
            const totalAnswers = correctCount + incorrectCount;
            const correctPercentage = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 0;
            
            // Find correct answer text
            const correctOption = question.options.find(o => o.isCorrect);
            
            questionAnalytics.push({
              questionId,
              questionText: question.text,
              correctAnswerText: correctOption?.text || 'Unknown',
              correctCount,
              incorrectCount,
              correctPercentage,
              optionCounts
            });
          }
        }
        
        // Create the analytics object
        const analytics: QuizAnalytics = {
          quizId,
          courseId: results[0].courseId,
          courseName,
          totalAttempts: results.length,
          averageScore,
          questionAnalytics,
          attemptsByDate,
          scoreDistribution,
          userResults,
          lastUpdated: Timestamp.now()
        };
        
        // Save to Firestore for future use
        const analyticsRef = doc(db, this.quizAnalyticsCollection, quizId);
        await setDoc(analyticsRef, analytics);
        
        allAnalytics.push(analytics);
      }
      
      return allAnalytics;
    } catch (error) {
      console.error('Error getting quiz analytics:', error);
      throw new Error('Failed to get quiz analytics');
    }
  }
  
  /**
   * Get analytics for a specific course
   * @param courseId The course ID
   */
  async getCourseQuizAnalytics(courseId: string): Promise<QuizAnalytics | null> {
    try {
      const allAnalytics = await this.getQuizAnalytics(courseId);
      return allAnalytics.length > 0 ? allAnalytics[0] : null;
    } catch (error) {
      console.error('Error getting course quiz analytics:', error);
      return null;
    }
  }
  
  /**
   * Get detailed user quiz history
   * @param userId The user ID
   * @param includeAnswers Whether to include detailed answer information
   */
  async getUserQuizHistory(userId: string, includeAnswers: boolean = false): Promise<any[]> {
    try {
      const q = query(
        collection(db, this.quizResultsCollection),
        where("userId", "==", userId),
        where("isCompleted", "==", true)
      );
      
      const snapshot = await getDocs(q);
      const results: any[] = [];
      
      for (const quizDoc of snapshot.docs) {
        const quizData = quizDoc.data();
        
        // Get course name
        const courseRef = doc(db, this.coursesCollection, quizData.courseId);
        const courseDoc = await getDoc(courseRef);
        const courseName = courseDoc.exists() ? (courseDoc.data() as Course).title : 'Unknown Course';
        
        // Calculate time taken
        const generatedAt = quizData.generatedAt?.toDate();
        const attemptedAt = quizData.attemptedAt?.toDate();
        const timeTaken = generatedAt && attemptedAt ? 
          attemptedAt.getTime() - generatedAt.getTime() : 0;
          
        // Build result object
        const result: any = {
          id: quizData.id,
          courseId: quizData.courseId,
          courseName: courseName,
          score: quizData.score,
          attemptedAt: attemptedAt,
          timeTaken: timeTaken
        };
        
        // Add answer details if requested
        if (includeAnswers) {
          // Get answer details
          const answersQuery = query(
            collection(db, this.quizAnswersCollection),
            where("quizResultId", "==", quizData.id)
          );
          const answersSnapshot = await getDocs(answersQuery);
          
          // Parse questions
          const questions = this.deserializeQuestions(quizData.questionsJson || '[]');
          const answers: any[] = [];
          
          answersSnapshot.forEach(answerDoc => {
            const answerData = answerDoc.data();
            const questionId = answerData.questionId;
            
            // Find question
            const questionData = questions.find(q => `q_${q.id}` === questionId);
            if (!questionData) return;
            
            // Find option details
            const selectedOptionId = answerData.selectedOptionId;
            const selectedOption = questionData.options[selectedOptionId];
            const correctOption = questionData.options.find(o => o.isCorrect);
            
            if (!selectedOption || !correctOption) return;
            
            answers.push({
              questionId: questionId,
              questionText: questionData.text,
              selectedOption: selectedOption.text,
              isCorrect: answerData.isCorrect,
              correctOption: correctOption.text,
              explanation: selectedOption.explanation
            });
          });
          
          result.answers = answers;
        }
        
        results.push(result);
      }
      
      // Sort by most recent first
      return results.sort((a, b) => {
        if (!a.attemptedAt || !b.attemptedAt) return 0;
        return b.attemptedAt.getTime() - a.attemptedAt.getTime();
      });
      
    } catch (error) {
      console.error('Error getting user quiz history:', error);
      throw new Error('Failed to get user quiz history');
    }
  }
}

export const quizService = new QuizService();
