import { Injectable } from '@nestjs/common';
import { AdoptApplicationProviderI } from '../../domain/ports/adopt-application-provider-port.model';
import { UUID } from 'crypto';
import { forkJoin, from, map, Observable } from 'rxjs';
import { AdoptApplication } from '../../domain/adopt-application/models/adopt-application.model';
import { CreateAdoptApplicationDto } from '../../domain/adopt-application/models/dto/create-adopt-application.dto';
import { UpdateAdoptApplicationStatusDto } from '../../domain/adopt-application/models/dto/update-adopt-application-status.dto';
import { PrismaService } from '../database/prisma.service';
import { AdoptApplicationFactory } from '../factories/adopt-application.factory';
import { PaginationDto } from '../../domain/models/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdoptApplicationProvider implements AdoptApplicationProviderI {
  constructor(private prisma: PrismaService) {}

  getAdoptApplications(params: PaginationDto): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    return this.fetchAdoptApplications(params);
  }
  getAdoptApplicationById(id: UUID): Observable<AdoptApplication | null> {
    return from(
      this.prisma.adoption_applications.findUnique({
        where: { id },
      }),
    ).pipe(
      map((databaseAdoptApplication) => {
        return databaseAdoptApplication
          ? AdoptApplicationFactory.createFromDatabaseToAdoptApplication(
              databaseAdoptApplication,
            )
          : null;
      }),
    );
  }
  getAdoptApplicationsByDogId(
    params: PaginationDto,
    dogId: UUID,
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    return this.fetchAdoptApplications(params, { dog_id: dogId });
  }
  getAdoptApplicationsByUserId(
    params: PaginationDto,
    userId: UUID,
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    return this.fetchAdoptApplications(params, { user_id: userId });
  }
  createAdoptApplication(
    adoptApplication: CreateAdoptApplicationDto,
    userId: UUID,
  ): Observable<AdoptApplication> {
    return from(
      this.prisma.adoption_applications.create({
        data: AdoptApplicationFactory.mapCreateToDatabase(
          adoptApplication.dogId,
          userId,
        ),
      }),
    ).pipe(
      map((databaseAdoptApplication) =>
        AdoptApplicationFactory.createFromDatabaseToAdoptApplication(
          databaseAdoptApplication,
        ),
      ),
    );
  }
  updateAdoptApplicationStatus(
    id: UUID,
    status: UpdateAdoptApplicationStatusDto,
  ): Observable<AdoptApplication> {
    return from(
      this.prisma.adoption_applications.update({
        where: { id },
        data: AdoptApplicationFactory.mapUpdateStatusToDatabase(status),
      }),
    ).pipe(
      map((databaseAdoptApplication) =>
        AdoptApplicationFactory.createFromDatabaseToAdoptApplication(
          databaseAdoptApplication,
        ),
      ),
    );
  }
  deleteAdoptApplication(id: UUID): Observable<boolean> {
    return from(
      this.prisma.adoption_applications.delete({
        where: { id },
      }),
    ).pipe(map(() => true));
  }

  deleteOwnAdoptApplication(id: UUID, userId: UUID): Observable<boolean> {
    return from(
      this.prisma.adoption_applications.deleteMany({
        where: { id, user_id: userId },
      }),
    ).pipe(map((batchPayload) => batchPayload.count > 0));
  }

  private fetchAdoptApplications(
    params: PaginationDto,
    where: Prisma.adoption_applicationsWhereInput = {},
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    const { skip, take } = params;

    return forkJoin([
      from(
        this.prisma.adoption_applications.findMany({
          where,
          orderBy: [{ created_at: 'desc' }, { id: 'asc' }],
          skip,
          take,
        }),
      ),
      from(this.prisma.adoption_applications.count({ where })),
    ]).pipe(
      map(([databaseAdoptApplications, totalAdoptApplications]) => ({
        adoptApplications: databaseAdoptApplications.map(
          (databaseAdoptApplication) =>
            AdoptApplicationFactory.createFromDatabaseToAdoptApplication(
              databaseAdoptApplication,
            ),
        ),
        totalAdoptApplications,
      })),
    );
  }
}
