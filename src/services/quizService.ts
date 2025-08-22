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
      
      // Try to auto-fix common AI model issues
      const fixedQuestionsData = this.attemptAutoFix(questionsData);
      
      // Validate the parsed questions before creating the quiz
      const validationResult = this.validateQuizQuestions(fixedQuestionsData);
      if (!validationResult.isValid) {
        console.error('❌ Quiz validation failed:', validationResult.errors);
        console.error('📋 Raw AI response that failed validation:', questionsJson);
        console.error('🔍 Parsed questions data:', JSON.stringify(fixedQuestionsData, null, 2));
        throw new Error(`Invalid quiz generated: ${validationResult.errors.join(', ')}`);
      }
      
      // Create a new quiz object
      const quiz: Quiz = {
        id: `quiz_ai_${Date.now()}`,
        title: `AI Quiz: ${courseData.title}`,
        courseId: courseId,
        questions: fixedQuestionsData.map(q => ({
          id: `q_${q.id}`,
          question: q.text,
          options: q.options.map(o => o.text),
          correctAnswer: q.options.findIndex(o => o.isCorrect),
          explanation: q.options.find(o => o.isCorrect)?.explanation || ''
        }))
      };

      // Final validation on the created quiz object
      const finalValidation = this.validateFinalQuiz(quiz);
      if (!finalValidation.isValid) {
        console.error('❌ Final quiz validation failed:', finalValidation.errors);
        throw new Error(`Quiz structure invalid: ${finalValidation.errors.join(', ')}`);
      }

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
   * Attempt to automatically fix common AI model response issues
   */
  private attemptAutoFix(questionsData: Array<any>): Array<any> {
    console.log('🔧 Attempting to auto-fix common AI response issues...');
    
    const fixedQuestions = questionsData.map((question, qIndex) => {
      if (!question.options || !Array.isArray(question.options)) {
        return question; // Skip if no options
      }
      
      const correctCount = question.options.filter((opt: any) => opt.isCorrect === true).length;
      
      // Fix 1: If no correct answers, try to infer the correct one
      if (correctCount === 0) {
        console.log(`🔧 Question ${qIndex + 1}: No correct answer found, attempting to infer...`);
        
        // Strategy 1: Look for explanations that suggest correct answers
        let inferredCorrect = -1;
        question.options.forEach((option: any, optIndex: number) => {
          if (option.explanation && 
              (option.explanation.toLowerCase().includes('correct') ||
               option.explanation.toLowerCase().includes('right answer') ||
               option.explanation.toLowerCase().includes('this is because'))) {
            inferredCorrect = optIndex;
          }
        });
        
        // Strategy 2: If still no luck, pick the first option as correct
        // (This is a last resort and will be logged as a warning)
        if (inferredCorrect === -1) {
          inferredCorrect = 0;
          console.warn(`⚠️ Question ${qIndex + 1}: Could not infer correct answer, defaulting to first option`);
        }
        
        // Apply the fix
        question.options.forEach((option: any, optIndex: number) => {
          option.isCorrect = optIndex === inferredCorrect;
        });
        
        console.log(`✅ Question ${qIndex + 1}: Set option ${inferredCorrect + 1} as correct`);
      }
      
      // Fix 2: If multiple correct answers, keep only the first one
      else if (correctCount > 1) {
        console.log(`🔧 Question ${qIndex + 1}: Multiple correct answers found (${correctCount}), keeping first one...`);
        
        let firstCorrectFound = false;
        question.options.forEach((option: any) => {
          if (option.isCorrect === true) {
            if (firstCorrectFound) {
              option.isCorrect = false; // Set subsequent ones to false
            } else {
              firstCorrectFound = true; // Keep the first one
            }
          }
        });
        
        console.log(`✅ Question ${qIndex + 1}: Fixed multiple correct answers`);
      }
      
      return question;
    });
    
    console.log('🔧 Auto-fix process completed');
    return fixedQuestions;
  }

  /**
   * Parse and clean the JSON response from Ollama/different models
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
      console.log('🔍 Raw response received:', rawJson.substring(0, 200) + '...');
      
      let clean = rawJson.trim();
      
      // Step 1: Remove markdown code blocks (more comprehensive)
      // Handle cases like ```json\n...\n``` or ```\n...\n```
      clean = clean.replace(/^```(?:json|JSON)?\s*\n?/gm, '');
      clean = clean.replace(/\n?\s*```\s*$/gm, '');
      
      // Step 2: Look for JSON array in the response
      const arrayMatch = clean.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        clean = arrayMatch[0];
      } else {
        // If no array found, try to extract everything between first [ and last ]
        const start = clean.indexOf('[');
        const end = clean.lastIndexOf(']');
        if (start !== -1 && end !== -1 && end > start) {
          clean = clean.substring(start, end + 1);
        }
      }
      
      // Step 3: Clean up common JSON issues
      // Remove trailing commas
      clean = clean.replace(/,\s*([}\]])/g, '$1');
      // Fix common escaping issues
      clean = clean.replace(/\\n/g, '\\\\n');
      
      // Step 4: Ensure it starts with an array
      if (!clean.startsWith('[')) {
        clean = '[' + clean + ']';
      }
      
      console.log('🧹 Cleaned JSON:', clean.substring(0, 200) + '...');
      
      // Step 5: Parse the JSON
      const parsed = JSON.parse(clean);
      const result = Array.isArray(parsed) ? parsed : [];
      
      console.log(`✅ Successfully parsed ${result.length} questions`);
      return result;
      
    } catch (error) {
      console.error('❌ Error parsing quiz questions JSON:', error);
      console.error('📋 Raw input was:', rawJson);
      
      // Fallback: try to extract questions manually if JSON parsing fails
      try {
        return this.fallbackQuestionExtraction(rawJson);
      } catch (fallbackError) {
        console.error('❌ Fallback extraction also failed:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Validate raw quiz questions data from AI response
   */
  private validateQuizQuestions(questionsData: Array<any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if we have any questions at all
    if (!questionsData || questionsData.length === 0) {
      errors.push("No questions were generated");
      return { isValid: false, errors };
    }
    
    // Validate each question
    questionsData.forEach((question, index) => {
      const questionNum = index + 1;
      
      // Check question structure
      if (!question.id) {
        errors.push(`Question ${questionNum}: Missing ID`);
      }
      
      if (!question.text || typeof question.text !== 'string' || question.text.trim().length === 0) {
        errors.push(`Question ${questionNum}: Missing or invalid question text`);
      }
      
      if (!question.options || !Array.isArray(question.options)) {
        errors.push(`Question ${questionNum}: Missing or invalid options array`);
        return; // Skip further validation for this question
      }
      
      // Check minimum number of options
      if (question.options.length < 2) {
        errors.push(`Question ${questionNum}: Must have at least 2 options (has ${question.options.length})`);
      }
      
      // Check maximum number of options (reasonable limit)
      if (question.options.length > 10) {
        errors.push(`Question ${questionNum}: Too many options (${question.options.length}), maximum is 10`);
      }
      
      // Validate options and check for correct answers
      let correctAnswerCount = 0;
      question.options.forEach((option: any, optIndex: number) => {
        const optionNum = optIndex + 1;
        
        if (!option.id) {
          errors.push(`Question ${questionNum}, Option ${optionNum}: Missing ID`);
        }
        
        if (!option.text || typeof option.text !== 'string' || option.text.trim().length === 0) {
          errors.push(`Question ${questionNum}, Option ${optionNum}: Missing or invalid option text`);
        }
        
        if (typeof option.isCorrect !== 'boolean') {
          errors.push(`Question ${questionNum}, Option ${optionNum}: Missing or invalid isCorrect property`);
        }
        
        if (option.isCorrect === true) {
          correctAnswerCount++;
        }
        
        // Check for explanation on correct answer
        if (option.isCorrect && (!option.explanation || typeof option.explanation !== 'string' || option.explanation.trim().length === 0)) {
          errors.push(`Question ${questionNum}, Option ${optionNum}: Correct answer missing explanation`);
        }
      });
      
      // Validate correct answer count
      if (correctAnswerCount === 0) {
        errors.push(`Question ${questionNum}: No correct answer specified (all options marked as false)`);
      } else if (correctAnswerCount > 1) {
        errors.push(`Question ${questionNum}: Multiple correct answers specified (${correctAnswerCount}), only one allowed`);
      }
    });
    
    console.log(`🔍 Question validation: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`);
    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate the final Quiz object structure
   */
  private validateFinalQuiz(quiz: Quiz): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check quiz structure
    if (!quiz.id || typeof quiz.id !== 'string') {
      errors.push("Quiz missing valid ID");
    }
    
    if (!quiz.title || typeof quiz.title !== 'string' || quiz.title.trim().length === 0) {
      errors.push("Quiz missing valid title");
    }
    
    if (!quiz.courseId || typeof quiz.courseId !== 'string') {
      errors.push("Quiz missing valid course ID");
    }
    
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      errors.push("Quiz missing questions array");
      return { isValid: false, errors };
    }
    
    if (quiz.questions.length === 0) {
      errors.push("Quiz has no questions");
      return { isValid: false, errors };
    }
    
    // Validate each transformed question
    quiz.questions.forEach((question, index) => {
      const questionNum = index + 1;
      
      if (!question.id || typeof question.id !== 'string') {
        errors.push(`Question ${questionNum}: Missing valid ID`);
      }
      
      if (!question.question || typeof question.question !== 'string' || question.question.trim().length === 0) {
        errors.push(`Question ${questionNum}: Missing valid question text`);
      }
      
      if (!question.options || !Array.isArray(question.options)) {
        errors.push(`Question ${questionNum}: Missing options array`);
        return;
      }
      
      if (question.options.length < 2) {
        errors.push(`Question ${questionNum}: Must have at least 2 options`);
      }
      
      // Check that all options are strings
      question.options.forEach((option, optIndex) => {
        if (typeof option !== 'string' || option.trim().length === 0) {
          errors.push(`Question ${questionNum}, Option ${optIndex + 1}: Invalid option text`);
        }
      });
      
      // Validate correct answer index
      if (typeof question.correctAnswer !== 'number') {
        errors.push(`Question ${questionNum}: Missing correct answer index`);
      } else if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
        errors.push(`Question ${questionNum}: Correct answer index (${question.correctAnswer}) is out of range`);
      }
      
      // Check explanation
      if (!question.explanation || typeof question.explanation !== 'string' || question.explanation.trim().length === 0) {
        errors.push(`Question ${questionNum}: Missing explanation for correct answer`);
      }
    });
    
    console.log(`🔍 Final quiz validation: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`);
    if (errors.length > 0) {
      console.log('❌ Final validation errors:', errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Fallback method to extract questions when JSON parsing fails
   */
  private fallbackQuestionExtraction(rawText: string): Array<{
    id: number;
    text: string;
    options: Array<{
      id: number;
      text: string;
      isCorrect: boolean;
      explanation: string;
    }>;
  }> {
    console.log('🔄 Attempting fallback question extraction...');
    
    // Try to find individual question objects using regex
    const questionMatches = rawText.match(/\{[^{}]*"id"\s*:\s*\d+[^{}]*"text"[^{}]*"options"[^{}]*\}/g);
    
    if (questionMatches) {
      const questions = [];
      for (let i = 0; i < questionMatches.length; i++) {
        try {
          const questionObj = JSON.parse(questionMatches[i]);
          questions.push(questionObj);
        } catch (e) {
          console.warn(`⚠️ Could not parse question ${i + 1}:`, e);
        }
      }
      
      if (questions.length > 0) {
        console.log(`✅ Fallback extracted ${questions.length} questions`);
        return questions;
      }
    }
    
    // If all else fails, return empty array
    console.warn('⚠️ Could not extract any questions from response');
    return [];
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
