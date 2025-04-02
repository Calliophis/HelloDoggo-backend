import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { DbService } from 'src/shared/database/db.service';
import { User } from './user.model';

@Controller('user')
export class UserController {
    protected dbService: DbService;

    constructor() {
      this.dbService = new DbService('usersDB.json');
    }

    @Get()
    findByEmail(@Query('email') email: string): User {
      const user = this.dbService.findByEmail(email);
      if(user) {
        return user;
      }
      throw new NotFoundException();
    }

    @Get('all')
    findAll(): User[] {
      return this.dbService.findAll();
    }
    
    @Get(':id')
    findById(@Param('id') id: string): User {
      const user = this.dbService.findById<User>(+id);
      if(user) {
        return user;
      }
      throw new NotFoundException(`User with id ${id} not found`);
    }
  
    @Post()
    create(@Body() newUser: User): User {
      return this.dbService.create(newUser);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatedUser: Partial<User>) {
      return this.dbService.update(+id, updatedUser);
    }
  
    @Delete(':id')
    delete(@Param('id') id: string): { deleted: boolean } {
      return this.dbService.delete(+id);
    }
}
