import { NextFunction, Request, Response } from 'express'
import ErrorHandler from '../utils/utility-class';
import { ControllerType } from '../types/types';
export const errorMiddleware = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
  err.message = err.message || "Internal server error";
  err.statusCode ||= 500;
  return res.status(err.statusCode).json({
    success: true,
    message: err.message
  })
}
export const TryCatch =
  (func: ControllerType) =>
    (req: Request, res: Response, next: NextFunction) => {
      return Promise.resolve(func(req, res, next)).catch(next);
    };