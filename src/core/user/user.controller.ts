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
import { DbService } from '../../shared/database/db.service';
import { User } from './user.model';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthService, TokenPayload } from '../auth/auth.service';
import { UpdateUserDto } from '../../shared/dto/update-user.dto';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  protected dbService: DbService;

  constructor(private authService: AuthService) {
    this.dbService = new DbService('usersDB.json');
  }

  @Roles(Role.ADMIN)
  @Get('all')
  findAll(@Query() paginationDto: PaginationDto): {
    paginatedItems: User[];
    totalNumberOfItems: number;
  } {
    const paginatedItems =
      this.dbService.findAll<User>(paginationDto).paginatedItems;
    const totalNumberOfItems =
      this.dbService.findAll<User>(paginationDto).totalNumberOfItems;
    return { paginatedItems, totalNumberOfItems };
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Get('me')
  getProfile(@Request() req: Request & { user: TokenPayload }): User {
    const user = this.dbService.findById<User>(req.user.sub);
    if (user) {
      return user;
    }
    throw new NotFoundException(`User with id ${req.user.sub} not found`);
  }

  @Roles(Role.ADMIN)
  @Get()
  findByEmail(@Query('email') email: string): User {
    const user = this.dbService.findByEmail(email);
    if (user) {
      return user;
    }
    throw new NotFoundException(`User with email ${email} not found`);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findById(@Param('id') id: string): User {
    const user = this.dbService.findById<User>(+id);
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
  ) {
    const allowedFields = ['firstName', 'lastName', 'email', 'password'];
    try {
      const filteredUpdate = await this.authService.filterUpdate(
        updatedUser,
        allowedFields,
      );
      return this.dbService.update(request.user.sub, filteredUpdate);
    } catch {
      throw new UnauthorizedException('This operation is not allowed');
    }
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatedUser: UpdateUserDto) {
    const allowedFields = ['role'];
    try {
      const filteredUpdate = await this.authService.filterUpdate(
        updatedUser,
        allowedFields,
      );
      return this.dbService.update(+id, filteredUpdate);
    } catch {
      throw new UnauthorizedException('This operation is not allowed');
    }
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Delete('me')
  deleteOwnProfile(@Request() req: Request & { user: TokenPayload }): {
    deleted: boolean;
  } {
    return this.dbService.delete(req.user.sub);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string): { deleted: boolean } {
    return this.dbService.delete(+id);
  }
}
