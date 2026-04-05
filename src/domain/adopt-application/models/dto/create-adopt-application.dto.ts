import { IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class CreateAdoptApplicationDto {
  @IsUUID()
  dogId: UUID;
}
