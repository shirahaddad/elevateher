'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TEAM } from '@/lib/team';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-purple-900 tracking-tight">About Us</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6 mb-16">
          <p>
            We help professionals in tech step into their power with purpose. Whether you're newly promoted or eyeing your next big move, our unique two-coaches approach gives you double the insight, strategy, and support.
          </p>
          <p>
            We blend real-world tech leadership experience with proven coaching methods to help you grow with clarity, confidence, and impact. 
          </p>
          <p>
            This isn't just career coaching—it's career elevation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TEAM.map((coach) => (
            <div key={coach.slug} className="group relative">
              <Link href={`/about/${coach.slug}`} className="block">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
                  <div className="relative h-[300px] rounded-lg overflow-hidden">
                    <div className="rounded-lg">
                      <Image
                        src={coach.image}
                        alt={coach.name}
                        fill
                        className="object-contain object-top"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-purple-900 mb-1">{coach.name}</h2>
                    <p className="text-gray-600 text-sm">{coach.title}</p>
                  </div>
                </div>
              </Link>
              <a
                href={coach.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 text-blue-600 hover:text-blue-700"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 