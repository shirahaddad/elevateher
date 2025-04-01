'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-purple-900">
          Elevate(Her)
        </Link>

        <div className="hidden md:flex space-x-8">
          <Link href="/about/shira" className="text-gray-600 hover:text-purple-900">
            About
          </Link>
          <Link href="/services" className="text-gray-600 hover:text-purple-900">
            Services
          </Link>
          <Link href="/team" className="text-gray-600 hover:text-purple-900">
            Team
          </Link>
          <Link href="/questionnaire" className="text-gray-600 hover:text-purple-900">
            Get Started
          </Link>
        </div>

        <div className="md:hidden">
          <input type="checkbox" id="menu-toggle" className="hidden" />
          <label htmlFor="menu-toggle" className="text-gray-600 hover:text-purple-900 cursor-pointer">
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
          </label>
        </div>
      </nav>

      <div className="md:hidden hidden peer-checked:block">
        <div className="flex flex-col space-y-4 p-4 bg-white shadow-md">
          <Link
            href="/about/shira"
            className="text-gray-600 hover:text-purple-900"
          >
            About
          </Link>
          <Link
            href="/services"
            className="text-gray-600 hover:text-purple-900"
          >
            Services
          </Link>
          <Link
            href="/team"
            className="text-gray-600 hover:text-purple-900"
          >
            Team
          </Link>
          <Link
            href="/questionnaire"
            className="text-gray-600 hover:text-purple-900"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
} 