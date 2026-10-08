'use client';

import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base primitive Skeleton component with bespoke Atelier linen shimmer
 */
export function Skeleton({ className = '', style, ...props }: SkeletonProps) {
  return (
    <div
      className={`atelier-skeleton border border-[#deddd3]/60 ${className}`}
      style={style}
      {...props}
    />
  );
}

/**
 * Skeleton lines for paragraphs or text blocks
 */
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ['w-full', 'w-5/6', 'w-4/6', 'w-3/4', 'w-2/3'];
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

/**
 * Full Dashboard loading skeleton matching Rongin Libas Atelier analytics
 */
export function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-3.5 w-96" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#deddd3] p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="pt-2 border-t border-[#f0eee7] flex items-center justify-between">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Highlights Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#deddd3] p-4 flex items-center gap-4 shadow-xs"
          >
            <Skeleton className="w-10 h-10 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-28" />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid: Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Revenue Trends chart skeleton */}
        <div className="lg:col-span-8 bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-7 w-32" />
          </div>
          {/* Chart placeholder */}
          <div className="h-64 flex items-end gap-3 pt-6 px-2">
            {[45, 65, 30, 80, 95, 55, 75, 60, 85, 70, 90, 100].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-full" style={{ height: `${h}%` }} />
                <Skeleton className="h-2 w-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Low Stock & Atelier Consignments */}
        <div className="lg:col-span-4 bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-3 border border-[#deddd3] bg-[#fbf9f2]/60 flex items-center gap-3"
              >
                <Skeleton className="w-10 h-12 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
                <Skeleton className="h-6 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table Skeleton */}
      <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="divide-y divide-[#f0eee7]">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Full Table Page Skeleton for Products, Orders, Inventory, Customers, Reviews
 */
export function TablePageSkeleton({
  title = 'Catalogue Specifications',
  showAddButton = true,
  rowCount = 8,
}: {
  title?: string;
  showAddButton?: boolean;
  rowCount?: number;
}) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <h1 className="text-2xl font-serif text-[#1b1c18]">{title}</h1>
          <Skeleton className="h-3.5 w-72" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24" />
          {showAddButton && <Skeleton className="h-9 w-36" />}
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-[#deddd3] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex-1 w-full flex items-center gap-3">
          <Skeleton className="h-9 flex-1 max-w-md" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white border border-[#deddd3] shadow-xs overflow-hidden">
        <div className="p-3.5 bg-[#fbf9f2] border-b border-[#deddd3] flex items-center justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="divide-y divide-[#f0eee7]">
          {Array.from({ length: rowCount }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-12 h-14 shrink-0" />
                <div className="space-y-2 flex-1 max-w-xs">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-14" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7" />
                <Skeleton className="w-7 h-7" />
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Footer */}
        <div className="p-3.5 bg-[#fbf9f2] border-t border-[#deddd3] flex items-center justify-between">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Full Product Form Skeleton for Add & Edit Product pages
 */
export function ProductFormSkeleton({
  isEdit = false,
}: {
  isEdit?: boolean;
}) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Top Header & Breadcrumb */}
      <div>
        <Skeleton className="h-3 w-44 mb-2" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2 border-b border-[#deddd3] pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif text-[#1b1c18] tracking-tight">
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h1>
              {isEdit && <Skeleton className="h-6 w-28" />}
            </div>
            <Skeleton className="h-3.5 w-96" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-36" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Form Sections */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 01: General Information */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c79a45]" />
                <span className="font-serif text-lg font-medium text-[#1b1c18]">
                  General Information
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] font-mono">
                SECTION 01
              </span>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-2.5 w-64" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-36 w-full" />
            </div>
          </div>

          {/* Section 02: Pricing & Valuation */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c79a45]" />
                <span className="font-serif text-lg font-medium text-[#1b1c18]">
                  Pricing & Valuation
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] font-mono">
                SECTION 02
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>

          {/* Section 03: Inventory & Identification */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c79a45]" />
                <span className="font-serif text-lg font-medium text-[#1b1c18]">
                  Inventory & Identification
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] font-mono">
                SECTION 03
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>

          {/* Section 04: Variants Matrix */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#c79a45]" />
                <span className="font-serif text-lg font-medium text-[#1b1c18]">
                  Variants Matrix & Atelier Sizing
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#717975] font-mono">
                SECTION 04
              </span>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-36" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-14" />
                ))}
              </div>
            </div>

            {/* Shades */}
            <div className="space-y-2">
              <Skeleton className="h-3 w-36" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-28" />
                ))}
              </div>
            </div>

            {/* Combinations Matrix Table */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-44" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-36" />
                </div>
              </div>
              <Skeleton className="h-44 w-full" />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Media & Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Lookbook Media */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0eee7] pb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-28 w-full" />
            <div className="grid grid-cols-2 gap-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-3/4 w-full" />
              ))}
            </div>
          </div>

          {/* Publishing */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-4">
            <Skeleton className="h-4 w-32 border-b border-[#f0eee7] pb-3" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Tags */}
          <div className="bg-white border border-[#deddd3] p-6 shadow-xs space-y-4">
            <Skeleton className="h-4 w-32 border-b border-[#f0eee7] pb-3" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-64 right-0 bg-[#fbf9f2] border-t border-[#deddd3] px-8 py-3.5 flex items-center justify-between z-20 shadow-md">
        <Skeleton className="h-3.5 w-52" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
    </div>
  );
}

/**
 * Category Cards Grid Skeleton
 */
export function CategoriesSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#deddd3] pb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <h1 className="text-2xl font-serif text-[#1b1c18]">Apparel Collections</h1>
          <Skeleton className="h-3.5 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#deddd3] shadow-xs overflow-hidden flex flex-col"
          >
            <Skeleton className="h-48 w-full" />
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="pt-3 border-t border-[#f0eee7] flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-7 h-7" />
                  <Skeleton className="w-7 h-7" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Settings Page Skeleton
 */
export function SettingsSkeleton() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-[#deddd3] pb-6 space-y-2">
        <Skeleton className="h-3 w-28" />
        <h1 className="text-3xl font-serif text-[#1b1c18]">Store Settings</h1>
        <Skeleton className="h-3.5 w-80" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#deddd3] p-6 space-y-4 shadow-xs">
            <Skeleton className="h-5 w-48 border-b border-[#f0eee7] pb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
