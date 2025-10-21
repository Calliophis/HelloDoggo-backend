import { Injectable } from "@nestjs/common";
import { DbService } from "../../shared/database/db.service";

@Injectable()
export class UserService extends DbService {
    constructor() {
        super('usersDB.json');
    }
}