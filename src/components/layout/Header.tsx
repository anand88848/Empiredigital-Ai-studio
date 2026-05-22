'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Video, Music, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const NAV = [
  { href: '/',              label: 'Dashboard', icon: LayoutDashboard },
  { href: '/video-editor',  label: 'Video',     icon: Video  },
  { href: '/audio-editor',  label: 'Audio',     icon: Music  },
  { href: '/higgsfield',    label: 'AI Gen',    icon: Sparkles },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 shadow-lg shadow-brand-900/50 group-hover:bg-brand-500 transition-colors">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="hidden sm:block font-bold text-white tracking-tight">
            Empiredigital <span className="text-brand-400">AI Studio</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                pathname === href
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-gray-400 hover:text-white hover:bg-surface-muted',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-surface-muted"
          onClick={() => setMenuOpen(v => !v)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface-card px-4 py-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                pathname === href ? 'bg-brand-600/20 text-brand-400' : 'text-gray-400 hover:text-white',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
