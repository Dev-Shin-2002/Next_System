'use client';

import React, { useState, useEffect } from 'react';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconRegistry } from '@/components/common/IconRegistry';
import { setupGithubRepoDeployment } from '@/app/api/github/repos';
import type { Repo, SetupDeploymentResponse } from '@/app/api/github/repo-detail.types';

export interface DeploySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: Repo;
  onSuccess?: (res: SetupDeploymentResponse) => void;
}

type ProviderType = 'vercel' | 'render' | 'cloudflare';
type ModeType = 'launch' | 'api';

interface ProviderMeta {
  id: ProviderType;
  name: string;
  tagline: string;
  badge: string;
  accentColor: string;
  tokenDocUrl: string;
}

const PROVIDERS: ProviderMeta[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    tagline: 'Frontend, Next.js, Static & Edge',
    badge: 'Khuyên dùng cho Frontend',
    accentColor: '#ffffff',
    tokenDocUrl: 'https://vercel.com/account/tokens',
  },
  {
    id: 'render',
    name: 'Render',
    tagline: 'Backend API, Node.js, Docker & Worker',
    badge: 'Khuyên dùng cho Fullstack',
    accentColor: '#46e3b7',
    tokenDocUrl: 'https://dashboard.render.com/u/settings#api-keys',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    tagline: 'Cloudflare Pages & Serverless Workers',
    badge: 'Toàn cầu / Edge',
    accentColor: '#f38020',
    tokenDocUrl: 'https://dash.cloudflare.com/profile/api-tokens',
  },
];

