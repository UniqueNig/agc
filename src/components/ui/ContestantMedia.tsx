import type { ReactNode } from "react";
import Image from "next/image";
import {
  getContestantGradient,
  getContestantInitials,
} from "@/src/lib/contestants";

type ContestantMediaProps = {
  name: string;
  imageSrc?: string | null;
  index?: number;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  alt?: string;
  sizes?: string;
  children?: ReactNode;
};

export default function ContestantMedia({
  name,
  imageSrc,
  index = 0,
  className = "",
  imageClassName = "",
  fallbackClassName = "",
  alt,
  sizes = "96px",
  children,
}: ContestantMediaProps) {
  const normalizedImage = imageSrc?.trim();
  const shouldBypassOptimizer = normalizedImage?.includes(
    "res.cloudinary.com"
  );

  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      {normalizedImage ? (
        <Image
          src={normalizedImage}
          alt={alt ?? `${name} contestant photo`}
          fill
          sizes={sizes}
          unoptimized={shouldBypassOptimizer}
          className={`object-cover ${imageClassName}`.trim()}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getContestantGradient(index)} ${fallbackClassName}`.trim()}
        >
          {getContestantInitials(name)}
        </div>
      )}
      {children}
    </div>
  );
}
