import { Model, Error } from "mongoose";
import { CUSTOM_VALIDATION } from "../models/user";
import { FilterOptions, WithId } from ".";
import { BaseModel } from "../models";
import { DatabaseInternalError, DatabaseUnknownClientError, DatabaseValidationError, Repository } from "./repository";
import logger from "../logger";

export abstract class DefaultMongoDBRespository<T extends BaseModel> extends Repository<T> {
    constructor(private model: Model<T>) {
        super();
    }

    async create(data: T): Promise<any> { //Promise<WithId<T>>
        try {
            const model = new this.model(data);
            const createdData = await model.save();
            return createdData.toJSON<WithId<T>>();
        } catch (error) {
            this.handleError(error);
        }
    }

    async find(filter: FilterOptions): Promise<any> {
        try {
            const data = await this.model.find(filter);
            return data.map(d => d.toJSON<WithId<T>>());
        } catch (error) {
            this.handleError(error);
        }
    }

    protected handleError(error: unknown): never {
        if (error instanceof Error.ValidationError) {
            const duplicatedKindErrors = Object.values(error.errors).filter(
                (err) =>
                    err.name === 'ValidatorError' &&
                    err.kind === CUSTOM_VALIDATION.DUPLICATED
            );
            if (duplicatedKindErrors.length) {
                throw new DatabaseValidationError(error.message);
            }
            throw new DatabaseUnknownClientError(error.message);
        }
        logger.warn('Database error', error);
        throw new DatabaseInternalError(
            'Something unexpected happened to the database'
        );
    }
}