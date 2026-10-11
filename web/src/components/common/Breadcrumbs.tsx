import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`py-3 text-[11px] uppercase tracking-[0.16em] text-[#717975] font-sans ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-1.5 list-none p-0 m-0">
        <li>
          <Link
            href="/"
            className="transition-colors hover:text-[#073a2d] font-medium"
          >
            Home
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-[#a8afa9]" aria-hidden="true" />
              {isLast || !item.href ? (
                <span className="font-semibold text-[#073a2d] truncate max-w-[240px] md:max-w-[400px]">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-[#073a2d] font-medium"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
