import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Dog } from './dog.model';
import { DbService } from 'src/shared/database/db.service';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateDogDto } from '../../shared/dto/create-dog.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Controller('dog')
export class DogController {
    protected dbService: DbService;

    constructor() {
      this.dbService = new DbService('dogsDB.json');
    }

    @Public()
    @Get('all')
    findAll(@Query() paginationDto: PaginationDto): { paginatedItems: Dog[], totalNumberOfItems: number } {
      const paginatedItems = this.dbService.findAll<Dog>(paginationDto).paginatedItems;
      const totalNumberOfItems = this.dbService.findAll<Dog>(paginationDto).totalNumberOfItems;
      return { paginatedItems, totalNumberOfItems };
    }
    
    @Public()
    @Get(':id')
    findById(@Param('id') id: string): Dog {
      const dog = this.dbService.findById<Dog>(+id);
      if(dog) {
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
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
            const fileExtension = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
          },
        }),
      }),
    )
    create(@UploadedFile() file: Express.Multer.File, @Body() body: Omit<CreateDogDto, 'img_url'>): Dog {
      const imageUrl = `/uploads/${file.filename}`;
      const newDog = {
        ...body,
        img_url: imageUrl
      };
      return this.dbService.create<Dog>(newDog);
    }
    
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.EDITOR)
    @Patch(':id/image')
    @UseInterceptors(
      FileInterceptor('image', {
        storage: diskStorage({
          destination: './uploads',
          filename: (request, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
            const fileExtension = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${fileExtension}`);
          },
        }),
      }),
    )
    updateDogImage(@UploadedFile() file: Express.Multer.File, @Param('id') id: string): Dog {
      const existingUrl = this.dbService.findById<Dog>(+id)?.img_url;
      if (existingUrl) {
        fs.unlink(`./${existingUrl}`, (error) => {
          if (error) throw error;
        }) 
      }
      const imageUrl = `/uploads/${file.filename}`;
      const updatedImage = {img_url: imageUrl}
      return this.dbService.update<Dog>(+id, updatedImage);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.EDITOR)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatedDog: Partial<Dog>) {
      return this.dbService.update<Dog>(+id, updatedDog);
    }
    
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.EDITOR)
    @Delete(':id')
    delete(@Param('id') id: string): { deleted: boolean } {
      return this.dbService.delete(+id);
    }
}
