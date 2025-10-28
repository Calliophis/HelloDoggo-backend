import { Inject, Injectable } from '@nestjs/common';
import { UserProviderI } from '../ports/user-provider-port.model';
import { Observable, switchMap } from 'rxjs';
import { UUID } from 'crypto';
import { GetUsersParams, UpdateUserParams, User } from './models/user.model';
import { PasswordService } from '../auth/password.service';

@Injectable()
export class UserService {
  constructor(
    private passwordService: PasswordService,
    @Inject(UserProviderI) private userProvider: UserProviderI,
  ) {}

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
    const user = params.user;
    if (user.password) {
      return this.passwordService.hashPassword(user.password).pipe(
        switchMap((hash) => {
          const updatedParams = {
            ...params,
            user: { ...user, password: hash },
          };
          return this.userProvider.updateUser(updatedParams);
        }),
      );
    }
    return this.userProvider.updateUser(params);
  }

  deleteUser(id: UUID): Observable<boolean> {
    return this.userProvider.deleteUser(id);
  }
}
