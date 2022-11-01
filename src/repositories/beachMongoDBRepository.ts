import { BeachRepository } from ".";
import { Beach } from "../models/beach";
import { DefaultMongoDBRespository } from "./defaultMongoDBRepository";

export class BeachMongoDBRepository extends DefaultMongoDBRespository<Beach> implements BeachRepository {
    constructor(private BeachModel = Beach) {
        super(BeachModel);
    }

    async findAllBeachesForUser(userId: string): Promise<any> {
        return await this.find({ userId });
    }
}