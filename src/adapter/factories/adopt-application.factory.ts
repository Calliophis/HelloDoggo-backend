import { UUID } from 'crypto';
import { AdoptApplication } from '../../domain/adopt-application/models/adopt-application.model';
import {
  Prisma,
  adoption_applications as PrismaAdoptionApplications,
} from '@prisma/client';
import { UpdateAdoptApplicationStatusDto } from '../../domain/adopt-application/models/dto/update-adopt-application-status.dto';

export type DatabaseAdoptApplication = PrismaAdoptionApplications;

export class AdoptApplicationFactory {
  static createFromDatabaseToAdoptApplication(
    databaseAdoptApplication: DatabaseAdoptApplication,
  ): AdoptApplication {
    return new AdoptApplication(
      databaseAdoptApplication.id as UUID,
      databaseAdoptApplication.dog_id as UUID,
      databaseAdoptApplication.user_id as UUID,
      this.mapDatabaseStatus(databaseAdoptApplication.status),
    );
  }

  static mapDatabaseStatus(
    databaseStatus: string,
  ): 'pending' | 'approved' | 'rejected' {
    switch (databaseStatus) {
      case 'pending':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        throw new Error('Status must be pending, approved or rejected');
    }
  }

  static mapCreateToDatabase(
    dogId: UUID,
    userId: UUID,
  ): Prisma.adoption_applicationsUncheckedCreateInput {
    return {
      dog_id: dogId,
      user_id: userId,
      status: 'pending',
    };
  }

  static mapUpdateStatusToDatabase(
    statusDto: UpdateAdoptApplicationStatusDto,
  ): Prisma.adoption_applicationsUpdateInput {
    return {
      status: statusDto.status,
    };
  }
}
