import { Prisma, users as PrismaUser } from '@prisma/client';
import { UUID } from 'crypto';
import { Role } from '../../domain/auth/enums/role.enum';
import { User } from '../../domain/user/models/user.model';

export type DatabaseUser = PrismaUser;

export class UserFactory {
  static createFromDatabaseToUser(databaseUser: DatabaseUser): User {
    return new User(
      databaseUser.id as UUID,
      databaseUser.first_name,
      databaseUser.last_name,
      databaseUser.email,
      databaseUser.password,
      this.mapDatabaseRoleToRole(databaseUser.role),
    );
  }

  static mapDatabaseRoleToRole(databaseRole: string): Role {
    switch (databaseRole) {
      case 'user':
        return Role.USER;
      case 'editor':
        return Role.EDITOR;
      case 'admin':
        return Role.ADMIN;
      default:
        throw new Error('Role not found');
    }
  }

  static mapFromUserToDatabase(
    updatedUser: Prisma.usersUpdateInput,
  ): Partial<DatabaseUser> {
    const mapping: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      password: 'password',
      role: 'role',
    };

    const updatedDatabaseUser: Partial<DatabaseUser> = {};

    for (const [key, value] of Object.entries(updatedUser)) {
      if (value !== undefined && value !== null && value !== '') {
        updatedDatabaseUser[mapping[key]] = value;
      }
    }
    return updatedDatabaseUser;
  }
}
