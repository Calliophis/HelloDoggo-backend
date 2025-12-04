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
