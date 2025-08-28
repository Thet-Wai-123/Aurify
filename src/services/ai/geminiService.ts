import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = 'AIzaSyDnaWmawIxbto6Tz-py3ovC_uSMOGiRM6c';

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
}

export interface PracticeContext {
  scenario: string;
  question: string;
  response: string;
  previousResponses?: string[];
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async analyzeResponse(response: string, context: PracticeContext): Promise<AIFeedback> {
    try {
      const prompt = this.buildAnalysisPrompt(response, context);
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      return this.parseAIResponse(responseText);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.getFallbackFeedback(response, context);
    }
  }

  private buildAnalysisPrompt(response: string, context: PracticeContext): string {
    return `
    Analyze this response for a ${context.scenario} scenario.

    Question: ${context.question}
    Response: ${response}

    Please provide a detailed analysis focusing on:
    1. Confidence (0-100)
    2. Clarity (0-100)
    3. Empathy (0-100)
    4. Relevance (0-100)
    5. Energy (0-100)

    Also provide:
    - 3 specific strengths
    - 3 actionable improvements
    - Brief summary (2-3 sentences)

    Format as JSON:
    {
      "confidence": 85,
      "clarity": 78,
      "empathy": 92,
      "relevance": 88,
      "energy": 75,
      "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
      "strengths": ["strength1", "strength2", "strength3"],
      "improvements": ["improvement1", "improvement2", "improvement3"],
      "summary": "summary text"
    }
    `;
  }

  private parseAIResponse(text: string): AIFeedback {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }

    return this.getFallbackFeedback('', {} as PracticeContext);
  }

  private getFallbackFeedback(response: string, context: PracticeContext): AIFeedback {
    const wordCount = response.split(' ').length;
    const hasMetrics = /\d+/.test(response);
    const hasStructure = response.includes('First') || response.includes('Next');

    return {
      confidence: Math.min(90, 60 + wordCount * 2),
      clarity: hasStructure ? 85 : 70,
      empathy: response.includes('understand') || response.includes('feel') ? 85 : 65,
      relevance: response.toLowerCase().includes(context.scenario?.toLowerCase() || '') ? 90 : 75,
      energy: response.includes('!') || response.includes('excited') ? 80 : 70,
      suggestions: [
        "Use more specific examples",
        "Include concrete metrics or outcomes",
        "Practice speaking at a steady pace"
      ],
      strengths: [
        "Good response length",
        "Clear communication",
        "Engaging delivery"
      ],
      improvements: [
        "Add more specific examples",
        "Include quantifiable results",
        "Structure responses with clear points"
      ],
      summary: "Good foundation response. Focus on adding specific examples and metrics to strengthen impact."
    };
  }
}

export const geminiService = new GeminiService();
