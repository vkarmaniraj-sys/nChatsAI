import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    // Add your custom session properties here
    userId?: string;
    // ... other properties you use
  }
}