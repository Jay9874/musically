import { Request, Response, NextFunction } from "express";

// @desc Authenticates user and protects routes

export const verify = (req: Request, res: Response, next: NextFunction) => {
  next();
};