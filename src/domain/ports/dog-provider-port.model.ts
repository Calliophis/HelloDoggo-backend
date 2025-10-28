import { Observable } from 'rxjs';
import { Dog, GetDogParams, UpdateDogParams } from '../dog/models/dog.model';
import { UUID } from 'crypto';

export interface DogProviderI {
  getDogs(params: GetDogParams): Observable<{ dogs: Dog[]; totalDogs: number }>;
  getDogById(id: UUID): Observable<Dog | null>;
  createDog(dog: Partial<Dog>, image: Express.Multer.File): Observable<Dog>;
  updateDog(params: UpdateDogParams): Observable<Dog>;
  deleteDog(id: UUID): Observable<boolean>;
}

export const DogProviderI = Symbol('DogProviderI');
