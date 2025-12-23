import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Get API key from environment variables
// dotenv loads .env file from root directory
const API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!API_KEY) {
  console.warn('⚠️  GOOGLE_AI_API_KEY not set. LLM features will not work.');
  console.warn('   Make sure .env file exists in the root directory with GOOGLE_AI_API_KEY');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Store knowledge base for the fictional e-commerce store
const STORE_KNOWLEDGE = `
You are a helpful and friendly customer support agent for "SpurStore", a small e-commerce store.

STORE INFORMATION:
- Store Name: SpurStore
- Support Hours: Monday-Friday 9 AM - 6 PM EST, Saturday 10 AM - 4 PM EST
- Shipping Policy: 
  * Free shipping on orders over $50
  * Standard shipping (5-7 business days): $5.99
  * Express shipping (2-3 business days): $12.99
  * We ship to USA, Canada, and select international destinations
- Return/Refund Policy:
  * 30-day return window from date of delivery
  * Items must be unused and in original packaging
  * Refunds processed within 5-7 business days after return is received
  * Free return shipping for orders over $50
- Payment Methods: Credit cards, PayPal, Apple Pay, Google Pay
- Contact: support@spurstore.com or call 1-800-SPUR-HELP

GUIDELINES:
- Answer questions clearly and concisely
- Be friendly and professional
- If you don't know something, admit it and offer to help find the answer
- Keep responses under 200 words unless the question requires more detail
- Use the conversation history to provide contextual answers
`;

class LLMService {
  private model: any;

  constructor() {
    if (genAI) {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  async generateReply(history: Array<{ role: string; content: string }>, userMessage: string): Promise<string> {
    if (!this.model) {
      throw new Error('LLM service not configured. Please set GOOGLE_AI_API_KEY environment variable.');
    }

    try {
      // Build conversation history (last 10 messages for context)
      const conversationHistory = history.slice(-10);
      
      // Prepare history in Gemini format
      const geminiHistory = [
        {
          role: 'user',
          parts: [{ text: STORE_KNOWLEDGE }]
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I\'m ready to help customers with their questions about SpurStore.' }]
        },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        }))
      ];
      
      // Create the chat session
      const chat = this.model.startChat({
        history: geminiHistory,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      // Send the user message
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from LLM');
      }

      return text.trim();
    } catch (error: any) {
      console.error('LLM API error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
        throw new Error('Invalid API key. Please check GOOGLE_AI_API_KEY configuration.');
      }
      
      if (error.message?.includes('quota') || error.message?.includes('rate limit') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      if (error.message?.includes('safety') || error.message?.includes('SAFETY')) {
        throw new Error('Message was blocked by safety filters. Please rephrase your question.');
      }

      // Generic error
      throw new Error(`Failed to generate reply: ${error.message || 'Unknown error'}`);
    }
  }
}

export const llmService = new LLMService();

