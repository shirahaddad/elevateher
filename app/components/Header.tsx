'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: "I'm Ready", href: '/ready' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            ElevateHer
          </Link>
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-gray-600 hover:text-gray-900 transition-colors ${
                    pathname === item.href ? 'text-gray-900 font-semibold' : ''
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
} 