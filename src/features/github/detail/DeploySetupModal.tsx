'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Button,
  TextField,
  Input,
  Select,
  Checkbox,
  IconRegistry,
} from '@/components/common';
import { setupGithubRepoDeployment, scanGithubRepoEnvExample } from '@/app/api/github/repos';
import type {
  Repo,
  SetupDeploymentResponse,
  EnvVarConfig,
  SetupDeploymentRequest,
} from '@/app/api/github/repo-detail.types';

export interface DeploySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: Repo;
  onSuccess?: (res: SetupDeploymentResponse) => void;
}

type ProviderType = 'vercel' | 'render' | 'cloudflare';

interface ProviderMeta {
  id: ProviderType;
  name: string;
  tagline: string;
  badge: string;
  tokenDocUrl: string;
}

const PROVIDERS: ProviderMeta[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    tagline: 'Frontend, Next.js, Static & Edge',
    badge: 'Khuyên dùng cho Frontend',
    tokenDocUrl: 'https://vercel.com/account/tokens',
  },
  {
    id: 'render',
    name: 'Render',
    tagline: 'Backend API, Node.js, Docker & Worker',
    badge: 'Khuyên dùng cho Backend / Fullstack',
    tokenDocUrl: 'https://dashboard.render.com/u/settings#api-keys',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    tagline: 'Edge CDN, Static Web & Serverless Pages',
    badge: 'Toàn cầu / Edge CDN',
    tokenDocUrl: 'https://dash.cloudflare.com/profile/api-tokens',
  },
];

const RENDER_REGIONS = [
  { value: 'singapore', label: 'Singapore (Đông Nam Á - Ping thấp nhất)' },
  { value: 'oregon', label: 'Oregon, USA (Tây Hoa Kỳ)' },
  { value: 'ohio', label: 'Ohio, USA (Đông Hoa Kỳ)' },
  { value: 'frankfurt', label: 'Frankfurt, Đức (Châu Âu)' },
  { value: 'virginia', label: 'Virginia, USA' },
];

const VERCEL_FRAMEWORKS = [
  { value: 'nextjs', label: 'Next.js' },
  { value: 'vite', label: 'Vite' },
  { value: 'remix', label: 'Remix' },
  { value: 'astro', label: 'Astro' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxtjs', label: 'Nuxt.js' },
  { value: 'create-react-app', label: 'Create React App' },
  { value: 'other', label: 'Khác / Tùy chỉnh (Other)' },
];

/**
 * Trích xuất các cặp KEY=VALUE từ nội dung file text .env
 */
function parseDotEnv(text: string): EnvVarConfig[] {
  const lines = text.split(/\r?\n/);
  const result: EnvVarConfig[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      result.push({ key, type: 'value', value: val });
    }
  }
  return result;
}

