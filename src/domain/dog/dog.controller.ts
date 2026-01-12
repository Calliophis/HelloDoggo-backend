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
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Dog } from './models/dog.model';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { DogService } from './dog.service';
import { UUID } from 'crypto';
import { catchError, Observable, tap } from 'rxjs';
import { PaginationDto } from '../models/dto/pagination.dto';
import { CreateDogDto } from './models/dto/create-dog.dto';
import { UpdateDogDto } from './models/dto/update-dog.dto';

@Controller('dog')
export class DogController {
  constructor(private dogService: DogService) {}

  @Public()
  @Get('all')
  getAllDogs(
    @Query() paginationDto: PaginationDto,
  ): Observable<{ dogs: Dog[]; totalDogs: number }> {
    return this.dogService.getDogs(paginationDto);
  }

  @Public()
  @Get(':id')
  getDogById(@Param('id') id: UUID): Observable<Dog | null> {
    return this.dogService.getDogById(id).pipe(
      tap((dog) => {
        if (!dog) {
          throw new NotFoundException(`Dog with id ${id} not found`);
        }
      }),
    );
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateDogDto,
  ): Observable<Dog> {
    return this.dogService.createDog(body, file);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  updateDog(
    @UploadedFile() image: Express.Multer.File,
    @Param('id') id: UUID,
    @Body() dog: UpdateDogDto,
  ): Observable<Dog> {
    return this.dogService.updateDog(id, dog, image).pipe(
      catchError(() => {
        throw new UnauthorizedException('This operation is not allowed');
      }),
    );
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteDog(@Param('id') id: UUID): Observable<boolean> {
    return this.dogService.deleteDog(id);
  }
}
