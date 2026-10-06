import React from 'react';

const InstagramIcon = () => (
  <svg className="w-4 h-4 text-[#c79a45]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export const InstagramFeed: React.FC = () => {
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
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#073a2d] hover:text-[#0d4d3b] font-semibold"
          >
            <InstagramIcon />
            <span>View Instagram Gallery</span>
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
