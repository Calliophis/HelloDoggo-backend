import { Identifiable } from '../../shared/models/identifiable.model';

export class Dog extends Identifiable {
  name: string;
  sex: 'male' | 'female';
  breed: string;
  description: string;
  imgUrl: string | undefined;

  constructor(
    id: number,
    name: string,
    sex: 'male' | 'female',
    breed: string,
    imgUrl: string,
    description: string,
  ) {
    super(id);

    this.name = name;
    this.sex = sex;
    this.breed = breed;
    this.description = description;
    this.imgUrl = imgUrl;
  }
}
