import { Controller, Post } from "@overnightjs/core";
import { Request, Response } from "express";

@Controller('beaches')
export class BeachesController {
    @Post('')
    async create(req: Request, res: Response): Promise<void> {
        res.status(201).send({ ...req.body, id: 'FAKE-ID' });
    }
}