export class UpdateAdoptApplicationStatusDto {
  constructor(public status: 'pending' | 'approved' | 'rejected') {}
}
