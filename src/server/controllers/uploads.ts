import path from 'node:path';
import express, { Request, Response, NextFunction } from 'express';
import {
  S3Client,
  CompleteMultipartUploadCommandOutput,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import formidable, { File } from 'formidable';
import { PassThrough } from 'stream';
import { slug } from 'server/helpers';
import AuthController from './auth';

type UploadsControllerConfig = {
  s3Client: S3Client;
};

class UploadsController {
  private static s3Client: S3Client;
  private static bucket: string;
  private static cdnBaseUrl: string;

  static init({ s3Client }: UploadsControllerConfig) {
    this.s3Client = s3Client;
    this.bucket = process.env.S3_ASSETS_BUCKET || '';
    this.cdnBaseUrl = process.env.APP_ENDPOINT || '';

    const router = express.Router();
    router.use('/uploads', AuthController.authMiddleware);
    router.get('/uploads', this.listFiles);
    router.post('/uploads/users', this.uploadFile);
    router.delete('/uploads/users/:imageKey', this.deleteFile);
    return router;
  }

  static writeStreamHandler =
    (uploads: Promise<CompleteMultipartUploadCommandOutput>[], userEmail: string) =>
    (file: any) => {
      const { originalFilename, mimetype } = file;
      if (!file || !originalFilename || !mimetype) {
        throw new Error('No file provided');
      }
      const timestamp = Date.now();
      const ext = path.extname(originalFilename);
      const pathname = path.basename(originalFilename, ext);
      const sluggedFilename = `${slug(pathname)}${ext}`;
      const key = `uploads/users/${userEmail}/${timestamp}-${sluggedFilename}`;

      const passThrough = new PassThrough();
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: passThrough,
          ContentType: mimetype || 'application/octet-stream',
          Metadata: {
            'original-filename': encodeURIComponent(originalFilename),
            'upload-date': new Date(timestamp).toISOString(),
          },
        },
      });
      uploads.push(upload.done());
      return passThrough;
    };

  static listFiles = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = res.locals;
    const prefix = `uploads/users/${user.email}/`;

    const command = new ListObjectsV2Command({
      Bucket: this.bucket,
      Prefix: prefix,
    });

    const response = await this.s3Client.send(command);
    const files = (response.Contents || []).reverse().map((obj) => ({
      key: obj.Key,
      url: `${this.cdnBaseUrl}/${obj.Key}`,
      size: obj.Size,
      lastModified: obj.LastModified,
    }));

    res.json({ files });
  };

  static deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = res.locals;
    const { imageKey } = req.params;
    const key = `uploads/users/${user.email}/${imageKey}`;

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
    res.json({ success: true, key });
  };

  static uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    const { user } = res.locals;
    const uploads: Promise<CompleteMultipartUploadCommandOutput>[] = [];
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowEmptyFiles: false,
      filter: ({ name }) => name === 'file',
      fileWriteStreamHandler: this.writeStreamHandler(uploads, user.email),
    });
    await form.parse(req);

    if (uploads.length === 0) {
      res.status(400).json({ error: 'No file provided. Field name must be "file".' });
      return;
    }

    const [result] = await Promise.all(uploads);
    res.json({
      url: `${this.cdnBaseUrl}/${result.Key}`,
      ...result,
    });
  };
}

export default UploadsController;
