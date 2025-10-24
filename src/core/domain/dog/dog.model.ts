import { UUID } from 'crypto';

export class Dog {
  id: UUID;
  name: string;
  sex: 'male' | 'female';
  breed: string;
  description: string;
  imgUrl: string | undefined;

  constructor(
    id: UUID,
    name: string,
    sex: 'male' | 'female',
    breed: string,
    imgUrl: string,
    description: string,
  ) {
    this.id = id;
    this.name = name;
    this.sex = sex;
    this.breed = breed;
    this.description = description;
    this.imgUrl = imgUrl;
  }
}
