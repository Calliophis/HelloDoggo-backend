import { Inject, Injectable } from '@nestjs/common';
import { Dog } from './models/dog.model';
import { UUID } from 'crypto';
import { DogProviderI } from '../ports/dog-provider-port.model';
import { Observable } from 'rxjs';
import { DogProvider } from '../../adapter/providers/dog.provider';
import { UpdateDogDto } from './models/dto/update-dog.dto';
import { PaginationDto } from '../models/dto/pagination.dto';

@Injectable()
export class DogService {
  constructor(@Inject(DogProviderI) private dogProvider: DogProvider) {}

  getDogs(
    params: PaginationDto,
  ): Observable<{ dogs: Dog[]; totalDogs: number }> {
    return this.dogProvider.getDogs(params);
  }

  getDogById(id: UUID): Observable<Dog | null> {
    return this.dogProvider.getDogById(id);
  }

  createDog(dog: Partial<Dog>, image: Express.Multer.File): Observable<Dog> {
    return this.dogProvider.createDog(dog, image);
  }

  updateDog(
    id: UUID,
    dog: UpdateDogDto,
    image: Express.Multer.File,
  ): Observable<Dog> {
    return this.dogProvider.updateDog(id, dog, image);
  }

  deleteDog(id: UUID): Observable<boolean> {
    return this.dogProvider.deleteDog(id);
  }
}
