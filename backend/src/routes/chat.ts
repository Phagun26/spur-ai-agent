import { Router } from 'express';
import { chatService } from '../services/chatService.js';
import { z } from 'zod';

export const chatRouter = Router();

const messageSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().optional()
});

// Get conversation history
chatRouter.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const history = await chatService.getConversationHistory(sessionId);
    res.json({ messages: history });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversation history',
      message: 'An error occurred while fetching the conversation history.'
    });
  }
});

chatRouter.post('/message', async (req, res) => {
  try {
    const validation = messageSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: 'Invalid input',
        details: validation.error.errors 
      });
    }

    const { message, sessionId } = validation.data;
    
    const result = await chatService.handleMessage(message, sessionId);
    
    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    
    if (error instanceof Error) {
      // Check if it's an LLM API error
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return res.status(500).json({ 
          error: 'AI service configuration error',
          message: 'Please check the AI service configuration'
        });
      }
      
      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process message',
      message: 'An error occurred while processing your message. Please try again.'
    });
  }
});

