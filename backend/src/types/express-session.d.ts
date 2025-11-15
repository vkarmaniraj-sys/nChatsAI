import "express-session";

declare module "express-session" {
  interface SessionData {
    Userid?: string;
    user?: any; // Add this line to allow 'user' property on session
    passport?: any; // Add this line to allow 'passport' property on session
  }
}
