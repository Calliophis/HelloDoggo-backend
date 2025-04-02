import { Identifiable } from "src/shared/models/identifiable.model";


export class User extends Identifiable {
  
  email: string;
  password: string;

  constructor(id: number, email: string, password: string) {
    super(id);

    this.email = email;
    this.password = password;
  }
}