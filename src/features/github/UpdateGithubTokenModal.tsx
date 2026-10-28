import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { TextField } from '@/components/common/TextField';
import { Typography } from '@/components/common/Typography';
import { IconRegistry } from '@/components/common/IconRegistry';
import { api } from '@/lib/api';

export interface UpdateGithubTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const UpdateGithubTokenModal: React.FC<UpdateGithubTokenModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmed = token.trim();
    if (!trimmed) {
      setError('Vui lòng nhập mã Personal Access Token của GitHub.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post<{ login: string; scopes: string[]; message: string }>(
        '/auth/github/token',
        { token: trimmed }
      );
      setSuccessMsg(res.message || `Đã cập nhật GitHub Token thành công cho tài khoản @${res.login}!`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật GitHub Token.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-[#2b2b2b] shadow-2xl p-6 rounded-none relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <IconRegistry name="github" size={18} className="text-[var(--accent)]" />
            <Typography variant="h3" color="primary">
              Cập nhật GitHub Token (PAT)
            </Typography>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Typography variant="body-sm" color="muted">
            Nhập Personal Access Token (Classic) có quyền <strong className="text-white">repo</strong> và <strong className="text-white">workflow</strong> để hệ thống tự động đẩy code và cấu hình CI/CD.
          </Typography>

          <TextField
            label="Personal Access Token"
            type="password"
            placeholder="ghp_..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            hint="Token bắt đầu bằng ghp_..."
          />

          {error && (
            <div className="p-3 bg-red-950/30 border border-red-800/40 text-red-400 text-xs">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs flex items-center gap-2">
              <span>✓</span> {successMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
              Lưu Token
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
