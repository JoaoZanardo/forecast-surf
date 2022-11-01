import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BeachRepository } from '../repositories';
import { BaseController } from '.';
import logger from '../logger';
import { authMiddleware } from '../middlewares/auth';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  constructor(private beachRepository: BeachRepository) {
    super();
  }

  @Post('')
  async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = await this.beachRepository.create(
        {
          ...req.body,
          ...{ userId: req.decoded?.id }
        }
      );

      res.status(201).send(beach);
    } catch (error) {
      const err = error as mongoose.Error.ValidationError | Error;
      logger.error(error);
      this.sendCreateUpdateErrorResponse(res, err);
    }
  }
}
