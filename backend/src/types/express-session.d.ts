import "express-session";

declare module "express-session" {
  interface SessionData {
    Userid?: string;
    user?: any;
    passport?: any;
  }
}
