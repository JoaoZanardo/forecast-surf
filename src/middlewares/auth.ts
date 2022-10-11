import { NextFunction, Request, Response } from 'express';
import AuthService from '../services/auth';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
): void {
  try {
    const token = req.headers?.['x-access-token'];
    const decoded = AuthService.decodeToken(token as string);
    req.decoded = decoded;
  } catch (error) {
    const err = error as Error;
    res.status?.(401).send({
      code: 401,
      error: err.message,
    });
  }
  next();
}
