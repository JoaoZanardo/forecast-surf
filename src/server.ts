import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { Application } from 'express';
import { ForecastController } from './controllers/forecast';
import * as database from './database';
import { BeachesController } from './controllers/beach';
import { USersController } from './controllers/users';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
  }

  getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
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
      console.log(`Server listening on port: ${this.port}`);
    });
  }
}
