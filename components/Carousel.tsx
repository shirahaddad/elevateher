'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ROTATE_INTERVAL_MS = 3000;

export type CarouselCard = {
  id: string;
  image: string;
  text?: string;
  link: string;
};

type CarouselProps = {
  cards: CarouselCard[];
};

export default function Carousel({ cards }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(((index % cards.length) + cards.length) % cards.length);
    },
    [cards.length]
  );

  const goNext = useCallback(() => {
    goTo(currentIndex + 1);
  }, [currentIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(currentIndex - 1);
  }, [currentIndex, goTo]);

  useEffect(() => {
    if (cards.length <= 1 || isPaused) return;
    const id = setInterval(goNext, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [cards.length, isPaused, goNext]);

  if (cards.length === 0) return null;

  const card = cards[currentIndex];
  const showArrows = cards.length >= 2;

  return (
    <div
      className="w-full max-w-4xl mx-auto flex items-center gap-2 sm:gap-4"
      aria-label="Featured carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {showArrows && (
        <button
          type="button"
          onClick={goPrev}
          className="flex-shrink-0 p-2 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div className="relative flex-1 min-w-0 aspect-[1200/628] overflow-hidden rounded-lg" aria-live="polite">
        <Link
          href={card.link}
          className="block relative w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 rounded-lg"
        >
          <Image
            src={`/images/${card.image}`}
            alt={card.text ?? `Slide ${currentIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1152px"
          />
          {card.text && (
            <div className="absolute bottom-0 left-0 right-0 py-1.5 px-2 sm:py-2 sm:px-3 md:p-4 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-white text-left text-xs sm:text-base md:text-xl lg:text-2xl font-medium drop-shadow-sm leading-tight line-clamp-2 sm:line-clamp-none" style={{ fontFamily: '"Georgia Pro Condensed", Georgia, serif' }}>
                {card.text}
              </p>
            </div>
          )}
        </Link>
      </div>

      {showArrows && (
        <button
          type="button"
          onClick={goNext}
          className="flex-shrink-0 p-2 rounded-full bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2"
          aria-label="Next card"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