export const DeploySetupModal: React.FC<DeploySetupModalProps> = ({
  isOpen,
  onClose,
  repo,
  onSuccess,
}) => {
  const [provider, setProvider] = useState<ProviderType>('vercel');
  const [projectName, setProjectName] = useState<string>(
    repo.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-')
  );
  const [apiToken, setApiToken] = useState<string>('');
  const [saveToken, setSaveToken] = useState<boolean>(true);

  // --- 1. RENDER SPECIFIC STATE ---
  const [renderRegion, setRenderRegion] = useState<string>('singapore');
  const [renderBranch, setRenderBranch] = useState<string>(repo.defaultBranch || 'main');
  const [renderRootDir, setRenderRootDir] = useState<string>('');
  const [renderBuildCmd, setRenderBuildCmd] = useState<string>('npm install && npm run build');
  const [renderStartCmd, setRenderStartCmd] = useState<string>('npm start');
  const [renderAutoDeploy, setRenderAutoDeploy] = useState<boolean>(true);

  // --- 2. VERCEL SPECIFIC STATE ---
  const [vercelFramework, setVercelFramework] = useState<string>('nextjs');
  const [vercelRootDir, setVercelRootDir] = useState<string>('');
  const [vercelBuildCmd, setVercelBuildCmd] = useState<string>('');
  const [vercelOutputDir, setVercelOutputDir] = useState<string>('');
  const [vercelInstallCmd, setVercelInstallCmd] = useState<string>('');

  // --- 3. CLOUDFLARE SPECIFIC STATE ---
  const [cfAccountId, setCfAccountId] = useState<string>('');
  const [cfBranch, setCfBranch] = useState<string>(repo.defaultBranch || 'main');
  const [cfRootDir, setCfRootDir] = useState<string>('');
  const [cfBuildCmd, setCfBuildCmd] = useState<string>('npm run build');
  const [cfOutputDir, setCfOutputDir] = useState<string>('dist');
  const [cfCreateWorkflow, setCfCreateWorkflow] = useState<boolean>(true);

  // --- BIẾN MÔI TRƯỜNG (.env) ---
  const [envVars, setEnvVars] = useState<EnvVarConfig[]>([]);
  const [isScanningEnv, setIsScanningEnv] = useState<boolean>(false);
  const [foundEnvFile, setFoundEnvFile] = useState<string | null>(null);

  // Nhập text .env nhanh
  const [isPasteOpen, setIsPasteOpen] = useState<boolean>(false);
  const [rawEnvText, setRawEnvText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trạng thái xử lý
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Tự động quét file .env.example trên GitHub khi mở modal
  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    setIsScanningEnv(true);
    setFoundEnvFile(null);

    scanGithubRepoEnvExample(repo.id)
      .then((res) => {
        if (!mounted) return;
        if (res.foundFile && res.keys && res.keys.length > 0) {
          setFoundEnvFile(res.foundFile);
          setEnvVars(
            res.keys.map((k) => {
              const isSecret = /secret|key|salt|token|jwt|auth|hash/i.test(k);
              return {
                key: k,
                type: isSecret ? 'generate_value' : 'value',
                value: '',
              };
            })
          );
        } else {
          setEnvVars([
            { key: 'NODE_ENV', type: 'value', value: 'production' },
            { key: 'PORT', type: 'value', value: '3000' },
          ]);
        }
      })
      .catch(() => {
        if (mounted) {
          setEnvVars([
            { key: 'NODE_ENV', type: 'value', value: 'production' },
            { key: 'PORT', type: 'value', value: '3000' },
          ]);
        }
      })
      .finally(() => {
        if (mounted) setIsScanningEnv(false);
      });

    return () => {
      mounted = false;
    };
  }, [isOpen, repo.id]);

  if (!isOpen) return null;

  const currentProviderMeta = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { key: '', type: 'value', value: '' }]);
  };

  const handleRemoveEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, idx) => idx !== index));
  };

  const handleUpdateEnvVarKey = (index: number, key: string) => {
    const updated = [...envVars];
    const upperKey = key.toUpperCase().replace(/\s+/g, '_');
    updated[index].key = upperKey;
    if (/secret|key|salt|token|jwt|auth|hash/i.test(upperKey)) {
      if (updated[index].type !== 'generate_value') {
        updated[index].type = 'generate_value';
      }
    }
    setEnvVars(updated);
  };

  const handleUpdateEnvVarValue = (index: number, val: string) => {
    const updated = [...envVars];
    updated[index].value = val;
    updated[index].type = 'value';
    setEnvVars(updated);
  };

  const handleGenerateSecret = (index: number) => {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const updated = [...envVars];
    updated[index].value = randomHex;
    updated[index].type = 'value';
    setEnvVars(updated);
  };

  // Import file .env từ máy tính
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const parsed = parseDotEnv(content);
        if (parsed.length > 0) {
          const map = new Map<string, EnvVarConfig>();
          for (const item of envVars) {
            if (item.key.trim()) map.set(item.key.trim(), item);
          }
          for (const item of parsed) {
            map.set(item.key, item);
          }
          setEnvVars(Array.from(map.values()));
          setSuccessNotice(`Đã import thành công ${parsed.length} biến môi trường từ file!`);
          setTimeout(() => setSuccessNotice(null), 3000);
        } else {
          setError('Không tìm thấy biến môi trường hợp lệ trong file.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Áp dụng text dán nhanh
  const handleApplyRawEnv = () => {
    if (!rawEnvText.trim()) return;
    const parsed = parseDotEnv(rawEnvText);
    if (parsed.length > 0) {
      const map = new Map<string, EnvVarConfig>();
      for (const item of envVars) {
        if (item.key.trim()) map.set(item.key.trim(), item);
      }
      for (const item of parsed) {
        map.set(item.key, item);
      }
      setEnvVars(Array.from(map.values()));
      setRawEnvText('');
      setIsPasteOpen(false);
      setSuccessNotice(`Đã nhập ${parsed.length} biến môi trường từ văn bản!`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } else {
      setError('Vui lòng nhập định dạng KEY=VALUE (mỗi biến 1 dòng).');
    }
  };

  // Triển khai tự động qua API
  const handleApiDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);

    if (!apiToken.trim()) {
      setError(`Vui lòng nhập API Token của ${currentProviderMeta.name}.`);
      return;
    }

    const validEnvVars = envVars.filter((v) => v.key.trim().length > 0);

    // Kiểm tra biến DATABASE_URL bắt buộc cho Backend
    const dbVar = validEnvVars.find((v) => v.key.toUpperCase() === 'DATABASE_URL');
    if (dbVar && !dbVar.value?.trim()) {
      setError('Biến DATABASE_URL đang để trống giá trị. Ứng dụng Backend yêu cầu chuỗi kết nối Database để chạy. Vui lòng điền giá trị (hoặc bấm "Import .env" / "Dán text" từ file .env máy bạn) trước khi triển khai.');
      return;
    }

    const baseRequest: SetupDeploymentRequest = {
      provider,
      mode: 'api',
      projectName: projectName.trim(),
      apiToken: apiToken.trim(),
      saveToken,
      envVars: validEnvVars,
    };

    if (provider === 'render') {
      if (!renderStartCmd.trim()) {
        setError('Render yêu cầu cung cấp Lệnh khởi chạy (Start Command) cho Web Service.');
        return;
      }
      baseRequest.region = renderRegion;
      baseRequest.branch = renderBranch.trim() || repo.defaultBranch;
      baseRequest.rootDirectory = renderRootDir.trim() || undefined;
      baseRequest.buildCommand = renderBuildCmd.trim() || 'npm install && npm run build';
      baseRequest.startCommand = renderStartCmd.trim();
      baseRequest.autoDeploy = renderAutoDeploy;
    } else if (provider === 'vercel') {
      baseRequest.framework = vercelFramework === 'other' ? undefined : vercelFramework;
      baseRequest.rootDirectory = vercelRootDir.trim() || undefined;
      baseRequest.buildCommand = vercelBuildCmd.trim() || undefined;
      baseRequest.outputDirectory = vercelOutputDir.trim() || undefined;
      baseRequest.installCommand = vercelInstallCmd.trim() || undefined;
    } else if (provider === 'cloudflare') {
      if (!cfAccountId.trim()) {
        setError('Vui lòng cung cấp Cloudflare Account ID (32 ký tự hex).');
        return;
      }
      baseRequest.accountId = cfAccountId.trim();
      baseRequest.branch = cfBranch.trim() || repo.defaultBranch;
      baseRequest.rootDirectory = cfRootDir.trim() || undefined;
      baseRequest.buildCommand = cfBuildCmd.trim() || 'npm run build';
      baseRequest.outputDir = cfOutputDir.trim() || 'dist';
      baseRequest.createWorkflow = cfCreateWorkflow;
    }

    setIsLoading(true);
    try {
      const res = await setupGithubRepoDeployment(repo.id, baseRequest);
      setSuccessNotice(res.message || `Khởi tạo và kết nối triển khai thành công trên ${currentProviderMeta.name}!`);
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
          : 'Không thể thiết lập triển khai qua API. Vui lòng kiểm tra lại token và cấu hình.';
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
        className="bg-[#0a0a0a] border border-[var(--border)] max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File Input for .env Import */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".env,.env.*,.txt"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#52a8ff]" />
            <div>
              <Typography variant="body-sm" className="font-semibold text-white tracking-wide">
                Cấu hình Triển khai Chuyên biệt
              </Typography>
              <Typography variant="caption" color="muted" className="font-mono text-[11px]">
                {repo.fullName} (Nhánh mặc định: <span className="text-[#52a8ff]">{repo.defaultBranch}</span>)
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

        {/* Modal Body & Form */}
        <form onSubmit={handleApiDeploy} className="flex flex-col max-h-[82vh]">
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* 1. Chọn Nền tảng (Platform Selector) */}
            <div className="space-y-2.5">
              <Typography variant="label" className="text-neutral-400 text-xs uppercase tracking-wider font-mono">
                1. Chọn nền tảng mục tiêu
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
                      className={`p-3.5 text-left border transition-all flex flex-col justify-between h-28 relative group ${isSelected
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
                        <Typography variant="caption" color="muted" className="line-clamp-2 mt-1 leading-snug text-[11px]">
                          {p.tagline}
                        </Typography>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase">
                        {p.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Thông báo lỗi & thành công */}
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-xs text-red-300 font-mono flex items-start gap-2">
                <IconRegistry name="alert-triangle" size={14} className="shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-mono flex items-start gap-2">
                <IconRegistry name="check-circle" size={14} className="shrink-0 mt-0.5 text-emerald-400" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* 2. Tên dự án (Project Name) - Sử dụng TextField có sẵn */}
            <TextField
              size="sm"
              label="2. Tên dự án (Project Name)"
              hint="Ký tự thường, số, dấu gạch ngang"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="vd: my-awesome-project"
              required
            />

            {/* 3. FORM CHUYÊN BIỆT THEO NỀN TẢNG (RENDER / VERCEL / CLOUDFLARE) */}

            {/* --- NỀN TẢNG 1: RENDER --- */}
            {provider === 'render' && (
              <div className="space-y-4 border border-emerald-900/40 bg-[#07130e]/40 p-4 rounded-none">
                <div className="flex items-center justify-between border-b border-emerald-900/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#46e3b7]" />
                    <Typography variant="body-sm" className="font-semibold text-emerald-400 font-mono uppercase tracking-wider text-xs">
                      3. Cấu hình Render Web Service (Node.js API)
                    </Typography>
                  </div>
                  <Typography variant="caption" color="muted" className="font-mono text-[10px]">
                    Chuyên dụng Backend & Server
                  </Typography>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Region Select */}
                  <div className="flex flex-col gap-1.5">
                    <Typography as="label" variant="label">
                      Vùng máy chủ (Region)
                    </Typography>
                    <Select
                      size="sm"
                      value={renderRegion}
                      onChange={(e) => setRenderRegion(e.target.value)}
                      options={RENDER_REGIONS}
                    />
                  </div>

                  {/* Branch TextField */}
                  <TextField
                    size="sm"
                    label="Nhánh triển khai (Branch)"
                    value={renderBranch}
                    onChange={(e) => setRenderBranch(e.target.value)}
                    placeholder="main"
                  />
                </div>

                {/* Root Directory TextField */}
                <TextField
                  size="sm"
                  label="Thư mục gốc / Root Directory (Tùy chọn)"
                  hint="Dành cho monorepo, ví dụ: backend"
                  value={renderRootDir}
                  onChange={(e) => setRenderRootDir(e.target.value)}
                  placeholder="Để trống nếu package.json ở thư mục gốc repo"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Build Command TextField */}
                  <TextField
                    size="sm"
                    label="Build Command (Lệnh đóng gói)"
                    value={renderBuildCmd}
                    onChange={(e) => setRenderBuildCmd(e.target.value)}
                    placeholder="npm install && npm run build"
                    required
                  />

                  {/* Start Command TextField */}
                  <TextField
                    size="sm"
                    label="Start Command (Bắt buộc)"
                    hint="Render yêu cầu start command"
                    value={renderStartCmd}
                    onChange={(e) => setRenderStartCmd(e.target.value)}
                    placeholder="npm start hoặc node dist/index.js"
                    required
                  />
                </div>

                {/* Auto Deploy Checkbox */}
                <Checkbox
                  checked={renderAutoDeploy}
                  onChange={(e) => setRenderAutoDeploy(e.target.checked)}
                  label={`Tự động kích hoạt deploy khi có commit mới push lên nhánh ${renderBranch}`}
                />
              </div>
            )}

            {/* --- NỀN TẢNG 2: VERCEL --- */}
            {provider === 'vercel' && (
              <div className="space-y-4 border border-blue-900/40 bg-[#08101a]/40 p-4 rounded-none">
                <div className="flex items-center justify-between border-b border-blue-900/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#52a8ff]" />
                    <Typography variant="body-sm" className="font-semibold text-[#52a8ff] font-mono uppercase tracking-wider text-xs">
                      3. Cấu hình Vercel Frontend & Serverless
                    </Typography>
                  </div>
                  <Typography variant="caption" color="muted" className="font-mono text-[10px]">
                    Next.js, Vite & Jamstack
                  </Typography>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Framework Preset Select */}
                  <div className="flex flex-col gap-1.5">
                    <Typography as="label" variant="label">
                      Framework Preset
                    </Typography>
                    <Select
                      size="sm"
                      value={vercelFramework}
                      onChange={(e) => setVercelFramework(e.target.value)}
                      options={VERCEL_FRAMEWORKS}
                    />
                  </div>

                  {/* Root Directory TextField */}
                  <TextField
                    size="sm"
                    label="Root Directory (Tùy chọn)"
                    hint="Monorepo: frontend"
                    value={vercelRootDir}
                    onChange={(e) => setVercelRootDir(e.target.value)}
                    placeholder="Để trống nếu ở root repo"
                  />
                </div>

                {/* Override Build Settings */}
                <div className="space-y-2.5 border border-neutral-800/80 bg-[#0d131a] p-3">
                  <Typography variant="caption" color="muted" className="font-mono text-[11px] block">
                    Tùy chỉnh ghi đè (Overrides - để trống để dùng thiết lập mặc định của Framework):
                  </Typography>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <TextField
                      size="sm"
                      label="Build Command"
                      value={vercelBuildCmd}
                      onChange={(e) => setVercelBuildCmd(e.target.value)}
                      placeholder="vd: next build"
                    />
                    <TextField
                      size="sm"
                      label="Output Directory"
                      value={vercelOutputDir}
                      onChange={(e) => setVercelOutputDir(e.target.value)}
                      placeholder="vd: .next hoặc dist"
                    />
                    <TextField
                      size="sm"
                      label="Install Command"
                      value={vercelInstallCmd}
                      onChange={(e) => setVercelInstallCmd(e.target.value)}
                      placeholder="vd: npm install"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- NỀN TẢNG 3: CLOUDFLARE PAGES --- */}
            {provider === 'cloudflare' && (
              <div className="space-y-4 border border-orange-900/40 bg-[#170e06]/40 p-4 rounded-none">
                <div className="flex items-center justify-between border-b border-orange-900/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#f38020]" />
                    <Typography variant="body-sm" className="font-semibold text-[#f38020] font-mono uppercase tracking-wider text-xs">
                      3. Cấu hình Cloudflare Pages & Edge CDN
                    </Typography>
                  </div>
                  <Typography variant="caption" color="muted" className="font-mono text-[10px]">
                    Edge Pages & Worker
                  </Typography>
                </div>

                {/* Cloudflare Account ID TextField */}
                <TextField
                  size="sm"
                  label="Cloudflare Account ID (Bắt buộc)"
                  hint="32 ký tự hex từ URL dash.cloudflare.com/<accountId>"
                  value={cfAccountId}
                  onChange={(e) => setCfAccountId(e.target.value)}
                  placeholder="vd: 7a8b9c..."
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Production Branch TextField */}
                  <TextField
                    size="sm"
                    label="Nhánh sản xuất (Production Branch)"
                    value={cfBranch}
                    onChange={(e) => setCfBranch(e.target.value)}
                    placeholder="main"
                  />

                  {/* Root Directory TextField */}
                  <TextField
                    size="sm"
                    label="Root Directory (Tùy chọn)"
                    hint="Monorepo: frontend"
                    value={cfRootDir}
                    onChange={(e) => setCfRootDir(e.target.value)}
                    placeholder="Để trống nếu ở root repo"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Build Command TextField */}
                  <TextField
                    size="sm"
                    label="Build Command"
                    value={cfBuildCmd}
                    onChange={(e) => setCfBuildCmd(e.target.value)}
                    placeholder="npm run build"
                    required
                  />

                  {/* Output Directory TextField */}
                  <TextField
                    size="sm"
                    label="Build Output Directory"
                    hint="vd: dist hoặc out"
                    value={cfOutputDir}
                    onChange={(e) => setCfOutputDir(e.target.value)}
                    placeholder="dist"
                    required
                  />
                </div>

                {/* Workflow CI/CD Checkbox */}
                <Checkbox
                  checked={cfCreateWorkflow}
                  onChange={(e) => setCfCreateWorkflow(e.target.checked)}
                  label="Tự động tạo CI/CD GitHub Actions workflow"
                  description="Commit file .github/workflows/deploy.yml để tự động deploy Cloudflare Pages mỗi khi push commit."
                />
              </div>
            )}

            {/* 4. Cấu hình Biến môi trường (.env) */}
            <div className="space-y-2.5 border border-neutral-800 bg-[#0c0c0c] p-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Typography variant="body-sm" className="font-mono font-medium text-neutral-200 text-xs">
                    4. Biến môi trường (.env)
                  </Typography>
                  {isScanningEnv ? (
                    <span className="text-[10px] text-[#52a8ff] font-mono animate-pulse">
                      Đang quét repo...
                    </span>
                  ) : foundEnvFile ? (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-mono">
                      Quét từ {foundEnvFile}
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {envVars.length} biến
                    </span>
                  )}
                </div>

                {/* Action Toolbar with Button Component */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-1 text-[11px] h-7"
                    title="Chọn file .env từ máy tính để import"
                  >
                    <IconRegistry name="upload" size={12} />
                    <span>Import .env</span>
                  </Button>

                  <Button
                    type="button"
                    variant={isPasteOpen ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setIsPasteOpen(!isPasteOpen)}
                    className="gap-1 text-[11px] h-7"
                    title="Dán nhanh nội dung file .env dạng text"
                  >
                    <IconRegistry name="file-text" size={12} />
                    <span>Dán text</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddEnvVar}
                    className="gap-1 text-[11px] h-7 text-[#52a8ff] hover:text-[#79bcff]"
                  >
                    <IconRegistry name="plus" size={12} />
                    <span>Thêm biến</span>
                  </Button>
                </div>
              </div>

              {/* Gợi ý nhập giá trị .env thực tế */}
              <div className="p-2.5 bg-neutral-900/60 border border-neutral-800 text-[11px] font-mono text-neutral-400 flex items-start gap-2">
                <IconRegistry name="info" size={13} className="shrink-0 mt-0.5 text-[#52a8ff]" />
                <span>
                  Các biến quét tự động từ file mẫu (.env.example) có thể đang để trống giá trị. Hãy nhập giá trị thực tế (như <span className="text-white">DATABASE_URL</span>) hoặc bấm <span className="text-[#52a8ff] font-semibold">&quot;Import .env&quot; / &quot;Dán text&quot;</span> từ file .env thật của bạn.
                </span>
              </div>

              {/* Paste Text Area */}
              {isPasteOpen && (
                <div className="p-3 bg-[#111] border border-neutral-700 space-y-2 mt-2">
                  <Typography variant="caption" className="font-mono text-neutral-300 block text-[11px]">
                    Dán nội dung .env vào đây:
                  </Typography>
                  <textarea
                    value={rawEnvText}
                    onChange={(e) => setRawEnvText(e.target.value)}
                    rows={4}
                    placeholder={`DATABASE_URL=postgres://user:pass@host:5432/db\nJWT_SECRET=supersecret123\nPORT=3000`}
                    className="w-full p-2.5 bg-[#0a0a0a] border border-neutral-800 text-white font-mono text-[11px] focus:border-[#52a8ff] focus:outline-none resize-y"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRawEnvText('');
                        setIsPasteOpen(false);
                      }}
                      className="text-[11px] h-7"
                    >
                      Đóng
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleApplyRawEnv}
                      className="text-[11px] h-7"
                    >
                      Áp dụng vào danh sách
                    </Button>
                  </div>
                </div>
              )}

              {/* Danh sách biến môi trường sử dụng Input Component */}
              {envVars.length === 0 ? (
                <div className="py-3 text-center text-xs text-neutral-500 font-mono border border-dashed border-neutral-800">
                  Chưa có biến môi trường nào. Bấm &quot;Import .env&quot; hoặc &quot;Thêm biến&quot; để cấu hình.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 pt-1">
                  {envVars.map((item, idx) => {
                    const isSecretKey = /secret|key|salt|token|jwt|auth|hash/i.test(item.key);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-5/12">
                          <Input
                            size="sm"
                            value={item.key}
                            onChange={(e) => handleUpdateEnvVarKey(idx, e.target.value)}
                            placeholder="KEY_NAME"
                            className="uppercase font-mono text-[11px]"
                          />
                        </div>
                        <div className="w-6/12">
                          <Input
                            size="sm"
                            value={item.value || ''}
                            onChange={(e) => handleUpdateEnvVarValue(idx, e.target.value)}
                            placeholder={
                              isSecretKey && !item.value
                                ? '(Tự động sinh bí mật ngẫu nhiên)'
                                : 'Giá trị...'
                            }
                            className="font-mono text-[11px]"
                            rightSlot={
                              isSecretKey ? (
                                <button
                                  type="button"
                                  onClick={() => handleGenerateSecret(idx)}
                                  className="px-2 text-neutral-400 hover:text-[#52a8ff] flex items-center h-full transition-colors"
                                  title="Tạo chuỗi bí mật ngẫu nhiên an toàn"
                                >
                                  <IconRegistry name="refresh" size={12} />
                                </button>
                              ) : null
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEnvVar(idx)}
                          className="text-neutral-500 hover:text-red-400 p-1.5 shrink-0 h-8 w-8"
                          title="Xóa biến này"
                        >
                          <IconRegistry name="trash" size={13} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Thông tin xác thực API Token sử dụng TextField Component */}
            <div className="space-y-3 border border-neutral-800 bg-[#0c0c0c] p-3.5">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span />
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
                <TextField
                  size="sm"
                  type="password"
                  label={`5. ${currentProviderMeta.name} API Token`}
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder={`Dán ${currentProviderMeta.name} API token tại đây...`}
                  required
                />
              </div>

              {/* Checkbox lưu token sử dụng Checkbox Component */}
              <div className="pt-2 space-y-2 border-t border-neutral-900">
                <Checkbox
                  checked={saveToken}
                  onChange={(e) => setSaveToken(e.target.checked)}
                  label="Lưu token an toàn vào tài khoản của tôi"
                  description="Mã hóa chuẩn AES-256-GCM trên hệ thống"
                />
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono py-1">
                  <IconRegistry name="check-circle" size={13} className="shrink-0" />
                  <span>Chế độ bảo mật cao: Toàn bộ biến môi trường & project đều gọi API trực tiếp, chỉ lưu DB khi cloud phản hồi HTTP 200/201.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="px-6 py-4 border-t border-[var(--border)] bg-[#111] flex items-center justify-between">
            <Typography variant="caption" color="muted" className="font-mono text-[11px]">
              Chỉ tạo liên kết khi máy chủ {currentProviderMeta.name} tạo project thành công.
            </Typography>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isLoading}>
                Hủy
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isLoading} className="gap-2">
                <IconRegistry name="rocket" size={14} />
                <span>Khởi tạo & Triển khai ngay</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
