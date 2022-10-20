import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { Application } from 'express';
import { ForecastController } from './controllers/forecast';
import * as database from './database';
import { BeachesController } from './controllers/beach';
import { USersController } from './controllers/users';
import logger from './logger';
import swaggerUi from 'swagger-ui-express';
import apiSchema from './api.schema.json';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { apiErrorValidator } from './middlewares/api-error-validator';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  async init(): Promise<void> {
    this.setupExpress();
    await this.docsSetup();
    this.setupControllers();
    await this.databaseSetup();
    this.setupErrorHandlers();
  }

  private async docsSetup(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: apiSchema as OpenAPIV3.Document,
        validateRequests: true,
        validateResponses: true,
      })
    );
  }

  getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachesController = new BeachesController();
    const usersCrontroller = new USersController();
    this.addControllers([
      forecastController,
      beachesController,
      usersCrontroller,
    ]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }

  async close(): Promise<void> {
    await database.close();
  }

  start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port: ${this.port}`);
    });
  }
}
