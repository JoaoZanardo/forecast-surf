import { ForecastPoint, StormGlass } from '../clients/stormGlass';
import { Beach } from '../models/beach';
import { InternalError } from '../util/errors/internal-error';
import logger from '../logger';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint { }

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    super(`Unexpected error during the forecast processing: ${message}`);
  }
}

export class Forecast {
  constructor(private readonly stormGlass = new StormGlass()) { }

  async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
    const pointsWithCorrecSource = [];
    logger.info(`Preparing forecast for ${beaches.length} beahces`);
    try {
      for (const beach of beaches) {
        const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
        const enrichedBeachData: BeachForecast[] = this.enrichedBeachData(
          points,
          beach
        );
        pointsWithCorrecSource.push(...enrichedBeachData);
      }
      return this.mapForecastByTime(pointsWithCorrecSource);
    } catch (error: unknown) {
      logger.error(error);
      const err = error as Error;
      throw new ForecastProcessingInternalError(err.message);
    }
  }

  private enrichedBeachData(
    points: ForecastPoint[],
    beach: Beach
  ): BeachForecast[] {
    return points.map((point) => ({
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1,
      },
      ...point,
    }));
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];
    for (const point of forecast) {
      const timePoint = forecastByTime.find((value) => {
        return value.time === point.time;
      });

      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }

    return forecastByTime;
  }
}
