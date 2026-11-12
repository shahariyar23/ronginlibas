'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackMetaPageView } from '@/lib/meta-pixel';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/** Loads the Pixel once after marketing consent, then records App Router navigations. */
export function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!META_PIXEL_ID || !pathname) return;

    const queryString = searchParams?.toString();
    const currentPath = queryString ? `${pathname}?${queryString}` : pathname;

    // The initialization snippet below records the first PageView. Only later
    // client-side navigations should create another one.
    if (initialPathRef.current === null) {
      initialPathRef.current = currentPath;
      return;
    }

    if (initialPathRef.current !== currentPath) {
      trackMetaPageView();
      initialPathRef.current = currentPath;
    }
  }, [pathname, searchParams]);

  if (!META_PIXEL_ID) return null;

  return (
    <Script id="meta-pixel-init" strategy="afterInteractive">
      {`if(!window.__rlMetaPixelInitialized){!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;
n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');window.__rlMetaPixelInitialized=true;}`}
    </Script>
  );
}
