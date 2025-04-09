import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-purple-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-2">ELEVATE(HER)</h3>
            <p className="text-sm text-purple-100 max-w-[200px] mx-auto md:mx-0">
              Empowering women to reach their full potential in tech.
            </p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className="text-sm text-purple-100 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-purple-100 hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/questionnaire" className="text-sm text-purple-100 hover:text-white">
                  Get Started
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-purple-100 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold mb-2">Contact</h3>
            <ul className="space-y-1">
              <li className="text-sm text-purple-100">
                <a href="mailto:elevateher.tech@gmail.com" className="hover:text-white">Email</a>
              </li>
              <li className="text-sm text-purple-100">
                <a href="https://linkedin.com/company/elevate-her-tech" target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-purple-800 text-center text-sm text-purple-100">
          <p>&copy; {new Date().getFullYear()} ElevateHer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 