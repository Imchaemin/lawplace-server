import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FileUploadResDto, FileUploadResSchema } from '../dtos/file-upload.dto';
import { FileUploadService } from '../services/file-upload.service';

@ApiTags('File Upload')
@Controller('file-upload')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('')
  @ApiOperation({ summary: 'Upload a single image file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'The file has been successfully uploaded',
  })
  @ApiResponse({
    status: 413,
    description: 'File size exceeded',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
      fileFilter: (_req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i))
          callback(new BadRequestException('Only image files are allowed'), false);
        callback(null, true);
      },
    })
  )
  async uploadTokenLogo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { folder?: string }
  ): Promise<FileUploadResDto> {
    if (!file) throw new BadRequestException('No file uploaded');
    const uploadedUrl = await this.fileUploadService.uploadTokenLogo(file, body.folder);

    return FileUploadResSchema.parse({
      url: uploadedUrl,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });
  }
}
