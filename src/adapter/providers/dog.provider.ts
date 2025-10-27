import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import {
  catchError,
  forkJoin,
  from,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { DogProviderI } from 'src/domain/ports/dog-provider-port.model';
import { PrismaService } from '../database/prisma.service';
import { SupabaseService } from '../database/supabase.service';
import {
  Dog,
  GetDogParams,
  UpdateDogParams,
} from 'src/domain/dog/models/dog.model';
import { DogFactory } from '../factories/dog.factory';

@Injectable()
export class DogProvider implements DogProviderI {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  getDogs(
    params: GetDogParams,
  ): Observable<{ dogs: Dog[]; totalDogs: number }> {
    const { skip, take } = params;
    return forkJoin([
      from(
        this.prisma.dogs.findMany({
          skip,
          take,
        }),
      ),
      from(this.prisma.dogs.count()),
    ]).pipe(
      map(([databaseDogs, totalDogs]) => {
        const dogs = databaseDogs.map((dog) =>
          DogFactory.createFromDatabaseToDog(dog),
        );
        return { dogs, totalDogs };
      }),
    );
  }

  getDogById(id: UUID): Observable<Dog | null> {
    return from(
      this.prisma.dogs.findUnique({
        where: { id },
      }),
    ).pipe(
      map((databaseDog) => {
        return databaseDog
          ? DogFactory.createFromDatabaseToDog(databaseDog)
          : null;
      }),
    );
  }

  uploadDogImage(image: Express.Multer.File): Observable<string> {
    return this.supabase.uploadFile(image);
  }

  deleteDogImage(id: UUID): Observable<boolean> {
    return this.getDogById(id).pipe(
      switchMap((dog) => {
        if (dog?.imgUrl) {
          return this.supabase.deleteFile(dog.imgUrl);
        }
        return of(true);
      }),
      catchError(() => {
        throw new Error(`Dog with id ${id} was not found`);
      }),
    );
  }

  createDog(dog: Partial<Dog>, image: Express.Multer.File): Observable<Dog> {
    return this.uploadDogImage(image).pipe(
      switchMap((imgUrl) => {
        dog.imgUrl = imgUrl;
        const mappedDog = DogFactory.mapFromDogToDatabase(dog);
        return from(
          this.prisma.dogs.create({
            data: mappedDog,
          }),
        ).pipe(
          map((databaseDog) => {
            return DogFactory.createFromDatabaseToDog(databaseDog);
          }),
        );
      }),
    );
  }

  updateDogInfo(id: UUID, dog: Partial<Dog>): Observable<Dog> {
    const mappedData = DogFactory.mapFromDogToDatabase(dog);
    return from(
      this.prisma.dogs.update({
        data: mappedData,
        where: { id },
      }),
    ).pipe(
      map((databaseDog) => DogFactory.createFromDatabaseToDog(databaseDog)),
    );
  }

  updateDog(params: UpdateDogParams): Observable<Dog> {
    const id = params.id;

    if (params.image) {
      const image = params.image;
      return this.deleteDogImage(id).pipe(
        switchMap(() => this.uploadDogImage(image)),
        switchMap((imgUrl) => {
          const dog = params.dog ? { ...params.dog, imgUrl } : { imgUrl };
          return this.updateDogInfo(id, dog);
        }),
      );
    }
    if (params.dog) {
      return this.updateDogInfo(id, params.dog);
    }
    throw new Error('Nothing to update');
  }

  deleteDog(id: UUID): Observable<boolean> {
    return this.deleteDogImage(id).pipe(
      switchMap(() =>
        from(
          this.prisma.dogs.delete({
            where: { id },
          }),
        ),
      ),
      map(() => true),
    );
  }
}
