/**
 * Module lấy thông tin tài khoản người dùng đang đăng nhập
 * Sử dụng API Client chuẩn từ @/lib/api (đã tích hợp tự động gắn token & refresh)
 */

import { api } from '@/lib/api';

export interface UserIdentity {
    provider: string;
    providerUserId?: string;
    loginName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
}

export interface UserProfile {
    id: string;
    displayName: string | null;
    primaryEmail: string | null;
    avatarUrl: string | null;
    role: string;
    status: string;
    createdAt?: string;
    identities?: UserIdentity[];
}

/**
 * Lấy thông tin tài khoản hiện tại từ Backend (/api/v1/auth/me)
 */
export async function getGithubMe(overrideToken?: string): Promise<UserProfile | null> {
    try {
        const headers = overrideToken ? { Authorization: `Bearer ${overrideToken}` } : undefined;
        return await api.get<UserProfile>('/api/v1/auth/me', { headers });
    } catch (err: unknown) {
        console.error('getGithubMe error:', err);
        return null;
    }
}
