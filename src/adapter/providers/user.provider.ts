import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { forkJoin, from, map, Observable } from 'rxjs';
import { UserFactory } from '../factories/user.factory';
import { PrismaService } from '../database/prisma.service';
import { UserProviderI } from '../../domain/ports/user-provider-port.model';
import { User } from '../../domain/user/models/user.model';
import { PaginationDto } from '../../domain/models/dto/pagination.dto';

@Injectable()
export class UserProvider implements UserProviderI {
  constructor(private prisma: PrismaService) {}

  getUsers(
    params: PaginationDto,
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

  updateUser(id: UUID, user: Partial<User>): Observable<User> {
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

  deleteUser(id: UUID): Observable<boolean> {
    return from(
      this.prisma.users.delete({
        where: { id },
      }),
    ).pipe(map(() => true));
  }
}
