import { AppError } from '@/shared/utils/errors';
import { PaginationMeta } from './pagination';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: Record<string, unknown>;
}

export function successResponse<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

export function errorResponse(error: AppError): ApiResponse<never> {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };
}

export function paginatedResponse<T>(data: T[], meta: PaginationMeta): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta: meta as unknown as Record<string, unknown>,
  };
}
