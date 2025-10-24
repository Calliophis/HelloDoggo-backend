import { Inject, Injectable } from '@nestjs/common';
import { GetUsersParams, UpdateUserParams, User } from './user.model';
import { UserProviderI } from '../ports/user-provider-port.model';
import { Observable } from 'rxjs';
import { UUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(@Inject(UserProviderI) private userProvider: UserProviderI) {}

  getUsers(
    params: GetUsersParams,
  ): Observable<{ users: User[]; totalUsers: number }> {
    return this.userProvider.getUsers(params);
  }

  getUserById(id: UUID): Observable<User | null> {
    return this.userProvider.getUserById(id);
  }

  getUserByEmail(email: string): Observable<User | null> {
    return this.userProvider.getUserByEmail(email);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.userProvider.createUser(user);
  }

  updateUser(params: UpdateUserParams): Observable<User> {
    return this.userProvider.updateUser(params);
  }

  deleteUser(id: UUID): Observable<User> {
    return this.userProvider.deleteUser(id);
  }
}
