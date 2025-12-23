import type { RequestHandler } from '@sveltejs/kit';
import { chatService } from '../../../../../lib/services/chatService.js';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const sessionId = params.sessionId;
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const history = await chatService.getConversationHistory(sessionId);
    
    return new Response(
      JSON.stringify({ messages: history }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error fetching history:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch conversation history',
        message: 'An error occurred while fetching the conversation history.'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

