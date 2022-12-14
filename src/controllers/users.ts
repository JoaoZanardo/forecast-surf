import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import AuthService from '../services/auth';
import { BaseController } from '.';
import { User } from '../models/user';
import { authMiddleware } from '../middlewares/auth';

@Controller('users')
export class UsersController extends BaseController {
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
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'User not found!',
      });
    }

    if (!password) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Password is required',
      });
    }

    if (!(await AuthService.comparePasswords(password, user.password))) {
      return this.sendErrorResponse(res, {
        code: 401,
        message: 'Password does not match',
      });
    }

    const token = AuthService.generateToken(user.toJSON());
    res.status(200).send({ token });
  }

  @Get('me')
  @Middleware(authMiddleware)
  async info(req: Request, res: Response): Promise<Response> {
    const email = req.decoded ? req.decoded.email : null;
    const user = await User.findOne({ email });

    if (!user)
      return this.sendErrorResponse(res, {
        code: 404,
        message: 'User not found',
      });

    return res.status(200).send({ user });
  }
}
