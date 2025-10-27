import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import {
  GetUsersParams,
  UpdateUserParams,
  User,
} from '../user/models/user.model';

export interface UserProviderI {
  getUsers(
    params: GetUsersParams,
  ): Observable<{ users: User[]; totalUsers: number }>;
  getUserById(id: UUID): Observable<User | null>;
  getUserByEmail(email: string): Observable<User | null>;
  createUser(user: Partial<User>): Observable<User>;
  updateUser(params: UpdateUserParams): Observable<User>;
  deleteUser(id: UUID): Observable<boolean>;
}

export const UserProviderI = Symbol('UserProviderI');
