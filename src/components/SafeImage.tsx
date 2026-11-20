import { useState } from 'react';
import { Utensils } from 'lucide-react';
import { RECIPE_IMAGES } from '../data/recipes';
import type { RecipeImageKey } from '../types';

interface SafeImageProps {
  imageKey: RecipeImageKey;
  alt: string;
  className?: string;
}

export function SafeImage({ imageKey, alt, className = '' }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const src = RECIPE_IMAGES[imageKey] || RECIPE_IMAGES.salad;

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EAF3EC] to-[#DCE8E0] text-[#146C4B] p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-7 h-7 opacity-75" strokeWidth={1.75} />
        <span className="text-xs font-medium text-[#1D2D24] line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
