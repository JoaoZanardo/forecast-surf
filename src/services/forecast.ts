import { ForecastPoint, StormGlass } from "@src/clients/stormGlass";
import { InternalError } from "@src/util/errors/internal-error";

export enum BeachPosition{
    N = 'N',
    S = 'S',
    E = 'E',
    W = 'W'
}

export interface Beach {
    lat: number;
    lng: number;
    name: string;
    position: BeachPosition;
    user: string;
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

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
    constructor(private readonly stormGlass = new StormGlass()) {}

    async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
        const pointsWithCorrecSource = [];
        try {
            for (const beach of beaches) {
                const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
                const enrichedBeachData: BeachForecast[] = this.enrichedBeachData(points, beach);
                pointsWithCorrecSource.push(...enrichedBeachData);
            }
            return this.mapForecastByTime(pointsWithCorrecSource);
        } catch (error: unknown) {
            const err = error as Error;
            throw new ForecastProcessingInternalError(err.message);
        }
    }

    private enrichedBeachData(points: ForecastPoint[], beach: Beach): BeachForecast[] {
        return points.map(point => ({
            ... {
                lat: beach.lat,
                lng: beach.lng,
                name: beach.name,
                position: beach.position,
                rating: 1
            },
            ...point
         }));
    }

    private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
        const forecastByTime: TimeForecast[] = [];
        for (const point of forecast) {
            const timePoint =  forecastByTime.find(value => {
                return value.time === point.time;
            });

            if (timePoint) {
                timePoint.forecast.push(point);
            } else {
                forecastByTime.push({
                    time: point.time,
                    forecast: [point]
                });
            }
        }
        
        return forecastByTime;
    }
}