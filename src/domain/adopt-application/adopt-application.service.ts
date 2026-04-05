import { Inject, Injectable } from '@nestjs/common';
import { AdoptApplicationProviderI } from '../ports/adopt-application-provider-port.model';
import { PaginationDto } from '../models/dto/pagination.dto';
import { Observable } from 'rxjs';
import { AdoptApplication } from './models/adopt-application.model';
import { UUID } from 'crypto';
import { CreateAdoptApplicationDto } from './models/dto/create-adopt-application.dto';
import { UpdateAdoptApplicationStatusDto } from './models/dto/update-adopt-application-status.dto';

@Injectable()
export class AdoptApplicationService {
  constructor(
    @Inject(AdoptApplicationProviderI)
    private adoptApplicationProvider: AdoptApplicationProviderI,
  ) {}

  getAdoptApplications(params: PaginationDto): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    return this.adoptApplicationProvider.getAdoptApplications(params);
  }

  getAdoptApplicationById(id: UUID): Observable<AdoptApplication | null> {
    return this.adoptApplicationProvider.getAdoptApplicationById(id);
  }

  getAdoptApplicationsByDogId(
    params: PaginationDto,
    dogId: UUID,
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    return this.adoptApplicationProvider.getAdoptApplicationsByDogId(
      params,
      dogId,
    );
  }

  getAdoptApplicationsByUserId(
    params: PaginationDto,
    userId: UUID,
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }> {
    return this.adoptApplicationProvider.getAdoptApplicationsByUserId(
      params,
      userId,
    );
  }

  createAdoptApplication(
    adoptApplication: CreateAdoptApplicationDto,
    userId: UUID,
  ): Observable<AdoptApplication> {
    return this.adoptApplicationProvider.createAdoptApplication(
      adoptApplication,
      userId,
    );
  }

  updateAdoptApplicationStatus(
    id: UUID,
    status: UpdateAdoptApplicationStatusDto,
  ): Observable<AdoptApplication> {
    return this.adoptApplicationProvider.updateAdoptApplicationStatus(
      id,
      status,
    );
  }

  deleteAdoptApplication(id: UUID): Observable<boolean> {
    return this.adoptApplicationProvider.deleteAdoptApplication(id);
  }

  deleteOwnAdoptApplication(id: UUID, userId: UUID): Observable<boolean> {
    return this.adoptApplicationProvider.deleteOwnAdoptApplication(id, userId);
  }
}
