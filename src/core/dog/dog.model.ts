import { Identifiable } from "src/shared/models/identifiable.model";

export class Dog extends Identifiable {
  
  name: string;
  sex: 'male' | 'female';
  breed: string;
  img_url: string;
  description: string;

  constructor(id: number, name: string, sex: 'male'|'female', breed: string, img_url: string, description: string) {
    super(id);
    
    this.name = name;
    this.sex = sex;
    this.breed = breed;
    this.img_url = img_url;
    this.description = description;
  }
}