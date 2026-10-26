import React from 'react';
import { Button } from '@/components/common/Button';
import { Typography } from '@/components/common/Typography';
import { IconRegistry } from '@/components/common/IconRegistry';

export interface GithubNotConnectedProps {
  onConnect: () => void;
}

export const GithubNotConnected: React.FC<GithubNotConnectedProps> = ({ onConnect }) => {
  return (
    <div className="p-6 bg-[#0e0e0e] border border-amber-500/30 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <IconRegistry name="github" size={24} />
        </div>
        <div>
          <Typography variant="h4" color="primary">
            Tài khoản chưa kết nối với GitHub
          </Typography>
          <Typography variant="body-sm" color="muted" className="mt-1 max-w-lg">
            Để lấy danh sách dự án và kích hoạt đồng bộ hóa tự động qua GitHub API, vui lòng liên kết tài khoản GitHub của bạn.
          </Typography>
        </div>
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={onConnect}
        leftIcon={<IconRegistry name="github" size={16} />}
        className="font-mono whitespace-nowrap"
      >
        Kết nối GitHub ngay
      </Button>
    </div>
  );
};
