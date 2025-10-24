import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { forkJoin, from, map, Observable } from 'rxjs';
import { PrismaService } from 'src/shared/database/prisma.service';
import { UserFactory } from '../factories/user.factory';
import { UserProviderI } from 'src/core/domain/ports/user-provider-port.model';
import {
  GetUsersParams,
  UpdateUserParams,
  User,
} from 'src/core/domain/user/user.model';

@Injectable()
export class UserProvider implements UserProviderI {
  constructor(private prisma: PrismaService) {}

  getUsers(
    params: GetUsersParams,
  ): Observable<{ users: User[]; totalUsers: number }> {
    const { skip, take } = params;
    return forkJoin([
      from(
        this.prisma.users.findMany({
          skip,
          take,
        }),
      ),
      from(this.prisma.users.count()),
    ]).pipe(
      map(([databaseUsers, totalUsers]) => {
        const users = databaseUsers.map((user) =>
          UserFactory.createFromDatabaseToUser(user),
        );
        return { users, totalUsers };
      }),
    );
  }

  getUserById(id: UUID): Observable<User | null> {
    return from(
      this.prisma.users.findUnique({
        where: { id },
      }),
    ).pipe(
      map((databaseUser) => {
        return databaseUser
          ? UserFactory.createFromDatabaseToUser(databaseUser)
          : null;
      }),
    );
  }

  getUserByEmail(email: string): Observable<User | null> {
    return from(
      this.prisma.users.findUnique({
        where: { email },
      }),
    ).pipe(
      map((databaseUser) => {
        return databaseUser
          ? UserFactory.createFromDatabaseToUser(databaseUser)
          : null;
      }),
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    const mappedUser = UserFactory.mapFromUserToDatabase(user);
    return from(
      this.prisma.users.create({
        data: mappedUser,
      }),
    ).pipe(
      map((databaseUser) => {
        return UserFactory.createFromDatabaseToUser(databaseUser);
      }),
    );
  }

  updateUser(params: UpdateUserParams): Observable<User> {
    const { id, user } = params;
    const mappedData = UserFactory.mapFromUserToDatabase(user);
    return from(
      this.prisma.users.update({
        data: mappedData,
        where: { id },
      }),
    ).pipe(
      map((databaseUser) => {
        return UserFactory.createFromDatabaseToUser(databaseUser);
      }),
    );
  }

  deleteUser(id: UUID): Observable<User> {
    return from(
      this.prisma.users.delete({
        where: { id },
      }),
    ).pipe(
      map((databaseUser) => {
        return UserFactory.createFromDatabaseToUser(databaseUser);
      }),
    );
  }
}
