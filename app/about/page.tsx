'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TEAM } from '@/lib/team';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-purple-900 tracking-tight">About Us</h1>
        
        <div className="prose prose-lg max-w-none text-gray-600 space-y-6 mb-8">
          <p>
            We help professionals in tech step into their power with purpose. Whether you're newly promoted or eyeing your next big move, our unique two-coaches approach gives you double the insight, strategy, and support.
          </p>
          <p>
            We blend real-world tech leadership experience with proven coaching methods to help you grow with clarity, confidence, and impact. 
          </p>
          <p>
            This isn't just career coaching - it's career elevation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TEAM.map((coach) => (
            <div key={coach.slug} className="group relative">
              <Link href={`/about/${coach.slug}`} className="block">
                <div className="hidden sm:flex justify-center lg:justify-end">
                    <div className="relative w-80 h-10 sm:w-96 sm:h-96 transition-all duration-300">
                        {/* Frame ring with rotated border effect */}
                        <div className="absolute inset-0 rounded-full border-[10px] border-purple-900 transform rotate-3 z-10 transition-all duration-300 group-hover:border-purple-700 group-hover:shadow-xl group-hover:rotate-6"></div>

                        {/* Image inside a circular mask */}
                        <div className="absolute inset-2 rounded-full overflow-hidden z-20 transition-all duration-300 group-hover:shadow-lg">
                            <Image
                                src={coach.image}
                                alt={coach.name}
                                fill
                                className="object-cover object-top transition-all duration-300 group-hover:brightness-110 group-hover:contrast-105"
                                priority
                            />
                        </div>
                    </div>
                </div>
                <div className="text-center mt-6">
                  <h3 className="text-xl font-semibold text-purple-900">{coach.name}</h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 