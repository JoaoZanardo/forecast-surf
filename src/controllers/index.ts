import { Response } from 'express';
import mongoose from 'mongoose';
import ApiError, { APIError } from '../util/errors/api-error';
import logger from '../logger';
import { CUSTOM_VALIDATION } from '../models/user';

export abstract class BaseController {
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error
  ): void {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      this.sendErrorResponse(res, {
        code: clientErrors.code,
        message: clientErrors.error,
      });
      // res
      //  .status(clientErrors.code)
      // .send(ApiError.format({ code: clientErrors.code, error: clientErrors.error }));
    } else {
      logger.error(error);
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
      // res.status(500).send(ApiError.format({ code: 500, error: 'Something went wrong' }));
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

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
