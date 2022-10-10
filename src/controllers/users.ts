import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose, { MongooseError } from 'mongoose';
import { BaseController } from '.';
import { User } from '../models/user';

@Controller('users')
export class USersController extends BaseController {
  @Post('')
  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (error) {
      const err = error as mongoose.Error.ValidationError | Error;
      this.sendCreateUpdateErrorResponse(res, err);
    }
  }
}
