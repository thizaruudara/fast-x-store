'use client';

import React from 'react';
import { Package } from 'lucide-react';

interface BrandLogoProps {
  slug?: string;
  name?: string;
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function BrandLogo({
  slug = '',
  name = '',
  logoUrl,
  className = '',
  size = 'md',
}: BrandLogoProps) {
  const getLogoPath = (): string => {
    if (logoUrl && (logoUrl.startsWith('/') || logoUrl.startsWith('http'))) {
      return logoUrl;
    }

    const key = (slug || name).toLowerCase();

    if (key.includes('gemini') || key.includes('google')) return '/logos/gemini.svg';
    if (key.includes('capcut')) return '/logos/capcut.svg';
    if (key.includes('netflix')) return '/logos/netflix.svg';
    if (key.includes('prime') || key.includes('amazon')) return '/logos/prime-video.svg';
    if (key.includes('chatgpt') || key.includes('gpt') || key.includes('openai')) return '/logos/chatgpt.svg';
    if (key.includes('canva')) return '/logos/canva.svg';
    if (key.includes('claude') || key.includes('anthropic')) return '/logos/claude.svg';
    if (key.includes('spotify')) return '/logos/spotify.svg';

    return '/logos/gemini.svg';
  };

  const logoPath = getLogoPath();

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-18 h-18 rounded-2xl',
  };

  const imgSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-12 h-12 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-18 h-18 rounded-2xl',
  };

  return (
    <div className={`relative flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg ${sizeClasses[size]} ${className}`}>
      <img
        src={logoPath}
        alt={`${name} Logo`}
        className={`${imgSizes[size]} object-cover`}
        loading="eager"
      />
    </div>
  );
}
