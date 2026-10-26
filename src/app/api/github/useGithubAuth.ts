'use client';

import { useState, useEffect, useCallback } from 'react';
import { githubLogin, type GithubLoginResponse } from './login';
import { githubCallback, type GithubCallbackResult } from './callback';
import { githubLogout } from './logout';
import { getGithubMe, type UserProfile } from './me';

export interface UseGithubAuthReturn {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (options?: { redirectUri?: string; json?: boolean }) => Promise<GithubLoginResponse | void>;
  logout: (options?: { redirectToLogin?: boolean }) => Promise<void>;
  handleCallback: (params: {
    token?: string | null;
    code?: string | null;
    state?: string | null;
  }) => Promise<GithubCallbackResult>;
  refreshUser: () => Promise<UserProfile | null>;
}

/**
 * Hook quản lý toàn bộ trạng thái và hành động xác thực GitHub OAuth
 */
export function useGithubAuth(): UseGithubAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await getGithubMe();
      setUser(profile);
      return profile;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi nạp thông tin người dùng');
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    getGithubMe()
      .then((profile) => {
        if (!isCancelled) {
          setUser(profile);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Lỗi nạp thông tin người dùng');
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const login = useCallback(async (options?: { redirectUri?: string; json?: boolean }) => {
    setError(null);
    try {
      return await githubLogin(options);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Khởi tạo đăng nhập thất bại');
      throw err;
    }
  }, []);

  const logout = useCallback(async (options?: { redirectToLogin?: boolean }) => {
    setIsLoading(true);
    try {
      await githubLogout(options);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCallback = useCallback(
    async (params: { token?: string | null; code?: string | null; state?: string | null }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await githubCallback(params);
        if (result.user) {
          setUser(result.user as UserProfile);
        } else {
          const profile = await getGithubMe(result.token);
          setUser(profile);
        }
        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Xác thực GitHub thất bại';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    error,
    login,
    logout,
    handleCallback,
    refreshUser,
  };
}

export default useGithubAuth;
