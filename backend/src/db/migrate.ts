// Migration script - database is auto-initialized, but this can be used for manual migrations
import { db } from './database.js';

console.log('Database schema initialized.');
console.log('Tables: conversations, messages');

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
    process.exit(1);
  } else {
    console.log('Database connection closed.');
    process.exit(0);
  }
});

