import { Inject, Injectable } from '@nestjs/common';
import { UserProviderI } from '../ports/user-provider-port.model';
import { Observable, switchMap } from 'rxjs';
import { UUID } from 'crypto';
import { User } from './models/user.model';
import { PasswordService } from '../auth/password.service';
import { PaginationDto } from '../models/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    private passwordService: PasswordService,
    @Inject(UserProviderI) private userProvider: UserProviderI,
  ) {}

  getUsers(
    params: PaginationDto,
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

  updateUser(id: UUID, user: Partial<User>): Observable<User> {
    if (user.password) {
      return this.passwordService.hashPassword(user.password).pipe(
        switchMap((hash) => {
          user = { ...user, password: hash };
          return this.userProvider.updateUser(id, user);
        }),
      );
    }
    return this.userProvider.updateUser(id, user);
  }

  deleteUser(id: UUID): Observable<boolean> {
    return this.userProvider.deleteUser(id);
  }
}
