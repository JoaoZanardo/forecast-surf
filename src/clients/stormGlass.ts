import { AxiosError } from 'axios';
import config, { IConfig } from 'config';
import { TimeUtil } from '../util/time';
import { InternalError } from '../util/errors/internal-error';
import * as HTTPUtil from '../util/request';
import CacheUtil from '../util/cache';
import logger from '../logger';

export interface StormGlassPointSource {
  [key: string]: number;
}

export interface StormGlassPoint {
  readonly time: string;
  readonly swellDirection: StormGlassPointSource;
  readonly swellHeight: StormGlassPointSource;
  readonly swellPeriod: StormGlassPointSource;
  readonly waveDirection: StormGlassPointSource;
  readonly waveHeight: StormGlassPointSource;
  readonly windDirection: StormGlassPointSource;
  readonly windSpeed: StormGlassPointSource;
}

export interface StormGlassForecastResponse {
  hours: StormGlassPoint[];
}

export interface ForecastPoint {
  time: string;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  waveDirection: number;
  waveHeight: number;
  windDirection: number;
  windSpeed: number;
}

export class ClientRequestError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error when trying to communicate to StormGlass';
    super(`${internalMessage}: ${message}`);
  }
}

export class StormGlassResponseError extends InternalError {
  constructor(message: string) {
    const internalMessage =
      'Unexpected error returned by the StormGlass service';
    super(`${internalMessage}: ${message}`);
  }
}

const stormGlassResourceConfig: IConfig = config.get(
  'App.resources.StormGlass'
);

export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
  readonly stormGlassAPISource = 'noaa';

  constructor(
    protected readonly request = new HTTPUtil.Request(),
    protected readonly cacheUtil = CacheUtil
  ) {}

  async fetchPoints(lat: number, lng: number): Promise<ForecastPoint[]> {
    const cacheKey = this.getCacheKey(lat, lng);
    const cachedForecastPoints = this.getForecastPointsFromCache(cacheKey);
    if (!cachedForecastPoints) {
      const forecastPoints = await this.getForecastFromAPi(lat, lng);
      this.setForecastPointsInCache(cacheKey, forecastPoints);
      logger.info(`key ${cacheKey} salved in cahce`);
      return forecastPoints;
    }

    return cachedForecastPoints;
  }

  async getForecastFromAPi(lat: number, lng: number): Promise<ForecastPoint[]> {
    const endTimestamp = TimeUtil.getUnixForAFutureDay(1);
    try {
      const response = await this.request.get<StormGlassForecastResponse>(
        `${stormGlassResourceConfig.get(
          'apiUrl'
        )}/weather/point?lat=${lat}&lng=${lng}&params=${
          this.stormGlassAPIParams
        }&source=${this.stormGlassAPISource}&end=${endTimestamp}`,
        {
          headers: {
            Authorization: stormGlassResourceConfig.get('apiToken'),
          },
        }
      );

      return this.normalizeReponse(response.data);
    } catch (error) {
      const err = error as AxiosError;
      if (HTTPUtil.Request.isRequestError(err)) {
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        throw new StormGlassResponseError(
          `Error: ${JSON.stringify(err.response!.data)} Code: ${
            err.response!.status
          }`
        );
      }
      throw new ClientRequestError(err.message);
    }
  }

  protected getForecastPointsFromCache(
    key: string
  ): ForecastPoint[] | undefined {
    const forecastPointsFromCache = this.cacheUtil.get<ForecastPoint[]>(key);

    if (!forecastPointsFromCache) return;

    logger.info(`Using cache to return forecast points for key: ${key}`);
    return forecastPointsFromCache;
  }

  private getCacheKey(lat: number, lng: number): string {
    return `forecast_points_${lat}_${lng}`;
  }

  private setForecastPointsInCache(
    key: string,
    forecastPoints: ForecastPoint[]
  ): boolean {
    logger.info(`Updating cache to return forecast points for key: ${key}`);
    return this.cacheUtil.set<ForecastPoint[]>(
      key,
      forecastPoints,
      stormGlassResourceConfig.get('cacheTtl')
    );
  }

  private normalizeReponse(
    points: StormGlassForecastResponse
  ): ForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      time: point.time,
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }));
  }

  private isValidPoint(point: Partial<StormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    );
  }
}
