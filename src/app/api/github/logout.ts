/**
 * Module xử lý đăng xuất hệ thống
 * Sử dụng API Client chuẩn từ @/lib/api
 */

import { api, tokenStorage } from '@/lib/api';

/**
 * Xóa toàn bộ token và cookie ở client
 */
export function clearClientSession() {
    tokenStorage.clear();
    if (typeof document !== 'undefined') {
        document.cookie = 'sm_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
}

/**
 * Đăng xuất: gọi Backend thu hồi session, xóa cookie và điều hướng
 */
export async function githubLogout(options?: { redirectToLogin?: boolean }): Promise<void> {
    try {
        await api.post('/api/v1/auth/logout');
    } catch (error) {
        console.warn('Backend logout request failed, clearing local credentials anyway:', error);
    } finally {
        clearClientSession();

        if (options?.redirectToLogin !== false && typeof window !== 'undefined') {
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = '/login';
        }
    }
}
