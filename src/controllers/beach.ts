import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BaseController } from '.';
import logger from '../logger';
import { authMiddleware } from '../middlewares/auth';
import { Beach } from '../models/beach';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController extends BaseController {
  @Post('')
  async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = await new Beach({
        ...req.body,
        ...{ userId: req.decoded?.id },
      }).save();
      res.status(201).send(beach);
    } catch (error) {
      const err = error as mongoose.Error.ValidationError | Error;
      logger.error(error);
      this.sendCreateUpdateErrorResponse(res, err);
    }
  }
}
