import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Dog } from './dog.model';
import { UUID } from 'crypto';
import { PrismaService } from 'src/shared/database/prisma.service';
import { Prisma } from '@prisma/client';
import { DogFactory } from 'src/core/adapter/factories/dog.factory';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { DEFAULT_PAGE_SIZE } from 'src/shared/constants';

@Injectable()
export class DogService {
  private readonly distDbFilePath: string;

  constructor(private prisma: PrismaService) {
    this.distDbFilePath = join(
      process.cwd(),
      `src/shared/database/dogsDB.json`,
    );
  }

  async dogs(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.dogsWhereUniqueInput;
    where?: Prisma.dogsWhereInput;
    orderBy?: Prisma.dogsOrderByWithRelationInput;
  }): Promise<{ dogs: Dog[]; totalDogs: number }> {
    const { skip, take, cursor, where, orderBy } = params;
    const databaseDogs = await this.prisma.dogs.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
    const totalDogs = await this.prisma.dogs.count();
    const dogs = databaseDogs.map((dog) =>
      DogFactory.createFromDatabaseToDog(dog),
    );
    return { dogs, totalDogs };
  }

  async dog(
    dogWhereUniqueInput: Prisma.dogsWhereUniqueInput,
  ): Promise<Dog | null> {
    try {
      const databaseDog = await this.prisma.dogs.findUnique({
        where: dogWhereUniqueInput,
      });
      if (databaseDog) {
        const dog = DogFactory.createFromDatabaseToDog(databaseDog);
        return dog;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error while finding dog:', error);
      throw error;
    }
  }

  async createDog(data: Prisma.dogsCreateInput): Promise<Dog> {
    const newDatabaseDog = await this.prisma.dogs.create({
      data,
    });
    const newDog = DogFactory.createFromDatabaseToDog(newDatabaseDog);
    return newDog;
  }

  async updateDog(params: {
    where: Prisma.dogsWhereUniqueInput;
    data: Prisma.dogsUpdateInput;
  }): Promise<Dog> {
    const { where, data } = params;
    const mappedData = DogFactory.mapFromDogToDatabase(data);
    const databaseUpdatedDog = await this.prisma.dogs.update({
      data: mappedData,
      where,
    });
    const updatedDog = DogFactory.createFromDatabaseToDog(databaseUpdatedDog);
    return updatedDog;
  }

  async deleteDog(where: Prisma.dogsWhereUniqueInput): Promise<Dog> {
    const databaseDeletedDog = await this.prisma.dogs.delete({
      where,
    });
    const deletedDog = DogFactory.createFromDatabaseToDog(databaseDeletedDog);
    return deletedDog;
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
