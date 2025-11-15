import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    // add any custom session fields here
  }
}
