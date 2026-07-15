'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12 mt-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <img src="/assets/pact-logo.jpg" alt="Pact" className="h-12 w-auto rounded-lg" />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Make promises your future self can't break. Onchain commitment enforcement, built on Monad.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-white/40">Monad Testnet</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/create', label: 'Create Pact' },
                { href: '/profile', label: 'Profile' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Security */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">Trust</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/#security', label: 'Security' },
                { href: '/#how-it-works', label: 'How It Works' },
                { href: '/#faq', label: 'FAQ' },
                { href: '/docs', label: 'Documentation' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/40 hover:text-white/80 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © 2026 Pact. Built on{' '}
            <span className="text-primary/70">Monad</span>.
          </p>
          <p className="text-xs text-white/30 italic">
            "Make promises your future self can't break."
          </p>
        </div>
      </div>
    </footer>
  );
}
