import { UUID } from 'crypto';

export class CreateAdoptApplicationDto {
  constructor(
    public dogId: UUID,
    public userId: UUID,
  ) {}
}
