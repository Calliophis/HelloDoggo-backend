import { Observable } from 'rxjs';
import { GetUsersParams, UpdateUserParams, User } from '../user/user.model';
import { UUID } from 'crypto';

export interface UserProviderI {
  getUsers(
    params: GetUsersParams,
  ): Observable<{ users: User[]; totalUsers: number }>;
  getUserById(id: UUID): Observable<User | null>;
  getUserByEmail(email: string): Observable<User | null>;
  createUser(user: Partial<User>): Observable<User>;
  updateUser(params: UpdateUserParams): Observable<User>;
  deleteUser(id: UUID): Observable<User>;
}

export const UserProviderI = Symbol('UserProviderI');
