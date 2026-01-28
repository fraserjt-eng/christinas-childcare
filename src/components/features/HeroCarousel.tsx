'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    image: '/images/center-exterior.jpg',
    title: 'Where Learning And Growth Become One',
    subtitle: "Christina's Child Care Center - Crystal, MN",
  },
  {
    image: '/images/classroom-activity.jpg',
    title: 'Play-Based Education',
    subtitle: 'Age-appropriate programs from infancy through school age',
  },
  {
    image: '/images/outdoor-play.jpg',
    title: 'A Safe, Nurturing Environment',
    subtitle: 'Licensed by Minnesota DHS with experienced, certified staff',
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-gray-900">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        </div>
      ))}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 font-heading max-w-4xl">
          {slides[current].title}
        </h1>
        <p className="text-lg md:text-2xl text-white/90 mb-8 max-w-2xl">
          {slides[current].subtitle}
        </p>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
