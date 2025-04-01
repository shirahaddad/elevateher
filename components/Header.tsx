import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

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

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-600 hover:text-purple-900"
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
            {isOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white shadow-md md:hidden">
            <div className="flex flex-col space-y-4 p-4">
              <Link
                href="/about/shira"
                className="text-gray-600 hover:text-purple-900"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/services"
                className="text-gray-600 hover:text-purple-900"
                onClick={() => setIsOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/team"
                className="text-gray-600 hover:text-purple-900"
                onClick={() => setIsOpen(false)}
              >
                Team
              </Link>
              <Link
                href="/questionnaire"
                className="text-gray-600 hover:text-purple-900"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
} 