import { BaseRepository, FilterOptions, WithId } from ".";

export class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class DatabaseValidationError extends DatabaseError { }
export class DatabaseUnknownClientError extends DatabaseError { }
export class DatabaseInternalError extends DatabaseError { }

export abstract class Repository<T> implements BaseRepository<T> {
    abstract create(data: T): Promise<WithId<T>>;
    abstract find(options: FilterOptions): Promise<WithId<T>[]>;
}