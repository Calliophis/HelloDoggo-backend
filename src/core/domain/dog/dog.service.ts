import { Inject, Injectable } from '@nestjs/common';
import { Dog, GetDogParams, UpdateDogParams } from './dog.model';
import { UUID } from 'crypto';
import { DogProviderI } from '../ports/dog-provider-port.model';
import { DogProvider } from 'src/core/adapter/providers/dog.provider';
import { Observable } from 'rxjs';

@Injectable()
export class DogService {
  constructor(@Inject(DogProviderI) private dogProvider: DogProvider) {}

  getDogs(
    params: GetDogParams,
  ): Observable<{ dogs: Dog[]; totalDogs: number }> {
    return this.dogProvider.getDogs(params);
  }

  getDogById(id: UUID): Observable<Dog | null> {
    return this.dogProvider.getDogById(id);
  }

  createDog(dog: Partial<Dog>, image: Express.Multer.File): Observable<Dog> {
    return this.dogProvider.createDog(dog, image);
  }

  updateDog(params: UpdateDogParams): Observable<Dog> {
    return this.dogProvider.updateDog(params);
  }

  deleteDog(id: UUID): Observable<boolean> {
    return this.dogProvider.deleteDog(id);
  }
}
