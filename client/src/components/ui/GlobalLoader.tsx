import { useEffect, useState } from 'react';
import logoTagit from '@/assets/logo-tagit.png';

interface GlobalLoaderProps {
  /** Whether to show the loader */
  isLoading?: boolean;
  /** Text to display below the logo */
  text?: string;
  /** Whether this is the initial app load (full screen with dark overlay) */
  fullScreen?: boolean;
  /** Minimum display time in ms (to avoid flickering) */
  minDisplayTime?: number;
}

/**
 * Global loader component with TAGIT logo and fill animation
 * Professional "bottle filling" effect
 */
export default function GlobalLoader({
  isLoading = true,
  text,
  fullScreen = true,
  minDisplayTime = 500
}: GlobalLoaderProps) {
  const [shouldShow, setShouldShow] = useState(isLoading);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isLoading) {
      // Ensure minimum display time to avoid flickering
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      
      const timer = setTimeout(() => {
        setShouldShow(false);
      }, remaining);
      
      return () => clearTimeout(timer);
    } else {
      setShouldShow(true);
    }
  }, [isLoading, minDisplayTime, startTime]);

  if (!shouldShow) return null;

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)
              `
            }}
          />
        </div>
        
        <div className="relative flex flex-col items-center gap-8">
          {/* Logo container with fill animation */}
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            {/* Grayscale logo (background) */}
            <img
              src={logoTagit}
              alt="TAGIT"
              className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-30"
            />
            
            {/* Colored logo with clip-path fill animation */}
            <div className="absolute inset-0 overflow-hidden animate-fill-up">
              <img
                src={logoTagit}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Shine effect */}
            <div className="absolute inset-0 animate-shine">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12" />
            </div>
          </div>
          
          {/* Loading bar */}
          <div className="w-48 md:w-56 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-accent via-orange-400 to-accent animate-loading-bar rounded-full" />
          </div>
          
          {/* Loading text */}
          {text && (
            <p className="text-gray-400 text-sm md:text-base font-medium animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Non-fullscreen version (for sections/components)
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16">
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        {/* Grayscale logo (background) */}
        <img
          src={logoTagit}
          alt="TAGIT"
          className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-30"
        />
        
        {/* Colored logo with clip-path fill animation */}
        <div className="absolute inset-0 overflow-hidden animate-fill-up">
          <img
            src={logoTagit}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      {/* Loading bar */}
      <div className="mt-6 w-32 md:w-40 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent via-orange-400 to-accent animate-loading-bar rounded-full" />
      </div>
      
      {text && (
        <p className="mt-4 text-gray-500 text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Section loader - smaller version for inline loading states
 */
export function SectionLoader({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
      <div className="relative w-16 h-16">
        {/* Grayscale logo (background) */}
        <img
          src={logoTagit}
          alt="TAGIT"
          className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-30"
        />
        
        {/* Colored logo with clip-path fill animation */}
        <div className="absolute inset-0 overflow-hidden animate-fill-up-fast">
          <img
            src={logoTagit}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      
      {/* Small loading bar */}
      <div className="mt-4 w-24 h-0.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-accent animate-loading-bar-fast rounded-full" />
      </div>
      
      {text && (
        <p className="mt-3 text-gray-500 text-xs font-medium">
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * Inline loader - tiny version for buttons and small elements
 */
export function InlineLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-5 h-5 ${className}`}>
      <img
        src={logoTagit}
        alt=""
        className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-30"
      />
      <div className="absolute inset-0 overflow-hidden animate-fill-up-fast">
        <img
          src={logoTagit}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

