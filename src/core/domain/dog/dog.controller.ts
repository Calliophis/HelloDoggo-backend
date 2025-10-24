import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Dog } from './dog.model';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { DogService } from './dog.service';
import { UUID } from 'crypto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { CreateDogDto } from 'src/shared/dto/create-dog.dto';

@Controller('dog')
export class DogController {
  constructor(private dogService: DogService) {}

  @Public()
  @Get('all')
  async getAllDogs(
    @Query() paginationDto: PaginationDto,
  ): Promise<{ dogs: Dog[]; totalDogs: number }> {
    return await this.dogService.dogs(paginationDto);
  }

  @Public()
  @Get(':id')
  async getDogById(@Param('id') id: UUID): Promise<Dog | null> {
    const dog = await this.dogService.dog({ id });
    if (dog) {
      return dog;
    }
    throw new NotFoundException(`Dog with id ${id} not found`);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (request, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtension = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: Omit<CreateDogDto, 'imgUrl'>,
  ): Dog {
    const imageUrl = `/uploads/${file.filename}`;
    const newDog = {
      ...body,
      imgUrl: imageUrl,
    };
    return this.dogService.create(newDog);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @Patch(':id/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (request, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtension = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
        },
      }),
    }),
  )
  updateDogImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: UUID,
  ): Dog {
    const existingUrl = this.dogService.findById(id)?.imgUrl;
    if (existingUrl) {
      fs.unlink(`./${existingUrl}`, (error) => {
        if (error) throw error;
      });
    }
    const imageUrl = `/uploads/${file.filename}`;
    const updatedImage = { imgUrl: imageUrl };
    return this.dogService.update(id, updatedImage);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @Patch(':id')
  async update(
    @Param('id') id: UUID,
    @Body() updatedDog: Partial<Dog>,
  ): Promise<Dog> {
    return await this.dogService.updateDog({
      where: { id },
      data: updatedDog,
    });
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  @Delete(':id')
  async delete(@Param('id') id: UUID): Promise<Dog> {
    return await this.dogService.deleteDog({ id });
  }
}
