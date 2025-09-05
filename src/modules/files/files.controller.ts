import { Request, Response } from 'express';
import { AuthRequest } from '../../common/middleware/auth';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env';
import { query } from '../../config/db';
import { v4 as uuidv4 } from 'uuid';
import { recordAudit } from '../../common/utils/audit';
import { z } from 'zod';

const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_USE_PATH_STYLE,
  credentials: { accessKeyId: env.S3_ACCESS_KEY, secretAccessKey: env.S3_SECRET_KEY }
});

export async function requestUploadHandler(req: AuthRequest, res: Response) {
  const schema = z.object({ mimeType: z.string(), sizeBytes: z.number().int() });
  const { mimeType, sizeBytes } = schema.parse(req.body);
  const key = `${req.user!.id}/${uuidv4()}`;
  await query(
    'INSERT INTO files (owner_id, s3_key, mime_type, size_bytes) VALUES (:owner,:key,:mime,:size)',
    { owner: req.user!.id, key, mime: mimeType, size: sizeBytes }
  );
  await recordAudit('file.upload.request', req.user!.id, 'file', undefined, { key, mimeType, sizeBytes });
  const command = new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, ContentType: mimeType });
  const url = await getSignedUrl(s3, command, { expiresIn: env.PRESIGN_EXPIRES_SECONDS });
  res.json({ url, key });
}

export async function requestDownloadHandler(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const [rows] = await query('SELECT * FROM files WHERE id=:id AND is_deleted=0', { id });
  const file = rows[0];
  if (!file || file.owner_id !== req.user!.id) return res.status(404).json({ message: 'Not found' });
  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: file.s3_key });
  const url = await getSignedUrl(s3, command, { expiresIn: env.PRESIGN_EXPIRES_SECONDS });
  await recordAudit('file.download.request', req.user!.id, 'file', file.id);
  res.json({ url, mimeType: file.mime_type });
}
