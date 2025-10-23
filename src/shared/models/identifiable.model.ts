import { UUID } from 'crypto';

export abstract class Identifiable {
  id: UUID;

  constructor(id: UUID) {
    this.id = id;
  }
}
