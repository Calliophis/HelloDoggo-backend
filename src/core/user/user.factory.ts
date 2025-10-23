import { users as PrismaUser } from '@prisma/client';
import { User } from './user.model';
import { UUID } from 'crypto';
import { Role } from '../auth/enums/role.enum';

export type DatabaseUser = PrismaUser;

export class UserFactory {
  static createFromDatabaseToUser(databaseUser: DatabaseUser): User {
    return new User(
      databaseUser.id as UUID,
      databaseUser.first_name ?? '',
      databaseUser.last_name ?? '',
      databaseUser.email ?? '',
      databaseUser.password ?? '',
      this.mapDatabaseRoleToRole(databaseUser.role ?? 'user'),
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
}
