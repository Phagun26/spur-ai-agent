import type { RequestHandler } from '@sveltejs/kit';
import { chatService } from '../../src/lib/services/chatService.js';
import { z } from 'zod';

const messageSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional()
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const validation = messageSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input',
          details: validation.error.errors 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { message, sessionId } = validation.data;
    
    const result = await chatService.handleMessage(message, sessionId);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Chat error:', error);
    
    if (error instanceof Error) {
      // Check if it's an LLM API error
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return new Response(
          JSON.stringify({ 
            error: 'AI service configuration error',
            message: 'Please check the AI service configuration'
          }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
          }),
          { 
            status: 429,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process message',
        message: 'An error occurred while processing your message. Please try again.'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