export const DeploySetupModal: React.FC<DeploySetupModalProps> = ({
  isOpen,
  onClose,
  repo,
  onSuccess,
}) => {
  const [provider, setProvider] = useState<ProviderType>('vercel');
  const [mode, setMode] = useState<ModeType>('launch');
  const [projectName, setProjectName] = useState<string>(repo.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
  const [apiToken, setApiToken] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [saveToken, setSaveToken] = useState<boolean>(true);
  const [createWorkflow, setCreateWorkflow] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentProviderMeta = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  const handleLaunch = () => {
    let launchUrl = '';
    if (provider === 'vercel') {
      launchUrl = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(repo.htmlUrl)}`;
    } else if (provider === 'render') {
      launchUrl = `https://render.com/deploy?repo=${encodeURIComponent(repo.htmlUrl)}`;
    } else {
      launchUrl = `https://deploy.workers.cloudflare.com/?url=${encodeURIComponent(repo.htmlUrl)}`;
    }
    window.open(launchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleApiDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!apiToken.trim()) {
      setError(`Vui lòng nhập API Token của ${currentProviderMeta.name}.`);
      return;
    }

    if (provider === 'cloudflare' && !accountId.trim()) {
      setError('Vui lòng nhập Cloudflare Account ID.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await setupGithubRepoDeployment(repo.id, {
        provider,
        mode: 'api',
        apiToken: apiToken.trim(),
        accountId: accountId.trim() || undefined,
        saveToken,
        createWorkflow,
        projectName: projectName.trim(),
      });

      setSuccessNotice(res.message || 'Thiết lập triển khai thành công!');
      if (onSuccess) {
        onSuccess(res);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Không thể thiết lập triển khai qua API. Vui lòng thử lại.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0a0a0a] border border-[var(--border)] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-black/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#141414] border border-neutral-800 flex items-center justify-center text-[#52a8ff]">
              <IconRegistry name="rocket" size={16} />
            </div>
            <div>
              <Typography variant="body" className="font-semibold text-white">
                Thiết lập triển khai dự án
              </Typography>
              <Typography variant="caption" color="muted" className="font-mono text-[11px]">
                {repo.fullName}
              </Typography>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 transition-colors"
            aria-label="Đóng"
          >
            <IconRegistry name="close" size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* 1. Chọn Nền tảng (Platform Selector) */}
          <div className="space-y-2.5">
            <Typography variant="label" className="text-neutral-400 text-xs uppercase tracking-wider font-mono">
              1. Chọn nền tảng triển khai
            </Typography>
            <div className="grid grid-cols-3 gap-3">
              {PROVIDERS.map((p) => {
                const isSelected = provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProvider(p.id);
                      setError(null);
                    }}
                    className={`p-3.5 text-left border transition-all flex flex-col justify-between h-28 relative group ${
                      isSelected
                        ? 'bg-[#141414] border-[#52a8ff] shadow-[0_0_15px_rgba(82,168,255,0.15)]'
                        : 'bg-[#0d0d0d] border-[var(--border)] hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white text-sm tracking-wide">
                          {p.name}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#52a8ff]" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-snug">
                        {p.tagline}
                      </p>
                    </div>
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">
                      {p.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Chọn Chế độ triển khai (Tabs) */}
          <div className="space-y-2.5">
            <Typography variant="label" className="text-neutral-400 text-xs uppercase tracking-wider font-mono">
              2. Phương thức thực hiện
            </Typography>
            <div className="grid grid-cols-2 border border-[var(--border)] p-1 bg-black gap-1">
              <button
                type="button"
                onClick={() => setMode('launch')}
                className={`py-2 text-xs font-mono font-medium transition-colors ${
                  mode === 'launch'
                    ? 'bg-[#1a1a1a] text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                1-Click Launch (Nhanh)
              </button>
              <button
                type="button"
                onClick={() => setMode('api')}
                className={`py-2 text-xs font-mono font-medium transition-colors ${
                  mode === 'api'
                    ? 'bg-[#1a1a1a] text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Tự động qua API
              </button>
            </div>
          </div>

          {/* Notice & Error */}
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-xs text-red-300 font-mono flex items-start gap-2">
              <IconRegistry name="alert-triangle" size={14} className="shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-mono flex items-start gap-2">
              <IconRegistry name="check" size={14} className="shrink-0 mt-0.5 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Mode 1: 1-Click Launch Tab */}
          {mode === 'launch' && (
            <div className="p-4 bg-[#0d0d0d] border border-neutral-800 space-y-4">
              <div className="space-y-1">
                <Typography variant="body-sm" className="font-medium text-white">
                  Khởi chạy mẫu trên {currentProviderMeta.name}
                </Typography>
                <Typography variant="caption" color="muted" className="leading-relaxed">
                  Hệ thống sẽ mở tab chính thức của {currentProviderMeta.name} với URL repository của bạn đã được gắn sẵn. Bạn chỉ cần xác nhận và bấm Deploy.
                </Typography>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleLaunch}
                  className="gap-2"
                >
                  <span>Mở trang Deploy trên {currentProviderMeta.name}</span>
                  <IconRegistry name="external-link" size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Mode 2: Tự động qua API Tab */}
          {mode === 'api' && (
            <form onSubmit={handleApiDeploy} className="space-y-4">
              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-300 flex items-center justify-between">
                  <span>Tên dự án (Project Name)</span>
                  <span className="text-[10px] text-neutral-500">Ký tự thường, số, dấu gạch ngang</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full h-9 px-3 bg-[#111] border border-[var(--border)] text-white text-xs font-mono focus:border-[#52a8ff] focus:outline-none transition-colors"
                  placeholder="vd: my-awesome-app"
                  required
                />
              </div>

              {/* API Token Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-neutral-300">
                    {currentProviderMeta.name} API Token
                  </label>
                  <a
                    href={currentProviderMeta.tokenDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#52a8ff] hover:underline inline-flex items-center gap-1 font-mono"
                  >
                    <span>Lấy token ở đâu?</span>
                    <IconRegistry name="external-link" size={10} />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  className="w-full h-9 px-3 bg-[#111] border border-[var(--border)] text-white text-xs font-mono focus:border-[#52a8ff] focus:outline-none transition-colors"
                  placeholder={`Dán ${currentProviderMeta.name} API token tại đây...`}
                  required
                />
              </div>

              {/* Cloudflare Account ID (Only for Cloudflare) */}
              {provider === 'cloudflare' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-300 flex items-center justify-between">
                    <span>Cloudflare Account ID</span>
                    <span className="text-[10px] text-neutral-500">Xem ở URL dashboard Cloudflare</span>
                  </label>
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full h-9 px-3 bg-[#111] border border-[var(--border)] text-white text-xs font-mono focus:border-[#52a8ff] focus:outline-none transition-colors"
                    placeholder="32 ký tự hex..."
                    required
                  />
                </div>
              )}

              {/* Checkboxes */}
              <div className="pt-2 space-y-2 border-t border-neutral-900">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={saveToken}
                    onChange={(e) => setSaveToken(e.target.checked)}
                    className="mt-0.5 accent-[#52a8ff]"
                  />
                  <span>Lưu token an toàn vào tài khoản của tôi (mã hóa chuẩn AES-256-GCM)</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300">
                  <input
                    type="checkbox"
                    checked={createWorkflow}
                    onChange={(e) => setCreateWorkflow(e.target.checked)}
                    className="mt-0.5 accent-[#52a8ff]"
                  />
                  <span>
                    Tự động tạo file CI/CD workflow trên GitHub (nhánh{' '}
                    <span className="font-mono text-[#52a8ff]">{repo.defaultBranch}</span>)
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isLoading}>
                  Hủy
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="gap-2">
                  <IconRegistry name="rocket" size={14} />
                  <span>Tạo & Triển khai ngay</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
