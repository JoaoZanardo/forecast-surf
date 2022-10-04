import { ForecastPoint, StormGlass } from "@src/clients/stormGlass";

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

export class Forecast {
    constructor(private readonly stormGlass = new StormGlass()) {}

    async processForecastForBeaches(beaches: Beach[]): Promise<BeachForecast[]> {
        const pointsWithCorrecSource = [];
        for (const beach of beaches) {
            const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
            const enrichedBeachData: BeachForecast[] = points.map(point => ({
                ... {
                    lat: beach.lat,
                    lng: beach.lng,
                    name: beach.name,
                    position: beach.position,
                    rating: 1
                },
                ...point
             }));

             pointsWithCorrecSource.push(...enrichedBeachData);
        }
        return pointsWithCorrecSource;
    }
}