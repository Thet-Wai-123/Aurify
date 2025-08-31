import { GoogleGenerativeAI } from '@google/generative-ai';

// Read API key from Vite environment variable for safety. Set VITE_GOOGLE_API_KEY in your .env.
const apiKey = (import.meta.env?.VITE_GOOGLE_API_KEY as string) || '';
if (!apiKey) console.warn('[QuestionGeneratorService] No API key found. Falling back to local questions. Set VITE_GOOGLE_API_KEY in your .env to enable AI.');
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
  // Primary model to use; will fallback to others if it fails
  private primaryModelId = "models/gemini-2.5-pro";
  private fallbackModelIds = ["models/gemini-1.5-pro", "models/gemini-2.5-flash-lite"];
  private model = genAI.getGenerativeModel({ model: this.primaryModelId });

  // Generic helper to call generateContent with retries and model fallbacks
  private async callGenerateWithRetry(prompt: string, attempts = 3) {
    const modelsToTry = [this.primaryModelId, ...this.fallbackModelIds];

    for (const modelId of modelsToTry) {
      const currentModel = genAI.getGenerativeModel({ model: modelId });
      let i = 0;
      while (i < attempts) {
        try {
          const res = await currentModel.generateContent(prompt);
          return res;
        } catch (err: any) {
          i++;
          console.warn(`[QuestionGeneratorService] model=${modelId} attempt=${i} failed:`, err?.message || err);
          if (i < attempts) await new Promise(r => setTimeout(r, Math.pow(2, i) * 200));
        }
      }
      console.warn(`[QuestionGeneratorService] Falling back from model ${modelId} to next model.`);
    }
    throw new Error('All models failed');
  }

  async generateQuestions(context: SessionContext, numQuestions: number = 5): Promise<GeneratedQuestion[]> {
    try {
  // truncate long inputs to reduce request size
  const safeContext = { ...context, resume: context.resume?.slice(0, 2000), jobDescription: context.jobDescription?.slice(0, 2000) };
  const prompt = this.buildQuestionPrompt(safeContext as SessionContext, numQuestions);
  const result = await this.callGenerateWithRetry(prompt, 3);
  const responseText = result.response.text();

  return this.parseQuestionResponse(responseText);
    } catch (error) {
      console.error('Question generation failed:', error);
      return this.getFallbackQuestions(context.scenario);
    }
  }

  /**
   * Generate a single next question given the live session context and conversation history.
   * This ensures every generated question includes the resume and job description when present
   * and uses the last answers as context so the interviewer continues naturally.
   */
  async generateNextQuestion(context: SessionContext, history: Array<{question:string; response:string}> = []): Promise<GeneratedQuestion | null> {
    try {
      const safeContext = { ...context, resume: context.resume?.slice(0, 2000), jobDescription: context.jobDescription?.slice(0, 2000) };
      const prompt = this.buildNextQuestionPrompt(safeContext, history);
      const result = await this.callGenerateWithRetry(prompt, 3);
      const text = result.response.text();

      // parse expected single-question JSON object or wrapped object
      try {
        const direct = JSON.parse(text);
        if (direct?.question) return direct as GeneratedQuestion;
        if (direct?.questions && Array.isArray(direct.questions) && direct.questions.length > 0) return direct.questions[0];
      } catch (e) {
        // try to extract JSON object
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            if (parsed?.question) return parsed as GeneratedQuestion;
            if (parsed?.questions && parsed.questions.length) return parsed.questions[0];
          } catch (err) {
            console.error('[QuestionGeneratorService] parse error for next question:', err);
          }
        }
      }

      console.warn('[QuestionGeneratorService] Raw AI response (could not parse single question):', text);
      // fallback: competency-based question derived from job title or scenario
      return this.getCompetencyFallback(context.scenario, context.jobDescription);
    } catch (error) {
      console.error('[QuestionGeneratorService] generateNextQuestion failed:', error);
      return this.getCompetencyFallback(context.scenario, context.jobDescription);
    }
  }

  private buildNextQuestionPrompt(context: SessionContext, history: Array<{question:string; response:string}>) {
    // Use the last 5 QA pairs as context to keep prompt size reasonable
    const recent = history.slice(-5);
    const convo = recent.map((h, i) => `${i+1}. Q: ${h.question}\nA: ${h.response}`).join('\n');

    return `You are an expert interviewer conducting a realistic, contextual interview.\n\n` +
      `${context.resume ? `CANDIDATE RESUME:\n${context.resume}\n\n` : ''}` +
      `${context.jobDescription ? `JOB DESCRIPTION:\n${context.jobDescription}\n\n` : ''}` +
      `SCENARIO: ${context.scenario}\n` +
      (context.userProfile?.experience ? `CANDIDATE EXPERIENCE: ${context.userProfile.experience}\n` : '') +
      `CONVERSATION HISTORY (most recent first):\n${convo || '(no prior Q/A)'}\n\n` +
      `Task: Based on the candidate resume, job description, and the recent answers above, generate ONE follow-up interview question that flows naturally from the previous answer(s). The question should probe for competency or specifics relevant to the role and the candidate's background. Avoid generic openers like "Tell me about yourself." If you cannot find role- or resume-specific hooks, generate a competency-based question related to the role (for example leadership, prioritization, problem solving) rather than a generic intro.\n\n` +
      `Return ONLY a single JSON object, exactly parseable. Example:\n` +
      `{
  "question": "Describe a time you led a cross-functional team to deliver a project under a tight deadline. What was your role and the outcome?",
  "category": "leadership",
  "difficulty": "medium",
  "expectedElements": ["description of leadership actions","stakeholder management","measured outcome"],
  "followUpQuestions": ["How did you prioritize tasks?","What would you do differently?"]
}
\n` +
      `IMPORTANT: Output must be VALID JSON and nothing else.`;
  }

  private getCompetencyFallback(scenario: string, jobDescription?: string): GeneratedQuestion {
    // Use job description keywords if present to pick a competency; otherwise default to behavioral leadership
    const jd = (jobDescription || '').toLowerCase();
    if (jd.includes('manager') || jd.includes('lead') || jd.includes('team')) {
      return {
        question: 'Describe a time you led a team to deliver a project. What challenges did you face and how did you resolve them?',
        category: 'leadership',
        difficulty: 'medium',
        expectedElements: ['context', 'actions taken', 'outcome']
      };
    }
    if (jd.includes('engineer') || jd.includes('technical') || jd.includes('python') || jd.includes('react')) {
      return {
        question: 'Describe a technically challenging problem you solved. What was the root cause and how did you address it?',
        category: 'technical',
        difficulty: 'medium',
        expectedElements: ['problem description', 'approach', 'measured impact']
      };
    }
    // generic competency fallback
    return {
      question: 'Describe a time you had to prioritize conflicting demands. How did you decide and what was the result?',
      category: 'problem-solving',
      difficulty: 'medium',
      expectedElements: ['criteria used','decision','outcome']
    };
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

    Format your response as JSON (ONLY JSON, no extra text):
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

    Few-shot example (input -> expected JSON):
    INPUT:
    Resume: "Senior frontend engineer with 5 years experience building React apps, led a team of 3, shipped metrics-driven features"
    Job Description: "Frontend engineer role focused on performance and user-facing metrics"

    EXPECTED JSON (excerpt):
    {
      "questions": [
        {
          "question": "Describe a time you improved a page's performance. What approach did you take and what was the impact?",
          "category": "technical",
          "difficulty": "medium",
          "expectedElements": ["profiling approach", "specific change", "measured impact (metrics)"],
          "followUpQuestions": ["How did you validate the improvement?", "What trade-offs did you consider?"]
        }
      ]
    }

    Make sure each generated question references the candidate resume or job description where relevant (e.g., mention their experience level, technologies, or domain), and include clear "expectedElements" that map to resume highlights or JD requirements.

    IMPORTANT: Return ONLY valid JSON and nothing else. The JSON must be directly parseable by JSON.parse() and be a single object with a "questions" array.

  `;
  }

  private parseQuestionResponse(text: string): GeneratedQuestion[] {
    // Try a few robust parsing strategies and log raw response for debugging
    try {
      // Try direct parse
      const direct = JSON.parse(text);
      if (direct?.questions) return direct.questions;
    } catch (err) {
      // ignore
    }

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.questions || [];
      }
    } catch (e) {
      console.error('[QuestionGeneratorService] Failed to parse question response JSON:', e);
    }

    // If parsing failed, log the raw text to help debugging and return fallback
    console.warn('[QuestionGeneratorService] Raw AI response (could not parse):', text);
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
