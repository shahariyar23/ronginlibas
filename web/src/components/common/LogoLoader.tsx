import Image from 'next/image';

export function LogoLoader() {
  return (
    <div
      role="status"
      aria-label="Loading Rongin Libas"
      className="fixed inset-0 z-[100] grid place-items-center bg-[#f8f6ef]"
    >
      <Image
        src="/logo.svg"
        alt="Rongin Libas Logo"
        title="Rongin Libas — Cloth Your Identity"
        width={96}
        height={72}
        className="logo-loader-breathe h-20 w-24 object-contain sm:h-24 sm:w-32"
        priority
      />
      <span className="sr-only">Loading Rongin Libas...</span>
    </div>
  );
}
