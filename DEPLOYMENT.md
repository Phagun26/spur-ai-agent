# Deployment Guide - Vercel

This project is configured for deployment on Vercel as a single application (frontend + backend in one URL).

## Prerequisites

1. GitHub account (or GitLab/Bitbucket)
2. Vercel account ([Sign up here](https://vercel.com))
3. Google AI Studio API key

## Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect SvelteKit
5. Configure environment variables (see below)
6. Click **"Deploy"**

#### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts to deploy.

### 3. Environment Variables

In the Vercel dashboard, go to your project → Settings → Environment Variables and add:

```
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

**Note**: The database path is automatically set to `/tmp/chat.db` on Vercel (no need to set `DATABASE_PATH`).

### 4. Verify Deployment

After deployment, Vercel will provide you with a URL like:
```
https://your-project.vercel.app
```

Visit the URL to test the application.

## Important Notes

### Database Persistence

⚠️ **SQLite on Vercel is ephemeral**:
- Database is stored in `/tmp` which is cleared on each deployment
- Data is **NOT persistent** across deployments
- Each serverless function instance has its own database

**For production with persistent data**, you should:
1. Use a managed database (Supabase, Neon, PlanetScale, etc.)
2. Update `src/lib/db/database.ts` to use the remote database
3. Remove SQLite dependency

### Local Development

For local development, the database will be created at `./data/chat.db`:

```bash
npm install
cp .env.example .env
# Edit .env and add GOOGLE_AI_API_KEY
npm run dev
```

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure `GOOGLE_AI_API_KEY` is set in Vercel environment variables
- Check Vercel build logs for specific errors

### API Routes Not Working

- Verify routes are in `api/` directory
- Check that routes export `GET`, `POST`, etc. handlers
- Ensure routes follow SvelteKit API route conventions

### Database Errors

- On Vercel, database uses `/tmp/chat.db` automatically
- For local dev, ensure `data/` directory is writable
- Check file permissions

## Custom Domain

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Environment Variables Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `GOOGLE_AI_API_KEY` | Yes | Google AI Studio API key | - |
| `DATABASE_PATH` | No | Database file path | `./data/chat.db` (local) or `/tmp/chat.db` (Vercel) |
| `NODE_ENV` | No | Node environment | `development` |

