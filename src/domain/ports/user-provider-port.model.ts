import { Observable } from 'rxjs';
import { UUID } from 'crypto';
import { User } from '../user/models/user.model';
import { PaginationDto } from '../models/dto/pagination.dto';

export interface UserProviderI {
  getUsers(
    params: PaginationDto,
  ): Observable<{ users: User[]; totalUsers: number }>;
  getUserById(id: UUID): Observable<User | null>;
  getUserByEmail(email: string): Observable<User | null>;
  createUser(user: Partial<User>): Observable<User>;
  updateUser(id: UUID, user: Partial<User>): Observable<User>;
  deleteUser(id: UUID): Observable<boolean>;
}

export const UserProviderI = Symbol('UserProviderI');
