'use client';

import React from 'react';
import { useStorefront } from '@/context/StorefrontContext';

const FacebookIcon = () => (
  <svg
    className="w-4 h-4 shrink-0"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      fill="#1877F2"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
    <path
      fill="#FFFFFF"
      d="M16.671 15.457l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.727V4.91s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.463H7.078v3.47h3.261v8.385c.67.105 1.355.161 2.052.161s1.382-.056 2.052-.161v-8.385h2.228z"
    />
  </svg>
);

export const FacebookFeed: React.FC = () => {
  const { settings } = useStorefront();
  const facebookUrl = settings?.facebook || 'https://facebook.com/ronginlibasofficial';

  const posts = [
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKIcKxrkusL16CkM0fjAd340aZTnxr8o_tmugD7XS3cCDAG8yST04u91rCr7OrIxBUE3yNHckrJmRo81EtZGj8lTJHQgDVroNkj2CKu-ot-pwOAH0mcutBcSZUQfz7_-Ar5PUCPtpyOke4D81SjQQyrYnZs7hzWHiKTY0UnNT3WJuv-NAxhFJD5qK4YN7AOBd5nyfFy6KXxGhKLvjxG_EWE4pBc61A0x4zW4Oz-Fnn2JvqDoxPl3_PKQ',
      tag: '#RonginAtelier',
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDp6prKVoZ0R9-jKzP-YQB8wMT6hbb__r_FtajSVsyjsj7DN258168wzOeWmTZh012sfXVDLYDyBJ9O4WemrbxHYPuvF2wUPDq_tNnslEOs7adSqUHf_4O7sZABfm4uH2cne_54kPrqUdv8fsJKGKGPHfo9FL53SaUzi_iAFvgSNE_lt6cExGqN9ojCKcT8DJNyDX5rI6GQr69inbIUgBAa_V2V-oxKznUWVJcyLSS81-54o9kULUiVBw',
      tag: '#ClothYourIdentity',
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlx0LHqSXcLQOXpbkQetGD8eyHb94TqGkGgD98HnCCtDQh3OFIJYvvs_j9cNPJhilnv1rGsbhXbntUhUuxxniGTYz5X7j3PTMTo4c5J8x1SdR7jnHnGnHnyD9N2rywDQLRXBuleTiaCIlPZQ00rqg0Ce5JlKps-InQcZk-CeXTRyvAfJAZ0oiVajfIVIRIT3Pdbz2GrJBbnBgrMT0MueLoAwk_w8edG9ZIDc9FY1r2Tz_9eHRHbndCAQ',
      tag: '#BengalLinen',
    },
    {
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiY7AoPCtJG19zp0Y0T3FoGoJOtBtW_CM94_Po-St5tglW7qMDNOAJZ0SpEPEkF4s3B5W0QF4PxPKVB42idpJCpZzWm_xRQYdtcUCgfS5hJPiX0ShP0zBsJxyl-HiE_7zl0VidN6w81SriBWL0sGhlO59wDWvSTHVkRaAouHL1u_opvuS0_t8nHLtyPCO5d5jqqqLu3Jm8hivRjSM5FUMJ097BXtFJzkTPX2KyMkDj2Bv9LgXUndocyg',
      tag: '#IvoryPanjabi',
    },
  ];

  return (
    <section className="w-full py-20 bg-[#f5f4ed]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-[#c79a45] font-semibold block mb-1">
              COMMUNITY EDITORIAL
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#073a2d]">
              FOLLOW @RONGINLIBAS
            </h2>
          </div>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#073a2d] hover:text-[#0d4d3b] font-semibold"
          >
            <FacebookIcon />
            <span>View Facebook Gallery</span>
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((item, idx) => (
            <div
              key={idx}
              className="group relative aspect-square bg-[#eae8e1] overflow-hidden border border-[#deddd3]"
            >
              <img
                src={item.img}
                alt={item.tag}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#073a2d]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="font-sans text-xs text-[#fbf9f2] font-semibold tracking-wider">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const InstagramFeed = FacebookFeed;
