'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-purple-900 shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white uppercase">
          Elevate(Her)
        </Link>

        <div className="hidden md:flex space-x-8">
          <Link href="/about" className="text-white hover:text-purple-200">
            About
          </Link>
          <Link href="/services" className="text-white hover:text-purple-200">
            Services
          </Link>
          <Link href="/blog" className="text-white hover:text-purple-200">
            Blog
          </Link>
          <Link href="/questionnaire" className="text-white hover:text-purple-200">
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white hover:text-purple-200 focus:outline-none"
          aria-label="Toggle menu"
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
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col space-y-4 p-4 bg-purple-900">
          <Link
            href="/about"
            className="text-white hover:text-purple-200"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/services"
            className="text-white hover:text-purple-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href="/blog"
            className="text-white hover:text-purple-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Blog
          </Link>
          <Link
            href="/questionnaire"
            className="text-white hover:text-purple-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
} 