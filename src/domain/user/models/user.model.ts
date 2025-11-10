import { UUID } from 'crypto';
import { Role } from '../../../domain/auth/enums/role.enum';

export class User {
  constructor(
    public id: UUID,
    public firstName: string,
    public lastName: string,
    public email: string,
    public password: string,
    public role: Role,
  ) {}
}

export interface GetUsersParams {
  skip?: number;
  take?: number;
}

export interface UpdateUserParams {
  id: UUID;
  user: Partial<User>;
}
