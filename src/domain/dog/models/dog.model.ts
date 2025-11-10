import { UUID } from 'crypto';

export class Dog {
  constructor(
    public id: UUID,
    public name: string,
    public sex: 'male' | 'female',
    public breed: string,
    public imgUrl: string,
    public description: string,
  ) {}
}

export interface GetDogParams {
  skip?: number;
  take?: number;
}

export interface UpdateDogParams {
  id: UUID;
  dog?: Partial<Dog>;
  image?: Express.Multer.File;
}
