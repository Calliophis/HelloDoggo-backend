import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdoptApplicationService } from './adopt-application.service';
import { PaginationDto } from '../models/dto/pagination.dto';
import { Observable } from 'rxjs';
import { AdoptApplication } from './models/adopt-application.model';
import { UUID } from 'crypto';
import { CreateAdoptApplicationDto } from './models/dto/create-adopt-application.dto';
import { UpdateAdoptApplicationStatusDto } from './models/dto/update-adopt-application-status.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { TokenPayload } from '../auth/auth.service';

@Controller('adoption-application')
@UseGuards(RolesGuard)
export class AdoptApplicationController {
  constructor(private adoptApplicationService: AdoptApplicationService) {}

  @Roles(Role.ADMIN, Role.EDITOR)
  @Get('all')
  getAllAdoptApplications(@Query() params: PaginationDto): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    return this.adoptApplicationService.getAdoptApplications(params);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Get('dog/:dogId')
  getAdoptApplicationsByDogId(
    @Query() params: PaginationDto,
    @Param('dogId') dogId: UUID,
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    return this.adoptApplicationService.getAdoptApplicationsByDogId(
      params,
      dogId,
    );
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Get('user/:userId')
  getAdoptApplicationsByUserId(
    @Query() params: PaginationDto,
    @Param('userId') userId: UUID,
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    return this.adoptApplicationService.getAdoptApplicationsByUserId(
      params,
      userId,
    );
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Get('me')
  getOwnAdoptApplications(
    @Request() req: Request & { user: TokenPayload },
    @Query() params: PaginationDto,
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    const userId = req.user.sub;
    return this.adoptApplicationService.getAdoptApplicationsByUserId(
      params,
      userId,
    );
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Get(':id')
  getAdoptApplicationById(
    @Param('id') id: UUID,
  ): Observable<AdoptApplication | null> {
    return this.adoptApplicationService.getAdoptApplicationById(id);
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Post()
  createAdoptApplication(
    @Request() req: Request & { user: TokenPayload },
    @Body() adoptApplication: CreateAdoptApplicationDto,
  ): Observable<AdoptApplication> {
    const userId = req.user.sub;
    return this.adoptApplicationService.createAdoptApplication(
      adoptApplication,
      userId,
    );
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Patch(':id/status')
  updateAdoptApplicationStatus(
    @Param('id') id: UUID,
    @Body() status: UpdateAdoptApplicationStatusDto,
  ): Observable<AdoptApplication> {
    return this.adoptApplicationService.updateAdoptApplicationStatus(
      id,
      status,
    );
  }

  @Roles(Role.ADMIN, Role.EDITOR, Role.USER)
  @Delete('me/:id')
  deleteOwnAdoptApplication(
    @Request() req: Request & { user: TokenPayload },
    @Param('id') id: UUID,
  ): Observable<boolean> {
    const userId = req.user.sub;
    return this.adoptApplicationService.deleteOwnAdoptApplication(id, userId);
  }

  @Roles(Role.ADMIN, Role.EDITOR)
  @Delete(':id')
  deleteAdoptApplication(@Param('id') id: UUID): Observable<boolean> {
    return this.adoptApplicationService.deleteAdoptApplication(id);
  }
}
