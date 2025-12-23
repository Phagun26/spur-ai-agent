import sqlite3 from 'sqlite3';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

// For Vercel serverless: use /tmp for writable database
// For local development: use ./data/chat.db
const isVercel = process.env.VERCEL === '1';
const DB_PATH = isVercel 
  ? '/tmp/chat.db'
  : (process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'chat.db'));

// Ensure data directory exists synchronously before opening database
const dataDir = path.dirname(DB_PATH);
if (!existsSync(dataDir)) {
  try {
    mkdirSync(dataDir, { recursive: true });
  } catch (err: any) {
    console.error('Error creating data directory:', err);
  }
}

// Create/connect to local SQLite3 database file
export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log(`✅ Connected to local SQLite database: ${DB_PATH}`);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize schema
db.serialize(() => {
  // Conversations table
  db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    )
  `);

  // Messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  // Create index for faster queries
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
    ON messages(conversation_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_messages_timestamp 
    ON messages(timestamp)
  `);
});

