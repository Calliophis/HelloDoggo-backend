import { Identifiable } from "src/shared/models/identifiable.model";

export class Dog extends Identifiable {
  
  name: string;
  sex: 'male' | 'female';
  breed: string;

  constructor(id: number, name: string, sex: 'male'|'female', breed: string) {
    super(id);
    
    this.name = name;
    this.sex = sex;
    this.breed = breed;
  }
}