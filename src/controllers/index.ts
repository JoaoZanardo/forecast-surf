import { Response } from 'express';
import mongoose from 'mongoose';
import { CUSTOM_VALIDATION } from '../models/user';

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      console.log(clientErrors);
      res
        .status(clientErrors.code)
        .send({ code: clientErrors.code, error: clientErrors.error });
    } else {
      res.status(500).send({ code: 500, error: 'Something went wrong' });
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError) {
    const duplicatedKindError = Object.values(error.errors).filter((err) => {
      return err.kind === CUSTOM_VALIDATION.DUPLICATED;
    });
    if (duplicatedKindError.length > 0) {
      return { code: 409, error: error.message };
    }

    return { code: 422, error: error.message };
  }
}
