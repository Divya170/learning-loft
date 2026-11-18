import { BadRequestException, ValidationError, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { Transform } from 'class-transformer';

/** Flattens class-validator errors into `{ field: firstMessage }` so the UI can show them inline. */
export function flattenErrors(errors: ValidationError[], parent = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of errors) {
    const key = parent ? `${parent}.${e.property}` : e.property;
    if (e.constraints) {
      const first = Object.values(e.constraints)[0];
      if (first) out[key] = first;
    }
    if (e.children?.length) Object.assign(out, flattenErrors(e.children, key));
  }
  return out;
}

export function validationException(errors: Record<string, string>, message = 'Please check the highlighted fields.') {
  return new BadRequestException({ statusCode: 400, message, errors });
}

export const VALIDATION_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) => validationException(flattenErrors(errors)),
};

export function createValidationPipe(extra: ValidationPipeOptions = {}) {
  return new ValidationPipe({ ...VALIDATION_OPTIONS, ...extra });
}

/** Trims string input; leaves other types untouched. */
export const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

/** Accepts "true"/"false"/"1"/"0" query strings as booleans. */
export const QueryBool = () =>
  Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === '1';
  });
