import { Injectable } from "@nestjs/common";
import { DbService } from "../../shared/database/db.service";

@Injectable()
export class DogService extends DbService {
    constructor() {
        super('dogsDB.json');
    }
}