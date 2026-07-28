import { PAGINATION } from '@/config/constants';

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function calculatePagination(params: PaginationParams & { total: number }): PaginationMeta {
  const page = Math.max(1, params.page || PAGINATION.DEFAULT_PAGE);
  const pageSize = Math.max(1, Math.min(params.pageSize || PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE));
  const total = Math.max(0, params.total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function calculateOffset(page: number, pageSize: number): number {
  return (Math.max(1, page) - 1) * Math.max(1, pageSize);
}
