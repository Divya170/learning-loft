import { createHash, randomInt } from 'node:crypto';
import { createParamDecorator, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';

/** Hashes the client IP so abuse can be limited without storing raw addresses. */
export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(`${process.env.IP_HASH_SALT ?? 'learning-loft'}:${ip}`)
    .digest('hex')
    .slice(0, 24);
}

export const ClientIp = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<Request>();
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
});

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
/** Human-friendly reference, e.g. LL-261118-7KQ4. */
export function makeReference(prefix: string, date = new Date()): string {
  const d = date.toISOString().slice(2, 10).replace(/-/g, '');
  let tail = '';
  for (let i = 0; i < 4; i++) tail += ALPHABET[randomInt(ALPHABET.length)];
  return `${prefix}-${d}-${tail}`;
}

/** Simple in-memory sliding-window limiter (per process). */
@Injectable()
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  consume(key: string, limit: number, windowMs: number, message = 'Too many submissions. Please wait a few minutes and try again.') {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      throw new HttpException({ statusCode: 429, message }, HttpStatus.TOO_MANY_REQUESTS);
    }
    recent.push(now);
    this.hits.set(key, recent);
    if (this.hits.size > 5000) this.prune(now, windowMs);
  }

  private prune(now: number, windowMs: number) {
    for (const [k, v] of this.hits) if (v.every((t) => now - t >= windowMs)) this.hits.delete(k);
  }
}
