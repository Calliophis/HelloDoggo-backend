import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../../auth/enums/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
