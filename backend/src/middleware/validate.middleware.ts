import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { AppError } from "../common/errors/AppError.js";

export const validate =
  (schema: ZodObject<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        flield: err.path.join(""),
        message: err.message,
      }));

      throw new AppError(
        errors.map((err) => `${err.flield}: ${err.message}`).join(", "),
        400,
      );
    }

    req.body = result.data;
    next();
  };
