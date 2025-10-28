import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { catchError, from, map, Observable } from 'rxjs';
import { StorageError } from '@supabase/storage-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient<
    never,
    'public',
    'public',
    never,
    never
  >;

  constructor(private readonly configService: ConfigService) {
    const projectUrl = this.configService.get<string>('SUPABASE_PROJECT_URL');
    const apiKey = this.configService.get<string>('SUPABASE_API_KEY');
    if (!projectUrl || !apiKey) {
      throw new Error('Supabase environment variables not found');
    }
    this.supabase = createClient(projectUrl, apiKey);
  }

  uploadFile(file: Express.Multer.File): Observable<string> {
    const filePath = `${Date.now()}-${file.originalname}`;
    const fileBytes = new Uint8Array(file.buffer);

    return from(
      this.supabase.storage.from('dogs').upload(filePath, fileBytes, {
        contentType: file.mimetype,
      }),
    ).pipe(
      map((supabaseResponse) => {
        return `${this.configService.get<string>('SUPABASE_STORAGE_URL')}${supabaseResponse.data?.fullPath}`;
      }),
      catchError((error: StorageError) => {
        throw new StorageError('upload file error' + error.message);
      }),
    );
  }

  deleteFile(imgUrl: string): Observable<boolean> {
    const filePath = imgUrl.split(
      this.configService.get<string>('SUPABASE_STORAGE_URL') || '',
    )[1];
    return from(this.supabase.storage.from('dogs').remove([filePath])).pipe(
      map(() => true),
      catchError((error: StorageError) => {
        throw new StorageError('delete file error : ' + error.message);
      }),
    );
  }
}
