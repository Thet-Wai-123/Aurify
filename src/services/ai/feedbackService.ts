import { GoogleGenerativeAI } from '@google/generative-ai';

// Use Vite env variable for the API key. Create .env with VITE_GOOGLE_API_KEY to enable real AI calls.
const apiKey = (import.meta.env?.VITE_GOOGLE_API_KEY as string) || '';
if (!apiKey) console.warn('[FeedbackService] No API key found. Falling back to heuristic feedback. Set VITE_GOOGLE_API_KEY in your .env to enable AI.');
const genAI = new GoogleGenerativeAI(apiKey);

export interface AIFeedback {
  confidence: number;
  clarity: number;
  empathy: number;
  relevance: number;
  energy: number;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  summary: string;
  overallScore: number;
  detailedAnalysis: {
    structure: string;
    content: string;
    delivery: string;
    impact: string;
  };
}

export interface PracticeContext {
  scenario: string;
  question: string;
  response: string;
  resume?: string;
  jobDescription?: string;
  expectedElements?: string[];
  questionCategory?: string;
}

export interface SessionFeedback {
  overallFeedback: AIFeedback;
  individualResponses: Array<{
    question: string;
    response: string;
    feedback: AIFeedback;
  }>;
  sessionInsights: {
    consistencyScore: number;
    improvementTrend: string;
    keyThemes: string[];
    recommendedFocus: string[];
  };
}

