import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TokenPayload } from '../auth/auth.service';
import { UserService } from './user.service';
import { UUID } from 'crypto';
import { catchError, Observable, tap } from 'rxjs';
import { PaginationDto } from '../models/dto/pagination.dto';
import { UpdateOwnProfileDto } from './models/dto/update-own-profile.dto';
import { UpdateUserDto } from './models/dto/update-user.dto';
import { User } from './models/user.model';

@UseGuards(RolesGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Roles(Role.ADMIN)
  @Get('all')
  getAllUsers(
    @Query() paginationDto: PaginationDto,
  ): Observable<{ users: User[]; totalUsers: number }> {
    return this.userService.getUsers(paginationDto);
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Get('me')
  getOwnProfile(
    @Request() req: Request & { user: TokenPayload },
  ): Observable<User | null> {
    const id = req.user.sub;
    return this.userService.getUserById(id).pipe(
      tap((user) => {
        if (!user) {
          throw new NotFoundException(`User with id ${req.user.sub} not found`);
        }
      }),
    );
  }

  @Roles(Role.ADMIN)
  @Get()
  getUserByEmail(@Query('email') email: string): Observable<User | null> {
    return this.userService.getUserByEmail(email).pipe(
      tap((user) => {
        if (!user) {
          throw new NotFoundException(`User with email ${email} not found`);
        }
      }),
    );
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  getUserById(@Param('id') id: UUID): Observable<User | null> {
    return this.userService.getUserById(id).pipe(
      tap((user) => {
        if (!user) {
          throw new NotFoundException(`User with id ${id} not found`);
        }
      }),
    );
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Patch('me')
  updateOwnProfile(
    @Request() request: Request & { user: TokenPayload },
    @Body() updatedUser: UpdateOwnProfileDto,
  ): Observable<User> {
    const id: UUID = request.user.sub;

    return this.userService
      .updateUser({
        id,
        user: updatedUser,
      })
      .pipe(
        catchError(() => {
          throw new UnauthorizedException('This operation is not allowed');
        }),
      );
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  updateUser(
    @Param('id') id: UUID,
    @Body() updatedUser: UpdateUserDto,
  ): Observable<User> {
    return this.userService
      .updateUser({
        id,
        user: updatedUser,
      })
      .pipe(
        catchError(() => {
          throw new UnauthorizedException('This operation is not allowed');
        }),
      );
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteOwnProfile(
    @Request() req: Request & { user: TokenPayload },
  ): Observable<boolean> {
    const id: UUID = req.user.sub;
    return this.userService.deleteUser(id);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: UUID): Observable<boolean> {
    return this.userService.deleteUser(id);
  }
}
