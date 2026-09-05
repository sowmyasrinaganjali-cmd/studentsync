import React from 'react';
import { StudyMember } from '../../types';

interface MemberAvatarProps {
  name?: string;
  member?: StudyMember;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'studying' | 'away' | 'offline';
  showStatus?: boolean;
  className?: string;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-700' },
  violet: { bg: 'bg-violet-600', text: 'text-white', border: 'border-violet-700' },
  emerald: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700' },
  amber: { bg: 'bg-amber-600', text: 'text-white', border: 'border-amber-700' },
  rose: { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700' },
  cyan: { bg: 'bg-cyan-600', text: 'text-white', border: 'border-cyan-700' },
  blue: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-700' },
  teal: { bg: 'bg-teal-600', text: 'text-white', border: 'border-teal-700' },
};

const COLOR_KEYS = Object.keys(COLOR_MAP);

export const getInitials = (name?: string): string => {
  if (!name || typeof name !== 'string') return 'U';
  const clean = name.replace(/\(You\)|\(Host\)/gi, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getColorForName = (name?: string, fallback?: string): { bg: string; text: string; border: string } => {
  if (fallback && COLOR_MAP[fallback]) {
    return COLOR_MAP[fallback];
  }
  const safeName = (name || 'Student').trim();
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const key = COLOR_KEYS[Math.abs(hash) % COLOR_KEYS.length];
  return COLOR_MAP[key] || COLOR_MAP.indigo;
};

export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  name,
  member,
  color,
  size = 'md',
  status,
  showStatus = false,
  className = '',
}) => {
  const displayName = (member?.name || name || 'Student').trim();
  const effectiveColor = member?.color || color;
  const effectiveStatus = member?.status || status;

  const palette = getColorForName(displayName, effectiveColor);
  const initials = getInitials(displayName);

  const sizeStyles = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm font-bold',
    xl: 'w-14 h-14 text-base font-bold',
  }[size];

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
  }[size];

  const statusColor = {
    studying: 'bg-indigo-500 ring-indigo-200',
    online: 'bg-emerald-500 ring-emerald-200',
    away: 'bg-amber-400 ring-amber-200',
    offline: 'bg-slate-300 ring-slate-100',
  }[effectiveStatus || 'online'];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`${sizeStyles} rounded-full ${palette.bg} ${palette.text} font-bold flex items-center justify-center select-none shadow-2xs`}
        title={displayName}
      >
        <span>{initials}</span>
      </div>

      {showStatus && effectiveStatus && (
        <span
          className={`absolute bottom-0 right-0 ${statusDotSizes} rounded-full ${statusColor} ring-2 ring-white`}
          title={`Status: ${effectiveStatus}`}
        />
      )}
    </div>
  );
};
