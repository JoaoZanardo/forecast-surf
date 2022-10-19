import { ForecastPoint } from "../clients/stormGlass";
import { Beach, GeoPosition } from "../models/beach";

const waveHeights = {
    ankleToKnee: {
        min: 0.3,
        max: 1,
    },
    waistHigh: {
        min: 1,
        max: 2,
    },
    headHigh: {
        min: 2,
        max: 2.5,
    }
}

export class Rating {
    constructor(private readonly beach: Beach) { }

    public getRateForPoint(point: ForecastPoint): number {
        const swellDirection = this.getPositionFromLocation(point.swellDirection);
        const windDirection = this.getPositionFromLocation(point.windDirection);
        const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
            swellDirection,
            windDirection
        );
        const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
        const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);
        const finalRating =
            (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3;
        return Math.round(finalRating);
    }

    getRatingBasedOnWindAndWavePositions(waveDirection: GeoPosition, windDirection: GeoPosition): number {
        // if wind is onshore, low rating
        if (waveDirection === windDirection) {
            return 1;
        } else if (this.isWindOffShore(waveDirection, windDirection)) {
            return 5;
        }
        // cross winds gets 3
        return 3;
    }

    getRatingForSwellPeriod(period: number): number {
        if (period <= 5) return 1;
        if (period <= 9) return 2;
        if (period <= 12) return 4;
        return 5;
    }

    getRatingForSwellSize(height: number): number {
        if (height >= waveHeights.ankleToKnee.min && height < waveHeights.ankleToKnee.max) return 2;
        if (height >= waveHeights.waistHigh.min && height < waveHeights.waistHigh.max) return 3;
        if (height >= waveHeights.headHigh.min) return 5;
        return 1;
    }

    getPositionFromLocation(coordirnades: number): GeoPosition {
        if (coordirnades >= 157.5 && coordirnades <= 202.5) return GeoPosition.S;
        if (coordirnades >= 45 && coordirnades <= 135) return GeoPosition.E;
        if (coordirnades >= 225 && coordirnades <= 315) return GeoPosition.W;
        return GeoPosition.N;
    }

    private isWindOffShore(
        waveDirection: string,
        windDirection: string
    ): boolean {
        return (
            (waveDirection === GeoPosition.N &&
                windDirection === GeoPosition.S &&
                this.beach.position === GeoPosition.N) ||
            (waveDirection === GeoPosition.S &&
                windDirection === GeoPosition.N &&
                this.beach.position === GeoPosition.S) ||
            (waveDirection === GeoPosition.E &&
                windDirection === GeoPosition.W &&
                this.beach.position === GeoPosition.E) ||
            (waveDirection === GeoPosition.W &&
                windDirection === GeoPosition.E &&
                this.beach.position === GeoPosition.W)
        );
    }
}