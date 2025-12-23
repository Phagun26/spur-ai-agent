import { db } from '../db/database.js';
import { llmService } from './llmService.js';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

class ChatService {
  async handleMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    // Get or create conversation
    let conversationId = sessionId;
    
    if (!conversationId) {
      conversationId = await this.createConversation();
    } else {
      // Verify conversation exists
      const exists = await this.conversationExists(conversationId);
      if (!exists) {
        conversationId = await this.createConversation();
      }
    }

    // Save user message
    await this.saveMessage(conversationId, 'user', message);

    // Get conversation history for LLM
    const history = await this.getConversationHistoryForAPI(conversationId);

    // Generate AI reply
    const reply = await llmService.generateReply(history, message);

    // Save AI message
    await this.saveMessage(conversationId, 'ai', reply);

    return {
      reply,
      sessionId: conversationId
    };
  }

  private async createConversation(): Promise<string> {
    const id = uuidv4();
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO conversations (id, created_at) VALUES (?, ?)',
        [id, new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve(id);
        }
      );
    });
  }

  private async conversationExists(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM conversations WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  }

  private async saveMessage(conversationId: string, sender: 'user' | 'ai', text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      db.run(
        'INSERT INTO messages (id, conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)',
        [id, conversationId, sender, text, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id, conversation_id, sender, text, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
        [conversationId],
        (err, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const messages: ChatMessage[] = rows.map(row => ({
              id: row.id,
              conversationId: row.conversation_id,
              sender: row.sender,
              text: row.text,
              timestamp: row.timestamp
            }));
            resolve(messages);
          }
        }
      );
    });
  }

  async getConversationHistoryForAPI(conversationId: string): Promise<Array<{ role: string; content: string }>> {
    const history = await this.getConversationHistory(conversationId);
    return history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      content: msg.text
    }));
  }
}

export const chatService = new ChatService();
