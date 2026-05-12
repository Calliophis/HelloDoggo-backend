import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AdoptApplicationProviderI } from '../../domain/ports/adopt-application-provider-port.model';
import { UUID } from 'crypto';
import { Status } from '../../domain/adopt-application/enums/status.enum';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private applicationId: UUID | null = null;

  constructor(
    @Inject(AdoptApplicationProviderI)
    private adoptApplicationProvider: AdoptApplicationProviderI,
  ) {}

  @Cron('15 * * * * *')
  createAdoptionApplication() {
    this.adoptApplicationProvider
      .createAdoptApplication(
        { dogId: 'f8cb112b-a612-4460-b8ad-b3dd3eff8f20' },
        'ef9b851c-ee77-40c0-a155-1cbe9b5f7311',
      )
      .subscribe({
        next: (adoptApplication) => {
          this.applicationId = adoptApplication.id;
          this.logger.log(
            'Keeping the database alive: adopt application created',
          );
        },
        error: (error) => {
          this.logger.error(error);
        },
      });
  }

  @Cron('30 * * * * *')
  updateAdoptionApplication() {
    if (this.applicationId) {
      this.adoptApplicationProvider
        .updateAdoptApplicationStatus(this.applicationId, {
          status: Status.APPROVED,
        })
        .subscribe({
          next: () => {
            this.logger.log(
              'Keeping the database alive: adopt application updated',
            );
          },
          error: (error) => {
            this.logger.error(error);
          },
        });
    }
  }

  @Cron('45 * * * * *')
  deleteAdoptionApplication() {
    if (this.applicationId) {
      this.adoptApplicationProvider
        .deleteOwnAdoptApplication(
          this.applicationId,
          'ef9b851c-ee77-40c0-a155-1cbe9b5f7311',
        )
        .subscribe({
          next: () => {
            this.logger.log(
              'Keeping the database alive: adopt application deleted',
            );
          },
          error: (error) => {
            this.logger.error(error);
          },
        });
    }
  }
}
