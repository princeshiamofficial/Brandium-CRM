import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Page not found | Brandium Telesales CRM",
};

/**
 * App-wide 404. The artwork (the two 4s and the reader behind the 0) is cropped 1:1 from the
 * design reference (`public/404/404-artwork.webp`, 770×430) and never scales above its
 * native size, so it stays sharp. It is served `unoptimized` because Next's default re-encode
 * (q=75, upscaled to 828px) visibly softens the photo. The copy below is live text.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-white px-4 pt-10 sm:pt-21 pb-6 font-['Open_Sans',sans-serif] text-[#222]">
      <h1 className="sr-only">404 - Page not found</h1>
      <Image
        src="/404/404-artwork.webp"
        alt="404 - a man reading a newspaper headlined “Oh no! It's”"
        width={770}
        height={430}
        priority
        unoptimized
        className="h-auto w-full max-w-192.5 select-none"
        draggable={false}
      />

      <p className="mt-8 sm:mt-12.5 max-w-150 text-center text-lg leading-7 font-normal text-[#222] sm:text-xl">
        We are sorry, but the page you are looking for can not be found.
      </p>

      <p className="mt-5 sm:mt-7.25 max-w-150 text-center text-[13px] leading-5 text-[#444]">
        You might try searching our site or visit the{" "}
        <Link
          href="/"
          className="font-semibold text-[#23a0b5] underline underline-offset-2 hover:text-[#1b8597] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23a0b5]"
        >
          homepage
        </Link>
        .
      </p>
    </main>
  );
}
