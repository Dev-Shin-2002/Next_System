/**
 * Module xử lý callback sau khi GitHub ủy quyền
 * Sử dụng API Client chuẩn từ @/lib/api
 */

import { api, tokenStorage } from '@/lib/api';

export interface GithubCallbackResult {
    token: string;
    user?: {
        id: string;
        displayName: string | null;
        primaryEmail: string | null;
        avatarUrl: string | null;
        role: string;
        status?: string;
    };
}

/**
 * Lưu token và thiết lập cookies phiên làm việc an toàn
 */
export function persistAuthSession(token: string) {
    tokenStorage.set(token);
    if (typeof document !== 'undefined') {
        document.cookie = `sm_session=${token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
    }
}

/**
 * Xử lý kết quả Callback từ GitHub:
 * - Trường hợp 1: Nhận trực tiếp token từ URL params
 * - Trường hợp 2: Gửi code + state lên Backend qua api.get để đổi token
 */
export async function githubCallback(params: {
    token?: string | null;
    code?: string | null;
    state?: string | null;
}): Promise<GithubCallbackResult> {
    // TH1: Nhận trực tiếp token từ URL params
    if (params.token) {
        persistAuthSession(params.token);
        return { token: params.token };
    }

    // TH2: Gửi code và state lên backend để đổi token qua API client
    if (params.code && params.state) {
        const data = await api.get<GithubCallbackResult>('/api/v1/auth/github/callback', {
            params: {
                code: params.code,
                state: params.state,
                json: 'true',
            },
            skipAuth: true,
        });

        persistAuthSession(data.token);
        return data;
    }

    throw new Error('Thiếu tham số xác thực hợp lệ (cần token hoặc code + state).');
}
