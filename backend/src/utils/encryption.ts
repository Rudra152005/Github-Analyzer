import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY as any, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, encryptedHex] = payload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY as any, iv as any);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8');
}
