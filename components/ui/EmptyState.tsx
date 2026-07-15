'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full glass-purple flex items-center justify-center text-4xl animate-float">
          {icon}
        </div>
        <div className="absolute inset-0 rounded-full glow-purple opacity-30" />
      </div>

      <h3 className="text-heading-md text-white mb-3">{title}</h3>
      <p className="text-white/60 max-w-xs leading-relaxed mb-8">{description}</p>

      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
        >
          {action.label}
        </button>
      )}

      {/* Decorative dots */}
      <div className="mt-12 flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/20"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </motion.div>
  );
}
