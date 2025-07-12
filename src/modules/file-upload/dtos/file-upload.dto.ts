import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export const FileUploadResSchema = z.object({
  url: extendApi(z.string(), {
    description: '파일 URL',
    example: 'https://storage.googleapis.com/my-bucket/images/1234567890-image.jpg',
  }),
  originalName: extendApi(z.string(), {
    description: '파일 이름',
    example: 'image.jpg',
  }),
  size: extendApi(z.number(), {
    description: '파일 크기',
    example: 1024,
  }),
  mimetype: extendApi(z.string(), {
    description: '파일 타입',
    example: 'image/jpeg',
  }),
});

export class FileUploadResDto extends createZodDto(FileUploadResSchema) {}
