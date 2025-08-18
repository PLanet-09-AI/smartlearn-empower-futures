import { db, serverTimestamp } from '@/lib/database';
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
import { azureOpenAIService } from './azureOpenAI';
import { v4 as uuidv4 } from 'uuid';

export class QuizService {
  private coursesCollection = 'courses';
  private quizResultsCollection = 'quizResults';
  private quizAnswersCollection = 'quizAnswers';
  private quizAnalyticsCollection = 'quizAnalytics';

  /**
   * Starts a new AI-powered quiz based on course content
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
      
      // Get the course content
      const courseData = await db.get(this.coursesCollection, courseId);
      
      if (!courseData) {
        throw new Error('Course not found');
      }
      
      // Extract text content from the course
      const contentTexts = courseData.content
        ?.map((item: any) => ({
          title: item.title,
          content: item.content || ''
        }))
        .filter((item: any) => item.content.length > 0) || [];
      
      // Format the course content for the AI prompt
      const contentForPrompt = contentTexts
        .map((item: any) => `Section: ${item.title}\nContent: ${item.content}`)
        .join('\n\n')
        .substring(0, 4000);
      
      const generatedAt = new Date();
      
      // Generate quiz questions using Ollama (local LLM) from course content
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

      const questionsJson = await azureOpenAIService.generateText([
        { role: "system", content: "You are a quiz generator specializing in accountancy education." },
        { role: "user", content: finalPrompt }
      ]);
      
      // Parse and clean up the JSON response
      const questionsData = this.deserializeQuestions(questionsJson);
      
      // Create a new quiz object
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

      // Create a quiz result record for tracking this attempt
      const quizResultId = await db.add(this.quizResultsCollection, {
        userId: userId,
        courseId: courseId,
        quizId: quiz.id,
        isCompleted: false,
        generatedAt: generatedAt,
        quiz: quiz
      });

      console.log(`✅ AI quiz generated successfully for course ${courseId}`);
      console.log(`📝 Generated ${quiz.questions.length} questions`);
      console.log(`🆔 Quiz result ID: ${quizResultId}`);

      return {
        quiz,
        quizResultId,
        generatedAt
      };

    } catch (error) {
      console.error('❌ Error generating AI quiz:', error);
      throw new Error('Failed to generate AI quiz');
    }
  }

  /**
   * Submit quiz answers and calculate results
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
      // Get the quiz result record
      const quizResult = await db.get(this.quizResultsCollection, quizResultId);
      
      if (!quizResult) {
        throw new Error('Quiz result not found');
      }

      const quiz = quizResult.quiz as Quiz;
      const attemptedAt = new Date();
      
      // Calculate score and collect answer details
      let correctCount = 0;
      const selectedAnswers: Record<string, boolean> = {};
      const explanations: Record<string, string> = {};
      const correctAnswers: Record<string, string> = {};
      const userAnswers: Record<string, string> = {};

      // Store individual quiz answers for analytics
      for (const answer of submission.questions) {
        const question = quiz.questions.find(q => q.id === answer.questionId);
        if (question) {
          const isCorrect = question.correctAnswer === answer.selectedOptionId;
          if (isCorrect) correctCount++;

          selectedAnswers[answer.questionId] = isCorrect;
          explanations[answer.questionId] = question.explanation || '';
          correctAnswers[answer.questionId] = question.options[question.correctAnswer];
          userAnswers[answer.questionId] = question.options[answer.selectedOptionId];

          // Store individual answer
          await db.add(this.quizAnswersCollection, {
            quizResultId: quizResultId,
            questionId: answer.questionId,
            selectedOptionId: answer.selectedOptionId,
            isCorrect: isCorrect,
            submittedAt: attemptedAt
          });
        }
      }

      const score = Math.round((correctCount / quiz.questions.length) * 100);

      // Update the quiz result with completion details
      await db.update(this.quizResultsCollection, {
        ...quizResult,
        isCompleted: true,
        score: score,
        attemptedAt: attemptedAt,
      });

      // Check for previous high score
      const userResults = await db.query(this.quizResultsCollection, 
        (item: any) => item.userId === userId && item.courseId === quiz.courseId && item.isCompleted
      );
      
      const previousScores = userResults.map((result: any) => result.score || 0);
      const previousHighScore = previousScores.length > 0 ? Math.max(...previousScores) : 0;
      const isNewHighScore = score > previousHighScore;

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
      console.error('❌ Error submitting quiz:', error);
      throw new Error('Failed to submit quiz');
    }
  }

  /**
   * Get leaderboard entries for quizzes
   */
  async getLeaderboard(courseId?: string, topCount: number = 10): Promise<LeaderboardEntry[]> {
    try {
      let allResults = await db.getAll(this.quizResultsCollection);
      
      // Filter by course if specified
      if (courseId) {
        allResults = allResults.filter((result: any) => result.courseId === courseId);
      }
      
      // Filter completed results and group by user
      const completedResults = allResults.filter((result: any) => result.isCompleted);
      const userBestScores = new Map<string, any>();

      for (const result of completedResults) {
        const userId = result.userId;
        const existing = userBestScores.get(userId);
        
        if (!existing || result.score > existing.score) {
          userBestScores.set(userId, result);
        }
      }

      // Convert to leaderboard entries and sort
      const leaderboard: LeaderboardEntry[] = [];
      for (const [userId, result] of userBestScores) {
        const userName = await this.getUserName(userId);
        const course = await db.get(this.coursesCollection, result.courseId);
        leaderboard.push({
          id: `leaderboard_${userId}_${result.courseId}`,
          userId: userId,
          userName: userName,
          score: result.score,
          attemptedAt: result.attemptedAt,
          courseId: result.courseId,
          courseName: course?.title || 'Unknown Course',
          timeTaken: 0 // Not tracked in current implementation
        });
      }

      // Sort by score (descending) and return top entries
      return leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, topCount);

    } catch (error) {
      console.error('❌ Error getting leaderboard:', error);
      throw new Error('Failed to get leaderboard');
    }
  }

  /**
   * Check if a user has attempted a quiz for a course
   */
  async hasAttempted(userId: string, courseId: string): Promise<boolean> {
    try {
      const results = await db.query(this.quizResultsCollection,
        (item: any) => item.userId === userId && item.courseId === courseId
      );
      return results.length > 0;
    } catch (error) {
      console.error('❌ Error checking quiz attempts:', error);
      return false;
    }
  }

  /**
   * Get a user's name from their ID
   */
  private async getUserName(userId: string): Promise<string> {
    try {
      const user = await db.get('users', userId);
      return user?.displayName || 'Anonymous User';
    } catch (error) {
      console.error('Error getting user name:', error);
      return 'Anonymous User';
    }
  }

  /**
   * Parse and clean the JSON response from Ollama
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
   */
  async saveQuizResult(courseId: string, userId: string, score: number): Promise<void> {
    try {
      await db.add(this.quizResultsCollection, {
        courseId,
        userId,
        score,
        isCompleted: true,
        generatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
      throw new Error('Failed to save quiz result');
    }
  }

  /**
   * Get quiz results for a user
   */
  async getUserQuizResults(userId: string): Promise<any[]> {
    try {
      const results = await db.query(this.quizResultsCollection,
        (item: any) => item.userId === userId
      );
      return results;
    } catch (error) {
      console.error('Error getting user quiz results:', error);
      throw new Error('Failed to get user quiz results');
    }
  }

  /**
   * Get user's previous scores for a specific course
   */
  async getUserCourseScores(userId: string, courseId: string): Promise<number[]> {
    try {
      const results = await db.query(this.quizResultsCollection,
        (item: any) => item.userId === userId && item.courseId === courseId && item.isCompleted
      );
      return results.map((result: any) => result.score || 0);
    } catch (error) {
      console.error('Error getting user course scores:', error);
      throw new Error('Failed to get user course scores');
    }
  }

  /**
   * Get detailed quiz analytics for lecturers and admins
   */
  async getQuizAnalytics(courseId?: string): Promise<QuizAnalytics[]> {
    try {
      let allResults = await db.getAll(this.quizResultsCollection);
      
      if (courseId) {
        allResults = allResults.filter((result: any) => result.courseId === courseId);
      }
      
      const completedResults = allResults.filter((result: any) => result.isCompleted);
      
      // Group by course and calculate analytics
      const analytics: QuizAnalytics[] = [];
      const courseGroups = new Map<string, any[]>();
      
      for (const result of completedResults) {
        const key = result.courseId;
        if (!courseGroups.has(key)) {
          courseGroups.set(key, []);
        }
        courseGroups.get(key)!.push(result);
      }
      
      for (const [courseId, results] of courseGroups) {
        const scores = results.map((r: any) => r.score || 0);
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        const course = await db.get(this.coursesCollection, courseId);
        analytics.push({
          quizId: `quiz_${courseId}`,
          courseId,
          courseName: course?.title || 'Unknown Course',
          totalAttempts: results.length,
          averageScore: Math.round(averageScore * 100) / 100,
          questionAnalytics: [],
          attemptsByDate: {},
          scoreDistribution: {
            excellent: scores.filter(s => s >= 90).length,
            good: scores.filter(s => s >= 70 && s < 90).length,
            average: scores.filter(s => s >= 50 && s < 70).length,
            poor: scores.filter(s => s < 50).length
          },
          userResults: [],
          lastUpdated: new Date(Math.max(...results.map((r: any) => new Date(r.attemptedAt).getTime())))
        });
      }
      
      return analytics;
    } catch (error) {
      console.error('Error getting quiz analytics:', error);
      throw new Error('Failed to get quiz analytics');
    }
  }
  
  /**
   * Get analytics for a specific course
   */
  async getCourseQuizAnalytics(courseId: string): Promise<QuizAnalytics | null> {
    try {
      const analytics = await this.getQuizAnalytics(courseId);
      return analytics.length > 0 ? analytics[0] : null;
    } catch (error) {
      console.error('Error getting course quiz analytics:', error);
      throw new Error('Failed to get course quiz analytics');
    }
  }
  
  /**
   * Get detailed user quiz history
   */
  async getUserQuizHistory(userId: string, includeAnswers: boolean = false): Promise<any[]> {
    try {
      const results = await db.query(this.quizResultsCollection,
        (item: any) => item.userId === userId
      );
      
      if (includeAnswers) {
        // Add detailed answer information for each result
        for (const result of results) {
          const answers = await db.query(this.quizAnswersCollection,
            (item: any) => item.quizResultId === result.id
          );
          result.answers = answers;
        }
      }
      
      return results.sort((a: any, b: any) => 
        new Date(b.attemptedAt || b.generatedAt).getTime() - 
        new Date(a.attemptedAt || a.generatedAt).getTime()
      );
    } catch (error) {
      console.error('Error getting user quiz history:', error);
      throw new Error('Failed to get user quiz history');
    }
  }
}

export const quizService = new QuizService();
