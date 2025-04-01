import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-purple-900 shadow-sm">
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
          <Link href="/questionnaire" className="text-white hover:text-purple-200">
            Get Started
          </Link>
        </div>

        <div className="md:hidden">
          <input type="checkbox" id="menu-toggle" className="hidden" />
          <label htmlFor="menu-toggle" className="text-white hover:text-purple-200 cursor-pointer">
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
        <div className="flex flex-col space-y-4 p-4 bg-purple-900">
          <Link
            href="/about"
            className="text-white hover:text-purple-200"
          >
            About
          </Link>
          <Link
            href="/services"
            className="text-white hover:text-purple-200"
          >
            Services
          </Link>
          <Link
            href="/questionnaire"
            className="text-white hover:text-purple-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
} 