import { UUID } from 'crypto';

export class AdoptApplication {
  constructor(
    public id: UUID,
    public dog: { id: UUID; name: string },
    public user: {
      id: UUID;
      firstName: string;
      lastName: string;
      email: string;
    },
    public status: 'pending' | 'approved' | 'rejected',
  ) {}
}
