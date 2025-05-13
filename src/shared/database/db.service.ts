import { NotFoundException } from '@nestjs/common';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Identifiable } from '../models/identifiable.model';
import { User } from 'src/core/user/user.model';

export class DbService {
  private readonly dbFilePath: string;
  private readonly distDbFilePath: string;

  constructor(path: string) {
    this.dbFilePath = join(process.cwd(), `src/shared/database/${path}`);
    this.distDbFilePath = join(__dirname, '..', path);

    if(!existsSync(this.distDbFilePath)) {
      copyFileSync(this.dbFilePath, this.distDbFilePath);
    }
  }

  private readDbFile<T>(): T[] {
    const data = readFileSync(this.distDbFilePath, 'utf-8');
    return JSON.parse(data) as T[];
  }
 
  private writeDbFile<T>(data: T[]): void {
    writeFileSync(this.distDbFilePath, JSON.stringify(data, null, 2));
  }

  findAll<T>(): T[] {
    return this.readDbFile<T>();
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
    return data.length+1;
  }

  create<T extends Identifiable>(newItem: Omit<T, 'id'>): T {
    const data = this.readDbFile<T>();
    const newId = this.generateId();

    const item = { id: newId, ...newItem} as T;
    
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
        Object.entries(updatedItem).filter(([_, value]) => value !== undefined)
      ) 
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