import { Request, Response } from 'express';
import { query } from '../../config/db';
import crypto from 'crypto';

interface CacheEntry {
  etag: string;
  data: any;
  updatedAt: number;
}

const cache = new Map<string, CacheEntry>();

export async function getTranslations(req: Request, res: Response) {
  const { locale, namespace } = req.params;
  const key = `${locale}:${namespace}`;
  const cached = cache.get(key);
  if (cached && req.headers['if-none-match'] === cached.etag) {
    return res.status(304).end();
  }
  if (cached) {
    res.set('ETag', cached.etag);
    return res.json(cached.data);
  }
  const [rows] = await query(
    'SELECT t_key, t_value FROM translations WHERE locale_code=:locale AND namespace=:ns',
    { locale, ns: namespace }
  );
  const data: Record<string, string> = {};
  for (const row of rows) data[row.t_key] = row.t_value;
  const etag = crypto.createHash('sha1').update(JSON.stringify(data)).digest('hex');
  cache.set(key, { etag, data, updatedAt: Date.now() });
  res.set('ETag', etag);
  res.json(data);
}
