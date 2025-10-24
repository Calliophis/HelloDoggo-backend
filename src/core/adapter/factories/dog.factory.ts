import { Prisma, dogs as PrismaDog } from '@prisma/client';
import { UUID } from 'crypto';
import { Dog } from 'src/core/domain/dog/dog.model';

export type DatabaseDog = PrismaDog;

export class DogFactory {
  static createFromDatabaseToDog(databaseDog: DatabaseDog): Dog {
    return new Dog(
      databaseDog.id as UUID,
      databaseDog.name,
      this.mapDatabaseSex(databaseDog.sex),
      databaseDog.breed,
      databaseDog.img_url,
      databaseDog.description,
    );
  }

  static mapDatabaseSex(databaseSex: string): 'male' | 'female' {
    switch (databaseSex) {
      case 'male':
        return 'male';
      case 'female':
        return 'female';
      default:
        throw new Error('Sex must be male or female');
    }
  }

  static mapFromDogToDatabase(
    updatedDog: Prisma.dogsUpdateInput,
  ): Partial<DatabaseDog> {
    const mapping: Record<string, string> = {
      name: 'name',
      sex: 'sex',
      breed: 'breed',
      description: 'description',
      imgUrl: 'img_url',
    };

    const updatedDatabaseDog: Partial<DatabaseDog> = {};

    for (const [key, value] of Object.entries(updatedDog)) {
      if (value !== undefined && value !== null && value !== '') {
        updatedDatabaseDog[mapping[key]] = value;
      }
    }
    return updatedDatabaseDog;
  }
}