export class FeedbackService {
  private primaryModelId = "models/gemini-2.5-pro";
  private fallbackModelIds = ["models/gemini-1.5-pro", "models/gemini-2.5-flash-lite"];
  private model = genAI.getGenerativeModel({ model: this.primaryModelId });

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
          console.warn(`[FeedbackService] model=${modelId} attempt=${i} failed:`, err?.message || err);
          if (i < attempts) await new Promise(r => setTimeout(r, Math.pow(2, i) * 200));
        }
      }
      console.warn(`[FeedbackService] Falling back from model ${modelId} to next model.`);
    }
    throw new Error('All models failed');
  }

  async analyzeResponse(response: string, context: PracticeContext): Promise<AIFeedback> {
    try {
  const safeResponse = response.slice(0, 4000);
  const safeContext = { ...context, resume: context.resume?.slice(0, 2000), jobDescription: context.jobDescription?.slice(0, 2000) } as PracticeContext;
  const prompt = this.buildAnalysisPrompt(safeResponse, safeContext);
  const result = await this.callGenerateWithRetry(prompt, 3);
  const responseText = result.response.text();

  return this.parseAIResponse(responseText);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackFeedback(response, context);
    }
  }

  async analyzeFullSession(
    responses: Array<{ question: string; response: string; expectedElements?: string[] }>,
    context: { scenario: string; resume?: string; jobDescription?: string }
  ): Promise<SessionFeedback> {
    try {
  // Truncate session data to reasonable size to avoid provider errors
  const safeResponses = responses.map(r => ({ question: r.question, response: r.response.slice(0, 2000), expectedElements: r.expectedElements }));
  const prompt = this.buildSessionAnalysisPrompt(safeResponses as any, { scenario: context.scenario, resume: context.resume?.slice(0, 2000), jobDescription: context.jobDescription?.slice(0, 2000) });
  const result = await this.callGenerateWithRetry(prompt, 3);
  const responseText = result.response.text();

  return this.parseSessionResponse(responseText, responses);
    } catch (error) {
      console.error('Session analysis failed:', error);
      return this.getFallbackSessionFeedback(responses, context);
    }
  }

  private buildAnalysisPrompt(response: string, context: PracticeContext): string {
    return `
    You are an expert interview coach analyzing a candidate's response. Provide detailed, actionable feedback.

    CONTEXT:
    - Scenario: ${context.scenario}
    - Question: ${context.question}
    - Question Category: ${context.questionCategory || 'General'}
    ${context.expectedElements ? `- Expected Elements: ${context.expectedElements.join(', ')}` : ''}
    ${context.resume ? `- Candidate Background: ${context.resume.substring(0, 500)}...` : ''}
    ${context.jobDescription ? `- Target Role: ${context.jobDescription.substring(0, 500)}...` : ''}

    CANDIDATE'S RESPONSE:
    "${response}"

    Analyze this response thoroughly and provide scores (0-100) for:
    1. CONFIDENCE: Voice tone, conviction, self-assurance
    2. CLARITY: Structure, coherence, easy to follow
    3. EMPATHY: Emotional intelligence, understanding others
    4. RELEVANCE: Directly addresses question, job-relevant
    5. ENERGY: Enthusiasm, engagement, passion

    Also provide:
    - 3 specific strengths (what they did well)
    - 3 actionable improvements (specific things to change)
    - 3 concrete suggestions (next steps to improve)
    - Detailed analysis of structure, content, delivery, and impact
    - Overall summary (2-3 sentences)
    - Overall score (0-100)

    Be specific and reference actual parts of their response. Focus on practical, actionable advice.

    Format as JSON:
    {
      "confidence": 85,
      "clarity": 78,
      "empathy": 92,
      "relevance": 88,
      "energy": 75,
      "overallScore": 84,
      "strengths": ["Specific strength with example from response", "Another strength", "Third strength"],
      "improvements": ["Specific improvement with how-to", "Another improvement", "Third improvement"],
      "suggestions": ["Actionable next step", "Another suggestion", "Third suggestion"],
      "detailedAnalysis": {
        "structure": "Analysis of how well-organized the response was",
        "content": "Analysis of the substance and relevance of content",
        "delivery": "Analysis of communication style and confidence",
        "impact": "Analysis of how compelling and memorable the response was"
      },
    "summary": "Comprehensive summary of performance with key takeaways"
    }
    IMPORTANT: Return ONLY valid JSON and nothing else. Do not include commentary or additional text. The JSON must contain numeric scores and arrays described above and be directly parseable with JSON.parse().
    `;
  }

  private buildSessionAnalysisPrompt(
    responses: Array<{ question: string; response: string; expectedElements?: string[] }>,
    context: { scenario: string; resume?: string; jobDescription?: string }
  ): string {
    const sessionData = responses.map((r, i) => 
      `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.response}\n`
    ).join('\n');

    return `
    You are an expert interview coach analyzing a complete ${context.scenario} session. 
    
    CONTEXT:
    - Scenario: ${context.scenario}
    ${context.resume ? `- Candidate Background: ${context.resume.substring(0, 800)}` : ''}
    ${context.jobDescription ? `- Target Role: ${context.jobDescription.substring(0, 800)}` : ''}

    COMPLETE SESSION:
    ${sessionData}

    Provide comprehensive analysis including:
    1. Overall session performance scores
    2. Individual response analysis
    3. Consistency across responses
    4. Improvement trends throughout session
    5. Key themes and patterns
    6. Specific recommendations for future practice

    Format as JSON:
    {
      "overallFeedback": {
        "confidence": 85,
        "clarity": 78,
        "empathy": 92,
        "relevance": 88,
        "energy": 75,
        "overallScore": 84,
        "strengths": ["Session-wide strength 1", "Strength 2", "Strength 3"],
        "improvements": ["Overall improvement 1", "Improvement 2", "Improvement 3"],
        "suggestions": ["Next session focus 1", "Focus 2", "Focus 3"],
        "detailedAnalysis": {
          "structure": "Overall structure analysis",
          "content": "Content quality analysis",
          "delivery": "Delivery consistency analysis",
          "impact": "Overall impact assessment"
        },
        "summary": "Complete session summary with key insights"
      },
      "sessionInsights": {
          "consistencyScore": 85,
          "improvementTrend": "Improved throughout session",
          "keyThemes": ["Theme 1", "Theme 2", "Theme 3"],
          "recommendedFocus": ["Focus area 1", "Focus area 2", "Focus area 3"]
        }
      }

      IMPORTANT: Return ONLY valid JSON and nothing else. The response must be directly parseable with JSON.parse() and contain the keys "overallFeedback" and "sessionInsights" as shown above.
      `;
  }

  private parseAIResponse(text: string): AIFeedback {
    // Robust parsing: try direct JSON, then regex-based extraction, log raw on failure
    try {
      const direct = JSON.parse(text);
      if (direct && typeof direct === 'object') {
        return {
          confidence: direct.confidence || 75,
          clarity: direct.clarity || 75,
          empathy: direct.empathy || 75,
          relevance: direct.relevance || 75,
          energy: direct.energy || 75,
          overallScore: direct.overallScore || 75,
          strengths: direct.strengths || [],
          improvements: direct.improvements || [],
          suggestions: direct.suggestions || [],
          detailedAnalysis: direct.detailedAnalysis || {
            structure: "Analysis not available",
            content: "Analysis not available",
            delivery: "Analysis not available",
            impact: "Analysis not available"
          },
          summary: direct.summary || "Feedback analysis completed."
        };
      }
    } catch (e) {
      // ignore and try regex
    }

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          confidence: parsed.confidence || 75,
          clarity: parsed.clarity || 75,
          empathy: parsed.empathy || 75,
          relevance: parsed.relevance || 75,
          energy: parsed.energy || 75,
          overallScore: parsed.overallScore || 75,
          strengths: parsed.strengths || [],
          improvements: parsed.improvements || [],
          suggestions: parsed.suggestions || [],
          detailedAnalysis: parsed.detailedAnalysis || {
            structure: "Analysis not available",
            content: "Analysis not available",
            delivery: "Analysis not available",
            impact: "Analysis not available"
          },
          summary: parsed.summary || "Feedback analysis completed."
        };
      }
    } catch (e) {
      console.error('[FeedbackService] Failed to parse AI response JSON:', e);
    }

    console.warn('[FeedbackService] Raw AI response (could not parse):', text);
    return this.getFallbackFeedback('', {} as PracticeContext);
  }

  private parseSessionResponse(text: string, responses: Array<{ question: string; response: string }>): SessionFeedback {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          overallFeedback: parsed.overallFeedback,
          individualResponses: responses.map((r, i) => ({
            question: r.question,
            response: r.response,
            feedback: parsed.individualResponses?.[i] || this.getFallbackFeedback(r.response, { scenario: 'Interview', question: r.question, response: r.response })
          })),
          sessionInsights: parsed.sessionInsights || {
            consistencyScore: 75,
            improvementTrend: "Steady performance",
            keyThemes: ["Communication", "Experience"],
            recommendedFocus: ["Practice more examples", "Improve structure"]
          }
        };
      }
    } catch (e) {
      console.error('Failed to parse session response:', e);
    }

    return this.getFallbackSessionFeedback(responses, { scenario: 'Interview' });
  }

  private getFallbackFeedback(response: string, context: PracticeContext): AIFeedback {
    const wordCount = response.split(' ').length;
    const hasMetrics = /\d+/.test(response);
    const hasStructure = response.includes('First') || response.includes('Next') || response.includes('Then');
    const hasExamples = response.includes('example') || response.includes('instance') || response.includes('time when');

    return {
      confidence: Math.min(95, Math.max(40, 60 + (wordCount > 50 ? 15 : 0) + (hasExamples ? 10 : 0))),
      clarity: hasStructure ? 85 : Math.max(50, 70 - (wordCount > 200 ? 10 : 0)),
      empathy: response.toLowerCase().includes('team') || response.toLowerCase().includes('understand') ? 80 : 65,
      relevance: response.toLowerCase().includes(context.scenario?.toLowerCase() || '') ? 85 : 70,
      energy: response.includes('!') || response.includes('excited') || response.includes('passionate') ? 80 : 70,
      overallScore: Math.min(90, Math.max(50, 65 + (hasMetrics ? 10 : 0) + (hasStructure ? 10 : 0) + (hasExamples ? 10 : 0))),
      suggestions: [
        "Include specific metrics and quantifiable results",
        "Use the STAR method (Situation, Task, Action, Result) for better structure",
        "Practice speaking with more confidence and energy"
      ],
      strengths: [
        wordCount > 30 ? "Good response length and detail" : "Concise and to the point",
        hasExamples ? "Used concrete examples" : "Clear communication style",
        hasStructure ? "Well-organized response" : "Direct and focused answer"
      ],
      improvements: [
        "Add more specific examples from your experience",
        "Include quantifiable outcomes and impact metrics",
        "Structure responses with clear beginning, middle, and end"
      ],
      detailedAnalysis: {
        structure: hasStructure ? "Response had good logical flow" : "Could benefit from clearer structure using frameworks like STAR",
        content: hasExamples ? "Good use of specific examples" : "Would benefit from more concrete examples and details",
        delivery: wordCount > 100 ? "Comprehensive response" : "Could be more detailed and thorough",
        impact: hasMetrics ? "Included measurable outcomes" : "Would be stronger with quantifiable results and impact"
      },
      summary: `${hasStructure ? 'Well-structured' : 'Adequate'} response that ${hasExamples ? 'included examples but' : ''} could be strengthened with more specific metrics and ${hasStructure ? 'energy' : 'better organization'}.`
    };
  }

  private getFallbackSessionFeedback(
    responses: Array<{ question: string; response: string }>,
    context: { scenario: string }
  ): SessionFeedback {
    const avgWordCount = responses.reduce((sum, r) => sum + r.response.split(' ').length, 0) / responses.length;
    
    return {
      overallFeedback: this.getFallbackFeedback(
        responses.map(r => r.response).join(' '),
        { scenario: context.scenario, question: 'Session Overview', response: '' }
      ),
      individualResponses: responses.map(r => ({
        question: r.question,
        response: r.response,
        feedback: this.getFallbackFeedback(r.response, { scenario: context.scenario, question: r.question, response: r.response })
      })),
      sessionInsights: {
        consistencyScore: Math.min(90, Math.max(60, 75 + (avgWordCount > 50 ? 10 : -10))),
        improvementTrend: responses.length > 3 ? "Showed improvement throughout session" : "Consistent performance",
        keyThemes: ["Communication skills", "Professional experience", "Problem-solving approach"],
        recommendedFocus: [
          "Practice with more specific examples",
          "Work on quantifying achievements",
          "Improve response structure and flow"
        ]
      }
    };
  }
}

export const feedbackService = new FeedbackService();
