import { Injectable, NotFoundException } from "@nestjs/common";
import { join } from "path";
import { readFileSync, writeFileSync } from "fs";
import { User } from "./user.model";
import { PaginationDto } from "../../shared/dto/pagination.dto";
import { DEFAULT_PAGE_SIZE } from "../../shared/constants";

@Injectable()
export class UserService {
    private readonly distDbFilePath: string;

    constructor() {
        this.distDbFilePath = join(process.cwd(), `src/shared/database/usersDB.json`);
    }

    private readDbFile(): User[] {
        const data = readFileSync(this.distDbFilePath, 'utf-8');
        return JSON.parse(data) as User[];
    }

    private writeDbFile<T>(data: T[]): void {
        writeFileSync(this.distDbFilePath, JSON.stringify(data, null, 2));
    }

    findAll(paginationDto: PaginationDto): {
        paginatedItems: User[];
        totalNumberOfItems: number;
    } {
        const fullData = this.readDbFile();
        const paginatedItems = this.paginateData(fullData, paginationDto);
        const totalNumberOfItems = fullData.length;
        return { paginatedItems, totalNumberOfItems };
    }

    findByEmail(email: string): User | undefined {
        const data = this.readDbFile();
        const user = data.find((user) => user.email === email);
        return user;
    }

    findById(id: number): User | undefined {
        const data = this.readDbFile();
        const item = data.find((item) => item.id === id);
        return item;
    }

    generateId(): number {
        const data = this.readDbFile();
        return data.length + 1;
    }
    
    create(newUser: Omit<User, 'id'>): User {
        const data = this.readDbFile();
        const newId = this.generateId();
    
        const item = { id: newId, ...newUser };
    
        data.push(item);
        this.writeDbFile(data);
        return item;
    }

    update(id: number, updatedUser: Partial<User>): User {
        const data = this.readDbFile();
        const index = data.findIndex((item) => item.id === id);
        if (index === -1) {
          throw new NotFoundException(`Item with id ${id} not found`);
        }
        data[index] = {
          ...data[index],
          ...Object.fromEntries(
            Object.entries(updatedUser).filter(([value]) => value !== undefined),
          ),
        };
        this.writeDbFile(data);
        return data[index];
    }

    delete(id: number): { deleted: boolean } {
        const data = this.readDbFile();
        const index = data.findIndex((item) => item.id === id);
        if (index === -1) {
          throw new NotFoundException(`Item with id ${id} not found`);
        }
        data.splice(index, 1);
        this.writeDbFile(data);
        return { deleted: true };
    }

    private paginateData<T>(data: T[], paginationDto: PaginationDto): T[] {
        const paginatedData: T[] = [];
        const skip = (paginationDto.page - 1) * paginationDto.elementsPerPage;
        const limit = paginationDto.elementsPerPage;
        let paginatedLength = (skip ?? 0) + (limit ?? DEFAULT_PAGE_SIZE);
    
        if (paginatedLength > data.length) {
          paginatedLength = data.length;
        }
    
        if (skip > data.length) {
          throw new Error();
        }
    
        for (let index = skip ?? 0; index < paginatedLength; index++) {
          paginatedData.push(data[index]);
        }
        return paginatedData;
      }
}