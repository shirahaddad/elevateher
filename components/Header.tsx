import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-purple-900 h-14">
      <nav className="container mx-auto px-4 h-full flex items-center">
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="text-white text-xl font-bold tracking-tight">
            ELEVATE(HER)
          </Link>
          <div className="space-x-6">
            <Link
              href="/about"
              className="text-white hover:text-purple-200 transition-colors text-sm"
            >
              About Us
            </Link>
            <Link
              href="/services"
              className="text-white hover:text-purple-200 transition-colors text-sm"
            >
              Services
            </Link>
            <Link
              href="/questionnaire"
              className="text-sm text-purple-100 hover:text-white"
            >
              I'm Ready
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
} 