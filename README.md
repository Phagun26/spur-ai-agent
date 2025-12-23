# Spur AI Live Chat Agent

A full-stack AI-powered live chat support agent built with SvelteKit and Google Gemini. This application simulates a customer support chat where an AI agent answers user questions about a fictional e-commerce store.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Google AI Studio API key ([Get one here](https://makersuite.google.com/app/apikey))

### Step-by-Step Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google AI API key:
   ```env
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

3. **Run the Application**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   
   Open your browser and navigate to: `http://localhost:5173`

## 📊 Database Setup

The application uses SQLite for simplicity. The database is **automatically created** on first run.

### Database Schema

- **conversations** table: Stores conversation sessions (id, created_at)
- **messages** table: Stores all user and AI messages (id, conversation_id, sender, text, timestamp)

### Database Location

- **Local development**: `./data/chat.db` (auto-created)
- **Vercel deployment**: `/tmp/chat.db` (ephemeral)

### Reset Database

To reset the database, simply delete the `data/chat.db` file and restart the application.

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_AI_API_KEY` | Yes | Google AI Studio API key for Gemini |
| `DATABASE_PATH` | No | Database file path (defaults to `./data/chat.db`) |
| `NODE_ENV` | No | Node environment (defaults to `development`) |

## 🏗️ Architecture Overview

### Backend Structure

The backend uses **SvelteKit API Routes** (serverless functions):

```
src/
├── routes/
│   └── api/                    # API endpoints
│       ├── chat/
│       │   ├── message/        # POST /api/chat/message
│       │   └── history/        # GET /api/chat/history/:sessionId
│       └── health/             # GET /api/health
├── lib/
│   ├── services/
│   │   ├── chatService.ts      # Business logic layer
│   │   └── llmService.ts       # LLM integration layer
│   └── db/
│       └── database.ts         # Data access layer
```

### Design Decisions

1. **SvelteKit API Routes**: Single codebase for frontend and backend, deployed as one unit
2. **SQLite**: Zero-config database for simplicity; easily swappable to PostgreSQL
3. **Session-based Conversations**: UUID-based sessions stored in localStorage for persistence
4. **Conversation Context**: Last 10 messages sent to LLM to maintain context while controlling token usage
5. **Error Handling**: Comprehensive error handling at all layers with user-friendly messages

### Layers

- **API Layer** (`src/routes/api/`): Request handling, validation (Zod), error responses
- **Service Layer** (`src/lib/services/`): Business logic, conversation management, LLM orchestration
- **Data Layer** (`src/lib/db/`): Database operations, schema management

## 🤖 LLM Integration

### Provider

**Google Gemini 2.5 Flash** via Google AI Studio (`@google/generative-ai` SDK)

### Prompting Strategy

1. **System Prompt**: Contains store knowledge base (shipping, returns, support hours, contact info)
2. **Conversation History**: Last 10 messages included for context
3. **Generation Config**:
   - `maxOutputTokens: 500` - Limits response length for cost control
   - `temperature: 0.7` - Balanced creativity and consistency

### Knowledge Base

The AI is pre-configured with information about "SpurStore":
- Shipping policies (free shipping over $50, standard/express options)
- Return/refund policy (30-day window, conditions)
- Support hours (Monday-Friday 9 AM - 6 PM EST, Saturday 10 AM - 4 PM EST)
- Payment methods and contact information

### Trade-offs

- **Pros**: Fast responses, good context understanding, cost-effective (Gemini Flash)
- **Cons**: SQLite on Vercel is ephemeral (data cleared on redeploy), no persistent storage
- **Token Management**: Limited to last 10 messages to balance context vs. cost

## 🚢 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import repository to Vercel
3. Set environment variable: `GOOGLE_AI_API_KEY`
4. Deploy

The application is configured for single-URL deployment on Vercel with `@sveltejs/adapter-vercel`.

## 🔮 If I Had More Time...

1. **Database**: Migrate to PostgreSQL with connection pooling for persistent storage
2. **Streaming Responses**: Implement streaming for better UX during long AI responses
3. **Rate Limiting**: Add rate limiting middleware to prevent abuse
5. **Message Search**: Add search functionality for conversation history
6. **Multi-provider Support**: Abstract LLM layer to support OpenAI, Claude, etc.
7. **Testing**: Add unit tests, integration tests, and E2E tests
8. **Error Monitoring**: Integrate error tracking (Sentry) for production debugging
9. **Caching**: Add Redis caching for frequently asked questions
10. **Admin Dashboard**: Build admin interface to view conversations and manage knowledge base

## 📝 API Endpoints

- `POST /api/chat/message` - Send a message to the AI agent
- `GET /api/chat/history/:sessionId` - Get conversation history
- `GET /api/health` - Health check endpoint

## 📄 License

Built for Spur - Founding Full-Stack Engineer Take-Home Assignment
