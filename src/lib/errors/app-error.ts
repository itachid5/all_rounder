import { ERROR_CODES } from './error-codes';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(params: {
    message: string;
    code: string;
    statusCode?: number;
    isOperational?: boolean;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.code = params.code;
    this.statusCode = params.statusCode ?? 500;
    this.isOperational = params.isOperational ?? true;
    this.details = params.details;

    // Restore prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export function notFoundError(resource: string) {
  return new AppError({
    message: `${resource} not found`,
    code: ERROR_CODES.NOT_FOUND,
    statusCode: 404,
  });
}

export function validationError(message: string, details?: Record<string, unknown>) {
  return new AppError({
    message,
    code: ERROR_CODES.VALIDATION_FAILED,
    statusCode: 400,
    details,
  });
}

export function unauthorizedError(message: string = 'Unauthorized') {
  return new AppError({
    message,
    code: ERROR_CODES.AUTH_UNAUTHORIZED,
    statusCode: 401,
  });
}

export function forbiddenError(message: string = 'Forbidden') {
  return new AppError({
    message,
    code: ERROR_CODES.AUTH_FORBIDDEN,
    statusCode: 403,
  });
}

export function conflictError(message: string) {
  return new AppError({
    message,
    code: ERROR_CODES.DB_DUPLICATE_ENTRY,
    statusCode: 409,
  });
}

export function internalError(message: string = 'Internal Server Error') {
  return new AppError({
    message,
    code: ERROR_CODES.INTERNAL_ERROR,
    statusCode: 500,
    isOperational: false,
  });
}
