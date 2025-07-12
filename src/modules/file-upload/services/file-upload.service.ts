import { Storage } from '@google-cloud/storage';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private storage: Storage;
  private bucket: string;

  constructor() {
    this.storage = new Storage({ projectId: 'lawplace-0000' });
    this.bucket = 'lawplace-assets';
  }

  async uploadTokenLogo(file: Express.Multer.File, folder?: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucket);

      const mimeType = file.mimetype.split('/')[1];
      const filename = `${folder}/${uuidv4()}.${mimeType}`;
      const fileUpload = bucket.file(filename);

      const blobStream = fileUpload.createWriteStream({
        resumable: false,
        metadata: { contentType: file.mimetype },
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', error => reject(error));
        blobStream.on('finish', async () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucket}/${filename}`;
          resolve(publicUrl);
        });
        blobStream.end(file.buffer);
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
