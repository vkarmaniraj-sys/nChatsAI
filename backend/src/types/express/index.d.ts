
declare global {
  namespace Express {
    interface User {}

    interface Request {
      sessionID: string;
      isAuthenticated?: () => boolean;
    }
  }
}

export {};