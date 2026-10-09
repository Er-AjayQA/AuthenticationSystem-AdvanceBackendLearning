import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";
import { AppError } from "../common/errors/AppError.js";

type validateTarget = "query" | "params" | "body";

export const validate =
  (schema: ZodObject<any>, target: validateTarget = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const data = req[target];

    const result = schema.safeParse(data);

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

    req[target] = result.data;
    next();
  };
