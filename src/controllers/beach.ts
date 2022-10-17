import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import logger from '../logger';
import { authMiddleware } from '../middlewares/auth';
import { Beach } from '../models/beach';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachesController {
  @Post('')
  async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = await new Beach({
        ...req.body,
        ...{ user: req.decoded?.id },
      }).save();
      res.status(201).send(beach);
    } catch (error) {
      logger.error(error);
      const err = error as Error;
      if (err instanceof mongoose.Error) {
        res.status(422).send({ error: err.message });
      }
    }
  }
}
