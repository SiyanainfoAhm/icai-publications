import {
  catalogueCoverImageClasses,
  catalogueCoverWrapperClasses,
  resolveCoverUrl,
} from "@/lib/covers";

type CoverImageProps = {
  slug: string;
  coverImageUrl: string | null | undefined;
  alt: string;
  variant?: "catalogue" | "detail";
  className?: string;
  wrapperClassName?: string;
};

export function CoverImage({
  slug,
  coverImageUrl,
  alt,
  variant = "catalogue",
  className,
  wrapperClassName,
}: CoverImageProps) {
  const src = resolveCoverUrl(slug, coverImageUrl);

  const imgClass =
    className ??
    (variant === "catalogue"
      ? catalogueCoverImageClasses()
      : "h-full w-full object-contain object-top px-2 pt-3 pb-2");

  const wrapClass =
    wrapperClassName ??
    (variant === "catalogue"
      ? catalogueCoverWrapperClasses(slug, src)
      : "relative flex h-full w-full items-start justify-center overflow-hidden bg-slate-100");

  return (
    <div className={wrapClass}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={imgClass} loading="lazy" />
    </div>
  );
}
