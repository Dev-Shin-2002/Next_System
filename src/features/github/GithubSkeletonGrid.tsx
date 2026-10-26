import React from 'react';

export interface GithubSkeletonGridProps {
  count?: number;
}

export const GithubSkeletonGrid: React.FC<GithubSkeletonGridProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-48 p-5 bg-[#0a0a0a] border border-[var(--border)] animate-pulse flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="h-4 bg-white/10 w-2/3" />
            <div className="h-3 bg-white/5 w-full" />
            <div className="h-3 bg-white/5 w-4/5" />
          </div>
          <div className="h-3 bg-white/10 w-1/3" />
        </div>
      ))}
    </div>
  );
};
