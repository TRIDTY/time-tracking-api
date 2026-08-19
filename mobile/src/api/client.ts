const DEFAULT_BASE_URL = 'http://10.0.2.2:8080';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_BASE_URL;

export type Role = 'ROLE_EMPLOYEE' | 'ROLE_MANAGER';

export type RecordType = 'CLOCK_IN' | 'BREAK_START' | 'BREAK_END' | 'CLOCK_OUT';

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
}

export interface TimeRecordResponse {
  id: number;
  userId: number;
  userName: string;
  type: RecordType;
  latitude: number;
  longitude: number;
  recordedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
}

export interface ProblemDetail {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ProblemDetail;

  constructor(status: number, problem?: ProblemDetail) {
    super(problem?.detail ?? problem?.title ?? `Erro HTTP ${status}`);
    this.status = status;
    this.problem = problem;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  if (!response.ok) {
    let problem: ProblemDetail | undefined;
    try {
      problem = await response.json();
    } catch {
      problem = undefined;
    }
    throw new ApiError(response.status, problem);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function createRecord(
  token: string,
  type: RecordType,
  latitude: number,
  longitude: number,
): Promise<TimeRecordResponse> {
  return request<TimeRecordResponse>('/api/records', {
    method: 'POST',
    token,
    body: { type, latitude, longitude },
  });
}

export function fetchMyRecords(
  token: string,
  page = 0,
  size = 20,
): Promise<PageResponse<TimeRecordResponse>> {
  return request<PageResponse<TimeRecordResponse>>(
    `/api/records/me?page=${page}&size=${size}`,
    { token },
  );
}

export function fetchAllRecords(
  token: string,
  params: { userId?: string; from?: string; to?: string; page?: number; size?: number },
): Promise<PageResponse<TimeRecordResponse>> {
  const query = new URLSearchParams();
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 20));
  if (params.userId) query.set('userId', params.userId);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  return request<PageResponse<TimeRecordResponse>>(
    `/api/admin/records?${query.toString()}`,
    { token },
  );
}
