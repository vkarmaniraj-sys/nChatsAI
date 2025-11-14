
declare global {
  namespace Express {
    interface User {}

    interface Request {
      isAuthenticated?: () => boolean;
    }
  }
}

export {};