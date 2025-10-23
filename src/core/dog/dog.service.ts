import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_PAGE_SIZE } from '../../shared/constants';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { Dog } from './dog.model';
import { UUID } from 'crypto';

@Injectable()
export class DogService {
  private readonly distDbFilePath: string;

  constructor() {
    this.distDbFilePath = join(
      process.cwd(),
      `src/shared/database/dogsDB.json`,
    );
  }

  private readDbFile(): Dog[] {
    const data = readFileSync(this.distDbFilePath, 'utf-8');
    return JSON.parse(data) as Dog[];
  }

  private writeDbFile(data: Dog[]): void {
    writeFileSync(this.distDbFilePath, JSON.stringify(data, null, 2));
  }

  findAll(paginationDto: PaginationDto): {
    paginatedItems: Dog[];
    totalNumberOfItems: number;
  } {
    const fullData = this.readDbFile();
    const paginatedItems = this.paginateData(fullData, paginationDto);
    const totalNumberOfItems = fullData.length;
    return { paginatedItems, totalNumberOfItems };
  }

  findById(id: UUID): Dog | undefined {
    const data = this.readDbFile();
    const dog = data.find((dog) => dog.id === id);
    return dog;
  }

  generateId(): UUID {
    return crypto.randomUUID();
  }

  create(newDog: Omit<Dog, 'id'>): Dog {
    const data = this.readDbFile();
    const newId = this.generateId();

    const dog = { id: newId, ...newDog };

    data.push(dog);
    this.writeDbFile(data);
    return dog;
  }

  update(id: UUID, updatedDog: Partial<Dog>): Dog {
    const data = this.readDbFile();
    const index = data.findIndex((dog) => dog.id === id);
    if (index === -1) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    data[index] = {
      ...data[index],
      ...Object.fromEntries(
        Object.entries(updatedDog).filter(([value]) => value !== undefined),
      ),
    };
    this.writeDbFile(data);
    return data[index];
  }

  delete(id: UUID): { deleted: boolean } {
    const data = this.readDbFile();
    const index = data.findIndex((dog) => dog.id === id);
    if (index === -1) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    data.splice(index, 1);
    this.writeDbFile(data);
    return { deleted: true };
  }

  private paginateData(data: Dog[], paginationDto: PaginationDto): Dog[] {
    const paginatedData: Dog[] = [];
    const skip = paginationDto.skip;
    const take = paginationDto.take;
    let paginatedLength = (skip ?? 0) + (take ?? DEFAULT_PAGE_SIZE);

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
