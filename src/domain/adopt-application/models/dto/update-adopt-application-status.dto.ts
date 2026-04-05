import { IsEnum } from 'class-validator';
import { Status } from '../../enums/status.enum';

export class UpdateAdoptApplicationStatusDto {
  @IsEnum(Status)
  status: Status;
}
