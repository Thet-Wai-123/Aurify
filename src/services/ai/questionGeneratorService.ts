import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyDnaWmawIxbto6Tz-py3ovC_uSMOGiRM6c';
const genAI = new GoogleGenerativeAI(apiKey);

export interface SessionContext {
  scenario: string;
  resume?: string;
  jobDescription?: string;
  userProfile?: {
    name?: string;
    experience?: string;
    skills?: string[];
  };
}

export interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedElements: string[];
  followUpQuestions?: string[];
}

export class QuestionGeneratorService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async generateQuestions(context: SessionContext, numQuestions: number = 5): Promise<GeneratedQuestion[]> {
    try {
      const prompt = this.buildQuestionPrompt(context, numQuestions);
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      return this.parseQuestionResponse(responseText);
    } catch (error) {
      console.error('Question generation failed:', error);
      return this.getFallbackQuestions(context.scenario);
    }
  }

  private buildQuestionPrompt(context: SessionContext, numQuestions: number): string {
    return `
    You are an expert interviewer. Generate ${numQuestions} personalized interview questions for a ${context.scenario} scenario.

    ${context.resume ? `CANDIDATE'S RESUME:\n${context.resume}\n` : ''}
    ${context.jobDescription ? `JOB DESCRIPTION:\n${context.jobDescription}\n` : ''}
    
    SCENARIO: ${context.scenario}

    Generate questions that are:
    1. Specific to the candidate's background and the job requirements
    2. Progressive in difficulty (start easier, get more challenging)
    3. Relevant to the scenario type
    4. Designed to assess key competencies for this role

    For each question, also provide:
    - The category (technical, behavioral, situational, etc.)
    - Difficulty level (easy, medium, hard)
    - Key elements a good answer should include

    Format your response as JSON:
    {
      "questions": [
        {
          "question": "Tell me about a time when...",
          "category": "behavioral",
          "difficulty": "medium",
          "expectedElements": ["specific example", "clear outcome", "lessons learned"],
          "followUpQuestions": ["What would you do differently?", "How did this impact the team?"]
        }
      ]
    }

    Make sure questions are:
    - Tailored to their specific experience level and background
    - Relevant to the job they're applying for
    - Appropriate for the interview scenario
    - Designed to elicit detailed, meaningful responses
    `;
  }

  private parseQuestionResponse(text: string): GeneratedQuestion[] {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.questions || [];
      }
    } catch (e) {
      console.error('Failed to parse question response:', e);
    }

    return this.getFallbackQuestions('Interviews');
  }

  private getFallbackQuestions(scenario: string): GeneratedQuestion[] {
    const fallbackQuestions: Record<string, GeneratedQuestion[]> = {
      'Interviews': [
        {
          question: "Tell me about yourself and your background.",
          category: "introduction",
          difficulty: "easy",
          expectedElements: ["relevant experience", "key skills", "career goals"]
        },
        {
          question: "Describe a challenging project you've worked on recently.",
          category: "behavioral",
          difficulty: "medium",
          expectedElements: ["specific challenge", "your approach", "measurable outcome"]
        },
        {
          question: "How do you handle working under pressure or tight deadlines?",
          category: "behavioral",
          difficulty: "medium",
          expectedElements: ["specific strategy", "real example", "positive outcome"]
        },
        {
          question: "Tell me about a time you had to influence someone without direct authority.",
          category: "leadership",
          difficulty: "hard",
          expectedElements: ["context", "influence strategy", "successful outcome"]
        },
        {
          question: "Why are you interested in this role and our company?",
          category: "motivation",
          difficulty: "medium",
          expectedElements: ["company research", "role alignment", "career goals"]
        }
      ],
      'Stand-up Meetings': [
        {
          question: "What did you accomplish yesterday?",
          category: "progress",
          difficulty: "easy",
          expectedElements: ["specific tasks", "outcomes", "blockers resolved"]
        },
        {
          question: "What are your priorities for today?",
          category: "planning",
          difficulty: "easy",
          expectedElements: ["clear priorities", "time estimates", "dependencies"]
        },
        {
          question: "Are there any blockers or challenges you're facing?",
          category: "problem-solving",
          difficulty: "medium",
          expectedElements: ["specific issues", "help needed", "proposed solutions"]
        },
        {
          question: "How does your work align with the sprint goals?",
          category: "alignment",
          difficulty: "medium",
          expectedElements: ["sprint connection", "impact", "progress tracking"]
        },
        {
          question: "What support do you need from the team?",
          category: "collaboration",
          difficulty: "easy",
          expectedElements: ["specific requests", "clear timeline", "mutual benefit"]
        }
      ],
      'Pitching Startups': [
        {
          question: "What problem are you solving and why does it matter?",
          category: "problem",
          difficulty: "easy",
          expectedElements: ["clear problem statement", "market size", "urgency"]
        },
        {
          question: "What's your unique solution and competitive advantage?",
          category: "solution",
          difficulty: "medium",
          expectedElements: ["differentiation", "technology", "barriers to entry"]
        },
        {
          question: "Who is your target customer and how do you reach them?",
          category: "market",
          difficulty: "medium",
          expectedElements: ["customer segments", "acquisition strategy", "validation"]
        },
        {
          question: "What's your business model and revenue projections?",
          category: "business",
          difficulty: "hard",
          expectedElements: ["revenue streams", "unit economics", "growth projections"]
        },
        {
          question: "What funding do you need and how will you use it?",
          category: "funding",
          difficulty: "hard",
          expectedElements: ["funding amount", "use of funds", "milestones"]
        }
      ]
    };

    return fallbackQuestions[scenario] || fallbackQuestions['Interviews'];
  }
}

export const questionGeneratorService = new QuestionGeneratorService();
