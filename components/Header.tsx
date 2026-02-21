'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function NavLink({
  href,
  children,
  current,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
}) {
  return (
    <Link
      href={href}
      className="text-white hover:text-purple-200"
      aria-current={current ? 'page' : undefined}
      onClick={current ? undefined : undefined}
    >
      {children}
    </Link>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-purple-900 shadow-sm" role="banner">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center" aria-label="Main navigation">
        <Link href="/" className="text-2xl font-bold text-white uppercase">
          Elevate(Her)
        </Link>

        <div className="hidden md:flex space-x-8">
          <NavLink href="/about" current={pathname === '/about' || pathname?.startsWith('/about/')}>
            About
          </NavLink>
          <NavLink href="/services" current={pathname?.startsWith('/services')}>
            Services
          </NavLink>
          <NavLink href="/blog" current={pathname === '/blog' || pathname?.startsWith('/blog/')}>
            Blog
          </NavLink>
          <NavLink href="/learn-more" current={pathname === '/learn-more'}>
            Get Started
          </NavLink>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white hover:text-purple-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}
        role="navigation"
        aria-label="Mobile menu"
      >
        <div className="flex flex-col space-y-4 p-4 bg-purple-900">
          <Link
            href="/about"
            className="text-white hover:text-purple-200"
            onClick={() => setIsMenuOpen(false)}
            aria-current={pathname === '/about' || pathname?.startsWith('/about/') ? 'page' : undefined}
          >
            About
          </Link>
          <Link
            href="/services"
            className="text-white hover:text-purple-200"
            onClick={() => setIsMenuOpen(false)}
            aria-current={pathname?.startsWith('/services') ? 'page' : undefined}
          >
            Services
          </Link>
          <Link
            href="/blog"
            className="text-white hover:text-purple-200"
            onClick={() => setIsMenuOpen(false)}
            aria-current={pathname === '/blog' || pathname?.startsWith('/blog/') ? 'page' : undefined}
          >
            Blog
          </Link>
          <Link
            href="/learn-more"
            className="text-white hover:text-purple-200"
            onClick={() => setIsMenuOpen(false)}
            aria-current={pathname === '/learn-more' ? 'page' : undefined}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
} 