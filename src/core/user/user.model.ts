import { Identifiable } from "src/shared/models/identifiable.model";
import { Role } from "../auth/enums/role.enum";


export class User extends Identifiable {
  
  email: string;
  password: string;
  role: Role;

  constructor(id: number, email: string, password: string, role: Role) {
    super(id);

    this.email = email;
    this.password = password;
    this.role = role;
  }
}