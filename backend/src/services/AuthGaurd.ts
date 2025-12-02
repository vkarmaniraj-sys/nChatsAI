import { NextFunction, Request, Response } from "express";

export const AuthGuard = (req: Request, res: Response, next: NextFunction) => {
  console.log("authguard request user", req.user);
  if (req.isAuthenticated && req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: "Login First" });
  }
};
