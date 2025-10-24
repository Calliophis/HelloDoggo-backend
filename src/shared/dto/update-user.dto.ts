import { IsEnum, IsOptional } from 'class-validator';
import { Role } from 'src/core/domain/auth/enums/role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
