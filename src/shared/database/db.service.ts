import { NotFoundException } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Identifiable } from '../models/identifiable.model';
import { User } from '../../core/user/user.model';
import { PaginationDto } from '../dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from '../constants';

export abstract class DbService {
  private readonly distDbFilePath: string;

  constructor(path: string) {
    this.distDbFilePath = join(process.cwd(), `src/shared/database/${path}`);
  }

  private readDbFile<T>(): T[] {
    const data = readFileSync(this.distDbFilePath, 'utf-8');
    return JSON.parse(data) as T[];
  }

  private writeDbFile<T>(data: T[]): void {
    writeFileSync(this.distDbFilePath, JSON.stringify(data, null, 2));
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

  findAll<T>(paginationDto: PaginationDto): {
    paginatedItems: T[];
    totalNumberOfItems: number;
  } {
    const fullData = this.readDbFile<T>();
    const paginatedItems = this.paginateData(fullData, paginationDto);
    const totalNumberOfItems = fullData.length;
    return { paginatedItems, totalNumberOfItems };
  }

  findById<T extends Identifiable>(id: number): T | undefined {
    const data = this.readDbFile<T>();
    const item = data.find((item) => item.id === id);
    return item;
  }

  findByEmail(email: string): User | undefined {
    const data = this.readDbFile<User>();
    const user = data.find((user) => user.email === email);
    return user;
  }

  generateId(): number {
    const data = this.readDbFile<Identifiable>();
    return data.length + 1;
  }

  create<T extends Identifiable>(newItem: Omit<T, 'id'>): T {
    const data = this.readDbFile<T>();
    const newId = this.generateId();

    const item = { id: newId, ...newItem } as T;

    data.push(item);
    this.writeDbFile<T>(data);
    return item;
  }

  update<T extends Identifiable>(id: number, updatedItem: Partial<T>): T {
    const data = this.readDbFile<T>();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    data[index] = {
      ...data[index],
      ...Object.fromEntries(
        Object.entries(updatedItem).filter(([value]) => value !== undefined),
      ),
    };
    this.writeDbFile(data);
    return data[index];
  }

  delete<T extends Identifiable>(id: number): { deleted: boolean } {
    const data = this.readDbFile<T>();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    data.splice(index, 1);
    this.writeDbFile(data);
    return { deleted: true };
  }
}
