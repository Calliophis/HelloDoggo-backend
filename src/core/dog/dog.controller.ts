import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Dog } from './dog.model';
import { DbService } from 'src/shared/database/db.service';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/publicDecorator';

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
  
    @Post()
    create(@Body() newDog: Dog): Dog {
      return this.dbService.create(newDog);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatedDog: Partial<Dog>) {
      return this.dbService.update(+id, updatedDog);
    }
  
    @Delete(':id')
    delete(@Param('id') id: string): { deleted: boolean } {
      return this.dbService.delete(+id);
    }
}
