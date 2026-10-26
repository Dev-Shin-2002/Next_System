/**
 * Module xử lý bắt đầu đăng nhập qua GitHub OAuth
 */

import { api, getApiBaseUrl } from '@/lib/api';

export interface GithubLoginResponse {
    url: string;
    state: string;
}

/**
 * Điều hướng trực tiếp trình duyệt sang Backend GitHub OAuth endpoint
 * Hoặc trả về { url, state } nếu options.json = true
 */
export async function githubLogin(options?: {
    redirectUri?: string;
    json?: boolean;
}): Promise<GithubLoginResponse | void> {
    const baseUrl = getApiBaseUrl();
    const searchParams = new URLSearchParams();
    if (options?.redirectUri) {
        searchParams.set('redirect_uri', options.redirectUri);
    }

    // Nếu caller chỉ muốn lấy data URL dạng JSON (ví dụ gọi từ API hoặc SDK)
    if (options?.json) {
        return await api.get<GithubLoginResponse>('/api/v1/auth/github/login', {
            params: {
                ...(options.redirectUri ? { redirect_uri: options.redirectUri } : {}),
                json: 'true',
            },
            skipAuth: true,
        });
    }

    // Mặc định: Chuyển hướng trực tiếp trình duyệt (Top-level Navigation)
    // Trình duyệt tự gọi sang Backend -> Backend set cookie CSRF state -> 302 chuyển sang GitHub
    const qs = searchParams.toString();
    const targetUrl = `${baseUrl}/api/v1/auth/github/login${qs ? `?${qs}` : ''}`;

    if (typeof window !== 'undefined') {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = targetUrl;
    }
}
