import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Dog } from './dog.model';
import { DbService } from 'src/shared/database/db.service';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateDogDto } from '../auth/dto/create-dog.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('dog')
export class DogController {
    protected dbService: DbService;

    constructor() {
      this.dbService = new DbService('dogsDB.json');
    }

    @Public()
    @Get('all')
    findAll(): Dog[] {
      return this.dbService.findAll();
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
    @Post('upload')
    @UseInterceptors(
      FileInterceptor('image', {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
            const ext = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
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
      return this.dbService.create(newDog);
    }
    
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.EDITOR)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatedDog: Partial<Dog>) {
      return this.dbService.update(+id, updatedDog);
    }
    
    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN, Role.EDITOR)
    @Delete(':id')
    delete(@Param('id') id: string): { deleted: boolean } {
      return this.dbService.delete(+id);
    }
}
