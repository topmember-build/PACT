import React from 'react';

interface RuleIconProps {
  icon: string;          // icon identifier from RULE_DESCRIPTIONS
  size?: number;         // px, default 20
  className?: string;
  strokeWidth?: number;
}

const ICON_PATHS: Record<string, React.ReactNode> = {
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  handshake: (
    <>
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.77.78 7.65 7.65 7.65-7.65.78-.78a5.4 5.4 0 0 0 0-7.65z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
};

export default function RuleIcon({ icon, size = 20, className = '', strokeWidth = 1.75 }: RuleIconProps) {
  const paths = ICON_PATHS[icon];
  if (!paths) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
}
