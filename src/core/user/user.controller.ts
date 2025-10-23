import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { User } from './user.model';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthService, TokenPayload } from '../auth/auth.service';
import { UpdateUserDto } from '../../shared/dto/update-user.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';
import { UserService } from './user.service';
import { UUID } from 'crypto';

@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Roles(Role.ADMIN)
  @Get('all')
  getAllUsers(
    @Query() paginationDto: PaginationDto,
  ): Promise<{ users: User[]; totalUsers: number }> {
    return this.userService.users(paginationDto);
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Get('me')
  async getProfile(
    @Request() req: Request & { user: TokenPayload },
  ): Promise<User | null> {
    const id = req.user.sub;
    const user = await this.userService.user({ id });
    if (user) {
      return user;
    }
    throw new NotFoundException(`User with id ${req.user.sub} not found`);
  }

  @Roles(Role.ADMIN)
  @Get()
  async getUserByEmail(@Query('email') email: string): Promise<User> {
    const user = await this.userService.user({
      email,
    });
    if (user) {
      return user;
    }
    throw new NotFoundException(`User with email ${email} not found`);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  async getUserById(@Param('id') id: UUID): Promise<User | null> {
    const user = await this.userService.user({ id });
    if (user) {
      return user;
    }
    throw new NotFoundException(`User with id ${id} not found`);
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Patch('me')
  async updateOwnProfile(
    @Request() request: Request & { user: TokenPayload },
    @Body() updatedUser: UpdateUserDto,
  ): Promise<User> {
    const allowedFields = ['firstName', 'lastName', 'email', 'password'];
    try {
      const filteredUpdate = await this.authService.filterUpdate(
        updatedUser,
        allowedFields,
      );
      const id: UUID = request.user.sub;

      return await this.userService.updateUser({
        where: { id },
        data: filteredUpdate,
      });
    } catch {
      throw new UnauthorizedException('This operation is not allowed');
    }
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: UUID,
    @Body() updatedUser: UpdateUserDto,
  ): Promise<User> {
    const allowedFields = ['role'];
    try {
      const filteredUpdate = await this.authService.filterUpdate(
        updatedUser,
        allowedFields,
      );
      return await this.userService.updateUser({
        where: { id },
        data: filteredUpdate,
      });
    } catch {
      throw new UnauthorizedException('This operation is not allowed');
    }
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Delete('me')
  async deleteOwnProfile(
    @Request() req: Request & { user: TokenPayload },
  ): Promise<User> {
    const id: UUID = req.user.sub;
    return this.userService.deleteUser({ id });
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: UUID): Promise<User> {
    return this.userService.deleteUser({ id });
  }
}
