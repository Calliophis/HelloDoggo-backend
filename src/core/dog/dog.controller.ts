import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Dog } from './dog.model';
import { DbService } from 'src/shared/database/db.service';
import { Public } from '../auth/decorators/public.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateDogDto } from '../auth/dto/create-dog.dto';

@UseGuards(RolesGuard)
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
    
    @Roles(Role.ADMIN, Role.EDITOR)
    @Post()
    create(@Body() newDog: CreateDogDto): Dog {
      return this.dbService.create(newDog);
    }
    
    @Roles(Role.ADMIN, Role.EDITOR)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatedDog: Partial<Dog>) {
      return this.dbService.update(+id, updatedDog);
    }
    
    @Roles(Role.ADMIN, Role.EDITOR)
    @Delete(':id')
    delete(@Param('id') id: string): { deleted: boolean } {
      return this.dbService.delete(+id);
    }
}
