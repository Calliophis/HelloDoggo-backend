import { Observable } from 'rxjs';
import { Dog, GetDogParams } from '../dog/models/dog.model';
import { UUID } from 'crypto';
import { UpdateDogDto } from '../dog/models/dto/update-dog.dto';

export interface DogProviderI {
  getDogs(params: GetDogParams): Observable<{ dogs: Dog[]; totalDogs: number }>;
  getDogById(id: UUID): Observable<Dog | null>;
  createDog(dog: Partial<Dog>, image: Express.Multer.File): Observable<Dog>;
  updateDog(
    id: UUID,
    dog: UpdateDogDto,
    image: Express.Multer.File,
  ): Observable<Dog>;
  deleteDog(id: UUID): Observable<boolean>;
}

export const DogProviderI = Symbol('DogProviderI');
