import { Observable } from 'rxjs';
import { AdoptApplication } from '../adopt-application/models/adopt-application.model';
import { CreateAdoptApplicationDto } from '../adopt-application/models/dto/create-adopt-application.dto';
import { UUID } from 'crypto';
import { UpdateAdoptApplicationStatusDto } from '../adopt-application/models/dto/update-adopt-application-status.dto';
import { PaginationDto } from '../models/dto/pagination.dto';

export interface AdoptApplicationProviderI {
  getAdoptApplications(params: PaginationDto): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }>;
  getAdoptApplicationById(id: UUID): Observable<AdoptApplication | null>;
  getAdoptApplicationsByDogId(
    params: PaginationDto,
    dogId: UUID,
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }>;
  getAdoptApplicationsByUserId(
    params: PaginationDto,
    userId: UUID,
  ): Observable<{
    adoptApplications: AdoptApplication[];
    totalAdoptApplications: number;
  }>;
  createAdoptApplication(
    adoptApplication: CreateAdoptApplicationDto,
  ): Observable<AdoptApplication>;
  updateAdoptApplicationStatus(
    id: UUID,
    status: UpdateAdoptApplicationStatusDto,
  ): Observable<AdoptApplication>;
  deleteAdoptApplication(id: UUID): Observable<boolean>;
}

export const AdoptApplicationProviderI = Symbol('AdoptApplicationProviderI');
