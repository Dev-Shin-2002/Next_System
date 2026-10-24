/**
 * Chuẩn API Client cho Frontend Next.js
 * Đồng bộ với chuẩn phản hồi { success: true, data, meta } và { success: false, error, meta }
 */

export interface ApiErrorDetail {
  field?: string;
  message: string;
  [key: string]: unknown;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta: {
    requestId: string;
    page?: number;
    pageSize?: number;
    total?: number;
    [key: string]: unknown;
  };
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta: {
    requestId: string;
    [key: string]: unknown;
  };
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: ApiErrorDetail[];
  public readonly requestId?: string;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ApiErrorDetail[],
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ==========================================
// In-Memory Token Manager & Refresh Mutex
// ==========================================

let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

export const tokenStorage = {
  get: () => inMemoryAccessToken,
  set: (token: string | null) => {
    inMemoryAccessToken = token;
  },
  clear: () => {
    inMemoryAccessToken = null;
  },
};

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(callback: (token: string | null) => void) {
  refreshSubscribers.push(callback);
}

// ==========================================
// Core Fetch Request
// ==========================================

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  retryOn401?: boolean;
  returnEnvelope?: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8387';

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    params,
    skipAuth = false,
    retryOn401 = true,
    returnEnvelope = false,
    ...customConfig
  } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `${url.includes('?') ? '&' : '?'}${qs}`;
  }

  const headers = new Headers(customConfig.headers || {});
  if (!headers.has('Content-Type') && !(customConfig.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = tokenStorage.get();
  if (token && !skipAuth && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    // Mặc định include credentials để gửi kèm HttpOnly cookies cross-origin
    credentials: customConfig.credentials || 'include',
    ...customConfig,
    headers,
  };

  let res: Response;
  try {
    res = await fetch(url, config);
  } catch (netErr: unknown) {
    const message =
      netErr instanceof Error
        ? netErr.message
        : 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    throw new ApiClientError(0, 'NETWORK_ERROR', message);
  }

  // 1. Phân tích kết quả JSON từ response
  let json: Record<string, unknown> | null = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      json = (await res.json()) as Record<string, unknown>;
    } catch {
      json = null;
    }
  }

  // 2. Xử lý trường hợp 401 và cơ chế tự động Refresh Token:
  // CHỈ tự động refresh khi:
  // - Mã phản hồi là 401
  // - Cho phép retry (retryOn401 !== false)
  // - ĐÃ TỪNG CÓ token (không phải khách vãng lai)
  // - Không phải là endpoint auth công khai (/login, /register, /auth/refresh)
  const isAuthRoute =
    endpoint.includes('/auth/login') ||
    endpoint.includes('/auth/register') ||
    endpoint.includes('/auth/refresh');

  const hasExistingToken = Boolean(tokenStorage.get());

  if (res.status === 401 && retryOn401 && hasExistingToken && !isAuthRoute) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const envelope = (await refreshRes.json()) as ApiSuccessEnvelope<{ accessToken: string }>;
          const newToken = envelope?.data?.accessToken || null;
          tokenStorage.set(newToken);
          isRefreshing = false;
          onRefreshed(newToken);
        } else {
          tokenStorage.clear();
          isRefreshing = false;
          onRefreshed(null);
        }
      } catch {
        tokenStorage.clear();
        isRefreshing = false;
        onRefreshed(null);
      }
    }

    // Đưa request vào hàng đợi chờ refresh hoàn tất
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        if (!newToken) {
          const reqId = (json as unknown as ApiErrorEnvelope)?.meta?.requestId;
          return reject(
            new ApiClientError(
              401,
              'UNAUTHORIZED',
              'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
              undefined,
              reqId
            )
          );
        }
        // Thử lại request ban đầu với token mới
        resolve(
          request<T>(endpoint, {
            ...options,
            retryOn401: false,
          })
        );
      });
    });
  }

  // 3. Nếu là định dạng chuẩn Envelope của hệ thống ({ success, data, meta })
  if (json && typeof json === 'object' && 'success' in json) {
    if (json.success === true) {
      // Nếu caller muốn lấy cả envelope (để đọc meta.page, requestId...), trả về toàn bộ
      return (returnEnvelope ? json : json.data) as T;
    } else {
      const err = json as unknown as ApiErrorEnvelope;
      throw new ApiClientError(
        res.status,
        err.error?.code || 'API_ERROR',
        err.error?.message || 'Yêu cầu không thành công.',
        err.error?.details,
        err.meta?.requestId
      );
    }
  }

  // 4. Nếu API thất bại mà không theo chuẩn Envelope (ví dụ: lỗi reverse proxy, Next.js route, probe)
  if (!res.ok) {
    const errorProp = json?.error;
    const fallbackCode =
      typeof errorProp === 'string'
        ? errorProp
        : typeof errorProp === 'object' && errorProp !== null && 'code' in errorProp
          ? String((errorProp as Record<string, unknown>).code)
          : 'HTTP_ERROR';
    const fallbackMessage =
      typeof json?.message === 'string'
        ? json.message
        : `Yêu cầu thất bại với mã trạng thái ${res.status}.`;

    throw new ApiClientError(res.status, fallbackCode, fallbackMessage);
  }

  // 5. Trường hợp phản hồi thành công nhưng không bọc envelope (ví dụ probe /health)
  return json as T;
}

// ==========================================
// Exported API Client Object
// ==========================================

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  /**
   * Lấy toàn bộ ApiResponseEnvelope ({ success: true, data, meta })
   * Sử dụng khi cần đọc thông tin phân trang (meta.page, meta.total) hoặc requestId
   */
  envelope: <T>(endpoint: string, options?: RequestOptions): Promise<ApiSuccessEnvelope<T>> =>
    request<ApiSuccessEnvelope<T>>(endpoint, {
      ...options,
      method: options?.method || 'GET',
      returnEnvelope: true,
    }),
};
