import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSliderProps {
  posts: BlogPost[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ posts }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (posts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [posts.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  if (!posts.length) return null;

  const currentPost = posts[currentIndex];

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl shadow-2xl mb-12 group">
      {/* Background Images */}
      {posts.map((post, index) => (
        <div
          key={post.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
        <div className="max-w-3xl transform transition-transform duration-500 translate-y-0">
            <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase bg-primary-600 rounded-full">
              Featured
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {currentPost.title}
            </h2>
            <p className="text-gray-200 text-lg md:text-xl line-clamp-2 mb-6">
              {currentPost.excerpt}
            </p>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-300">
              <span>{currentPost.author}</span>
              <span>•</span>
              <span>{currentPost.date}</span>
            </div>
        </div>
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 right-8 flex gap-2">
        {posts.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};