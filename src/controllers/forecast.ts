import {
  ClassMiddleware,
  Controller,
  Get,
  Middleware,
} from '@overnightjs/core';
import { Request, Response } from 'express';
import { Forecast } from '../services/forecast';
import { authMiddleware } from '../middlewares/auth';
import logger from '../logger';
import { BaseController } from '.';
import rateLimit from 'express-rate-limit';
import ApiError from '../util/errors/api-error';
import { BeachRepository } from '../repositories';

const forecast = new Forecast();

const rateLimiter = rateLimit({
  windowMs: 7.2e6, // 2 hours
  max: 1,
  keyGenerator(req: Request): string {
    return req.ip;
  },
  handler(_, res: Response): void {
    res.status(429).send(
      ApiError.format({
        code: 429,
        message: 'Too many requests to the /forecast endpoint',
      })
    );
  },
});

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(private beachRepository: BeachRepository) {
    super();
  }

  @Get('')
  @Middleware(rateLimiter)
  async getForecastForLoggedUser(req: Request, res: Response): Promise<void | null> {
    try {
      if (!req.decoded?.id) {
        this.sendErrorResponse(res, {
          code: 500,
          message: 'Something went wrong'
        });
        logger.error('Missing userId');
        return
      }

      const beaches = await this.beachRepository.findAllBeachesForUser(req.decoded?.id);
      const forecastData = await forecast.processForecastForBeaches(beaches);

      res.status(200).send(forecastData);
    } catch (error) {
      logger.error(error);
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
