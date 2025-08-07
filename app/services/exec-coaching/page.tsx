import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Executive Coaching with Shira - Elevate(Her)',
  description: 'Executive coaching services with over a decade of engineering leadership experience, aligned with ICF principles.',
};

export default function ExecCoaching() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <Link 
          href="/services" 
          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 transition-colors mb-8 text-sm font-medium"
        >
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </Link>
        
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Image Section */}
          <div className="w-full md:w-1/3">
            <div className="relative h-[400px] w-[280px] mx-auto">
              <Image
                src="/images/shira.webp"
                alt="Shira Haddad"
                fill
                sizes="(max-width: 768px) 280px, 280px"
                className="object-cover rounded-xl"
                priority
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl font-bold mb-2 text-purple-900 tracking-tight">Executive Coaching</h1>
            <p className="text-xl text-purple-600 mb-6">with Shira</p>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-6">
                With over a decade of engineering leadership experience, I support leaders navigating complexity, change, and growth. I'm currently completing Co-Active coach training and I offer coaching aligned with ICF principles - providing a space grounded in trust, curiosity, and accountability.
              </p>
              <p className="text-gray-600 mb-6">
                While mentoring provides a bit more of a blended approach, executive coaching is not about giving advice, but about helping you clarify your values, expand your perspective, and move forward with confidence.
              </p>
              <p className="text-gray-600 mb-6">
                As I work toward completing my ICF credentialing hours, I’m currently offering 60-minute coaching sessions at a reduced rate of $200.              
              </p>
              <p className="text-gray-600 mb-6">
                Book your free introduction session with me{' '}
                <Link
                  href="https://zcal.co/shirahaddad/learn-more-coaching"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 underline"
                >
                  here
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 