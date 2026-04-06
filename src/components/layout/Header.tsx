'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import Image from 'next/image';
import { NAV_ITEMS } from '@/lib/constants';

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => {
      if (menuOpen) return;
      const y = window.scrollY;
      setHidden(y > 80 && y > lastY);
      setLastY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY, menuOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{ background: 'var(--background)' }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
            style={{ color: 'var(--foreground)' }}
          >
            <Image src="/favicon.ico" alt="fray-cloud" width={24} height={24} />
            fray-cloud
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-sm font-medium transition-colors hover:text-[var(--color-accent)]"
                style={{ color: 'var(--muted)' }}
              >
                {label}
              </Link>
            ))}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--card)]"
                aria-label="Toggle theme"
              >
                <ThemeIcon theme={theme} />
              </button>
            )}
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-3 md:hidden">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--card)]"
                aria-label="Toggle theme"
              >
                <ThemeIcon theme={theme} />
              </button>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="relative h-4 w-5">
                <span
                  className="absolute left-0 h-0.5 w-5 transition-all duration-300"
                  style={{
                    background: 'var(--foreground)',
                    top: menuOpen ? '50%' : '0',
                    transform: menuOpen
                      ? 'translateY(-50%) rotate(45deg)'
                      : 'none',
                  }}
                />
                <span
                  className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 transition-opacity duration-300"
                  style={{
                    background: 'var(--foreground)',
                    opacity: menuOpen ? 0 : 1,
                  }}
                />
                <span
                  className="absolute left-0 h-0.5 w-5 transition-all duration-300"
                  style={{
                    background: 'var(--foreground)',
                    bottom: menuOpen ? 'auto' : '0',
                    top: menuOpen ? '50%' : 'auto',
                    transform: menuOpen
                      ? 'translateY(-50%) rotate(-45deg)'
                      : 'none',
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center transition-all duration-500 md:hidden ${
          menuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        style={{ background: 'var(--background)' }}
      >
        <nav className="flex flex-col items-center gap-8">
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-3xl font-bold transition-colors hover:text-[var(--color-accent)]"
              style={{ color: 'var(--foreground)' }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

function ThemeIcon({ theme }: { theme: string | undefined }) {
  if (theme === 'dark') {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
