import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'horizontal';
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-11 w-auto',
  variant = 'full',
  inverted = false,
}) => {
  return (
    <Link href="/" className="inline-flex items-center gap-3 group focus:outline-none">
      {/* Official Emblem Logo from public/logo.svg */}
      <img
        src="/logo.svg"
        alt="Rongin Libas Logo"
        className={`${className} object-contain transition-transform duration-300 group-hover:scale-105 ${
          inverted ? 'brightness-110 drop-shadow-[0_1px_4px_rgba(255,255,255,0.15)]' : ''
        }`}
      />

      {variant !== 'mark' && (
        <div className="flex flex-col">
          <span
            className="font-serif text-xl sm:text-2xl font-bold tracking-[0.18em] uppercase transition-colors"
            style={{ color: inverted ? '#fbf9f2' : '#073a2d' }}
          >
            RONGIN LIBAS
          </span>
          <span
            className="text-[9px] tracking-[0.35em] uppercase font-sans font-medium"
            style={{ color: '#c79a45' }}
          >
            Cloth Your Identity
          </span>
        </div>
      )}
    </Link>
  );
};
