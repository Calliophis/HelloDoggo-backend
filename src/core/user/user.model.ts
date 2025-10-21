import { Identifiable } from 'src/shared/models/identifiable.model';
import { Role } from '../auth/enums/role.enum';

export class User extends Identifiable {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;

  constructor(
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Role,
  ) {
    super(id);

    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.role = role;
  }
}
