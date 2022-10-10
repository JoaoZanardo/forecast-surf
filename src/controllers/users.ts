import { Controller, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AuthService from '../services/auth';
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

  @Post('authenticate')
  async authenticate(req: Request, res: Response): Promise<Response | void> {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send({
        code: 401,
        error: 'User not found!',
      });
    }

    if (!password) {
      return res.status(422).send({
        code: 422,
        error: 'Password is required',
      });
    }

    if (!(await AuthService.comparePasswords(password, user.password))) {
      return res.status(401).send({
        code: 401,
        error: 'Passwords do not match!',
      });
    }

    const token = AuthService.generateToken(user.toJSON());
    res.status(200).send({ token });
  }
}
