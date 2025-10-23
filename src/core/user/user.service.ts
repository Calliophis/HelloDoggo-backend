import { Injectable } from '@nestjs/common';
import { User } from './user.model';
import { PrismaService } from 'src/shared/database/prisma.service';
import { UserFactory } from './user.factory';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
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
    const mappedData = UserFactory.mapFromUserToDatabase(data);
    const databaseUpdatedUser = await this.prisma.users.update({
      data: mappedData,
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
}
