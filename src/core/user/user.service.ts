import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { PrismaService } from 'src/shared/database/prisma.service';
import { UserFactory } from './user.factory';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  private readonly distDbFilePath: string;

  constructor(private prisma: PrismaService) {}

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.usersWhereUniqueInput;
    where?: Prisma.usersWhereInput;
    orderBy?: Prisma.usersOrderByWithRelationInput;
  }): Promise<{ users: User[]; totalUsers: number }> {
    const { skip, take, cursor, where, orderBy } = params;
    const databaseUsers = await this.prisma.users.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
    const totalUsers = await this.prisma.users.count();
    const users = databaseUsers.map((user) =>
      UserFactory.createFromDatabaseToUser(user),
    );
    console.log(users);
    return { users, totalUsers };
  }

  async user(
    userWhereUniqueInput: Prisma.usersWhereUniqueInput,
  ): Promise<User | null> {
    try {
      const databaseUser = await this.prisma.users.findUnique({
        where: userWhereUniqueInput,
      });
      if (databaseUser) {
        const user = UserFactory.createFromDatabaseToUser(databaseUser);
        return user;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error while finding user:', error);
      throw error;
    }
  }

  async createUser(data: Prisma.usersCreateInput): Promise<User> {
    const newDatabaseUser = await this.prisma.users.create({
      data,
    });
    const newUser = UserFactory.createFromDatabaseToUser(newDatabaseUser);
    return newUser;
  }

  async updateUser(params: {
    where: Prisma.usersWhereUniqueInput;
    data: Prisma.usersUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    const databaseUpdatedUser = await this.prisma.users.update({
      data,
      where,
    });
    const updatedUser =
      UserFactory.createFromDatabaseToUser(databaseUpdatedUser);
    return updatedUser;
  }

  async deleteUser(where: Prisma.usersWhereUniqueInput): Promise<User> {
    const databaseDeletedUser = await this.prisma.users.delete({
      where,
    });
    const deletedUser =
      UserFactory.createFromDatabaseToUser(databaseDeletedUser);
    return deletedUser;
  }

  // findAll(paginationDto: PaginationDto): {
  //     paginatedItems: User[];
  //     totalNumberOfItems: number;
  // } {
  //     const fullData = this.readDbFile();
  //     const paginatedItems = this.paginateData(fullData, paginationDto);
  //     const totalNumberOfItems = fullData.length;
  //     return { paginatedItems, totalNumberOfItems };
  // }

  // generateId(): UUID {
  //     return crypto.randomUUID();
  // }

  // create(newUser: Omit<User, 'id'>): User {
  //     const newId = this.generateId();

  //     const user = { id: newId, ...newUser };

  //     data.push(user);
  //     this.writeDbFile(data);
  //     return user;
  // }

  // update(id: UUID, updatedUser: Partial<User>): User {
  //     const data = this.readDbFile();
  //     const index = data.findIndex((user) => user.id === id);
  //     if (index === -1) {
  //       throw new NotFoundException(`Item with id ${id} not found`);
  //     }
  //     data[index] = {
  //       ...data[index],
  //       ...Object.fromEntries(
  //         Object.entries(updatedUser).filter(([value]) => value !== undefined),
  //       ),
  //     };
  //     this.writeDbFile(data);
  //     return data[index];
  // }

  // delete(id: UUID): { deleted: boolean } {
  //     const data = this.readDbFile();
  //     const index = data.findIndex((user) => user.id === id);
  //     if (index === -1) {
  //       throw new NotFoundException(`User with id ${id} not found`);
  //     }
  //     data.splice(index, 1);
  //     this.writeDbFile(data);
  //     return { deleted: true };
  // }

  // private paginateData(data: User[], paginationDto: PaginationDto): User[] {
  //     const paginatedData: User[] = [];
  //     const skip = (paginationDto.page - 1) * paginationDto.elementsPerPage;
  //     const limit = paginationDto.elementsPerPage;
  //     let paginatedLength = (skip ?? 0) + (limit ?? DEFAULT_PAGE_SIZE);

  //     if (paginatedLength > data.length) {
  //       paginatedLength = data.length;
  //     }

  //     if (skip > data.length) {
  //       throw new Error();
  //     }

  //     for (let index = skip ?? 0; index < paginatedLength; index++) {
  //       paginatedData.push(data[index]);
  //     }
  //     return paginatedData;
  //   }
}
