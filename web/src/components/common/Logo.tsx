import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'horizontal';
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-9 sm:h-10 w-auto',
  variant = 'full',
  inverted = false,
}) => {
  return (
    <Link
      href="/"
      className="inline-flex flex-col items-start focus:outline-none select-none py-1 cursor-pointer"
      aria-label="Rongin Libas — Cloth Your Identity"
    >
      {/* Top Section: Logo Emblem + Brand Name (Rongin on top, Libas below) */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Official Emblem Logo from public/logo.svg */}
        <div
          className={
            inverted
              ? 'p-1.5 bg-[#fbf9f2] rounded-sm border border-[#c79a45]/60 shadow-[0_2px_8px_rgba(0,0,0,0.35)] inline-flex items-center justify-center'
              : 'inline-flex items-center justify-center'
          }
        >
          <img
            src="/logo.svg"
            alt="Rongin Libas Emblem"
            title="Rongin Libas — Cloth Your Identity"
            className={`${className} object-contain`}
          />
        </div>

        {variant !== 'mark' && (
          <div className="flex flex-col justify-center leading-[0.98]">
            <span
              className="font-['Cinzel',serif] text-[15px] sm:text-[17px] font-bold tracking-[0.15em] uppercase transition-colors"
              style={{ color: inverted ? '#fbf9f2' : '#073a2d' }}
            >
              RONGIN
            </span>
            <span
              className="font-['Cinzel',serif] text-[15px] sm:text-[17px] font-bold tracking-[0.15em] uppercase transition-colors"
              style={{ color: inverted ? '#fbf9f2' : '#073a2d' }}
            >
              LIBAS
            </span>
          </div>
        )}
      </div>

      {/* Full Tagline / Title displayed below BOTH the logo emblem and the name */}
      {variant !== 'mark' && (
        <span
          className="text-[7.5px] sm:text-[8.5px] tracking-[0.28em] uppercase font-sans font-semibold mt-1 whitespace-nowrap transition-colors pl-0.5"
          style={{ color: inverted ? '#f5eedf' : '#c79a45' }}
        >
          CLOTH YOUR IDENTITY
        </span>
      )}
    </Link>
  );
};
