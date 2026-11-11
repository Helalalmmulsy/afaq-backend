import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  storageProvider: 'R2' | 'LOCAL';
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client | null = null;
  private readonly r2BucketName: string | null = null;
  private readonly r2PublicUrl: string | null = null;
  private readonly isR2Enabled: boolean = false;
  private lastR2Error: string | null = null;
  private readonly uploadsLocalDir: string = path.join(process.cwd(), 'uploads');

  private cleanEnv(val?: string): string | undefined {
    if (!val) return undefined;
    const cleaned = val.trim().replace(/^["']|["']$/g, '');
    return cleaned.length > 0 ? cleaned : undefined;
  }

  constructor() {
    const accountId = this.cleanEnv(process.env.R2_ACCOUNT_ID);
    const accessKeyId = this.cleanEnv(process.env.R2_ACCESS_KEY_ID);
    const secretAccessKey = this.cleanEnv(process.env.R2_SECRET_ACCESS_KEY);
    const bucketName = this.cleanEnv(process.env.R2_BUCKET_NAME);
    const publicUrl = this.cleanEnv(process.env.R2_PUBLIC_URL);

    if (accountId && accessKeyId && secretAccessKey && bucketName) {
      try {
        this.s3Client = new S3Client({
          region: 'auto',
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
          requestChecksumCalculation: 'WHEN_REQUIRED',
          responseChecksumValidation: 'WHEN_REQUIRED',
        });
        this.r2BucketName = bucketName;
        this.r2PublicUrl = publicUrl ? publicUrl.replace(/\/+$/, '') : null;
        this.isR2Enabled = true;
        this.logger.log(`Cloudflare R2 Storage initialized successfully for bucket: ${bucketName}`);
      } catch (err: any) {
        this.lastR2Error = err?.message || 'Failed to initialize S3Client';
        this.logger.error(`Failed to initialize Cloudflare R2 client: ${err?.message}`, err?.stack);
      }
    } else {
      this.logger.warn('Cloudflare R2 credentials not fully configured. Using fallback local storage.');
    }

    // Ensure local uploads directory exists
    if (!fs.existsSync(this.uploadsLocalDir)) {
      fs.mkdirSync(this.uploadsLocalDir, { recursive: true });
    }
  }

  getStorageInfo() {
    return {
      storageMode: this.isR2Enabled ? ('R2' as const) : ('LOCAL' as const),
      bucketName: this.r2BucketName,
      r2PublicUrl: this.r2PublicUrl,
      lastR2Error: this.lastR2Error,
    };
  }

  /**
   * Upload file buffer to Cloudflare R2 if available, otherwise save to local uploads directory
   */
  async uploadFile(
    file: Express.Multer.File,
    category: string = 'general',
  ): Promise<UploadResult> {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const randomHex = Math.random().toString(16).substring(2, 8);
    const uniqueFileName = `${timestamp}_${randomHex}${ext}`;
    const storageKey = `${category.toLowerCase()}/${uniqueFileName}`;

    if (this.isR2Enabled && this.s3Client && this.r2BucketName) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.r2BucketName,
          Key: storageKey,
          Body: file.buffer,
          ContentType: file.mimetype || 'application/octet-stream',
        });

        await this.s3Client.send(command);
        this.lastR2Error = null;

        const baseUrl = this.r2PublicUrl || `https://${this.r2BucketName}.r2.dev`;
        const fileUrl = `${baseUrl}/${storageKey}`;

        return {
          fileUrl,
          fileName: uniqueFileName,
          originalName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          storageProvider: 'R2',
        };
      } catch (err: any) {
        this.lastR2Error = err?.message || 'Unknown R2 PutObject error';
        this.logger.error(`Error uploading to R2: ${err.message}. Falling back to local storage.`, err?.stack);
      }
    }

    // Fallback: Save to local directory
    const categoryDir = path.join(this.uploadsLocalDir, category.toLowerCase());
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    const filePath = path.join(categoryDir, uniqueFileName);
    fs.writeFileSync(filePath, file.buffer);

    const backendPublicUrl = (process.env.BACKEND_PUBLIC_URL || 'https://afaq-backend-3be6.onrender.com').replace(/\/+$/, '');
    const fileUrl = `${backendPublicUrl}/uploads/${category.toLowerCase()}/${uniqueFileName}`;

    return {
      fileUrl,
      fileName: uniqueFileName,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      storageProvider: 'LOCAL',
    };
  }

  /**
   * Delete file from R2 or local storage
   */
  async deleteFile(fileUrl: string, fileName?: string): Promise<boolean> {
    try {
      if (this.isR2Enabled && this.s3Client && this.r2BucketName) {
        // Extract key from URL
        const u = new URL(fileUrl);
        const key = u.pathname.replace(/^\/+/, '');
        try {
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: this.r2BucketName,
              Key: key,
            }),
          );
          return true;
        } catch (_) {}
      }

      // Try local delete
      if (fileUrl.includes('/uploads/')) {
        const parts = fileUrl.split('/uploads/')[1];
        if (parts) {
          const localPath = path.join(this.uploadsLocalDir, parts);
          if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
            return true;
          }
        }
      }
      return true;
    } catch (err: any) {
      this.logger.error(`Error deleting file: ${err.message}`);
      return false;
    }
  }
}
