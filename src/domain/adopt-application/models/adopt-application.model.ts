import { UUID } from 'crypto';

export class AdoptApplication {
  constructor(
    public id: UUID,
    public dogId: UUID,
    public userId: UUID,
    public status: 'pending' | 'approved' | 'rejected',
  ) {}
}
