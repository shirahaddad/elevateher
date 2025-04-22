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
                <a href="mailto:info@elevateher.tech" className="hover:text-white flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Email
                </a>
              </li>
              <li className="text-sm text-purple-100">
                <a href="https://linkedin.com/company/elevate-her-tech" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-purple-800 text-center text-sm text-purple-100">
          <p>&copy; {new Date().getFullYear()} Elevate(Her). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 