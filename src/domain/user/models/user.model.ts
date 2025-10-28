import { UUID } from 'crypto';
import { Role } from 'src/domain/auth/enums/role.enum';

export class User {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;

  constructor(
    id: UUID,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Role,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.role = role;
  }
}

export interface GetUsersParams {
  skip?: number;
  take?: number;
}

export interface UpdateUserParams {
  id: UUID;
  user: Partial<User>;
}
