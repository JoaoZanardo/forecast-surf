import { Beach } from "../models/beach";

export type WithId<T> = { id: string } & T;

export type FilterOptions = Record<string, unknown>;

export interface BaseRepository<T> {
    create(data: T): Promise<WithId<T>>
    find(options: FilterOptions): Promise<WithId<T>[]>
}

export interface BeachRepository extends BaseRepository<Beach> {
    findAllBeachesForUser(userId: string): Promise<WithId<Beach>[]>;
}