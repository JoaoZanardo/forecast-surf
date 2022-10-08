import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Beach } from '../models/beach';

@Controller('beaches')
export class BeachesController {
  @Post('')
  async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach(req.body);
      const result = await beach.save();
      res.status(201).send(result);
    } catch (error) {
      const err = error as Error;
      if (err instanceof mongoose.Error) {
        res.status(422).send({ error: err.message });
      }
    }
  }
}
