import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // resource_type 'auto' handles images; CVs (PDF/DOC/DOCX) need 'raw' since
  // Cloudinary only applies image transforms to the 'image' resource type.
  uploadBuffer(
    buffer: Buffer,
    options: { folder: string; resourceType?: 'auto' | 'raw' | 'image' } = { folder: 'remy-real-estate' },
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: options.folder, resource_type: options.resourceType || 'auto' },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        },
      );
      stream.end(buffer);
    });
  }
}
