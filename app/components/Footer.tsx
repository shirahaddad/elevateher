'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <p className="text-gray-300">
              Email: <a href="mailto:contact@elevateher.com" className="hover:text-white">contact@elevateher.com</a>
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Connect</h3>
            <a
              href="https://linkedin.com/company/elevateher"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white"
            >
              LinkedIn
            </a>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Get Started</h3>
            <Link
              href="/questionnaire"
              className="text-gray-300 hover:text-white"
            >
              Take the Questionnaire
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Elevate(Her). All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 