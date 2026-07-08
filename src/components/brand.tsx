"use client";

import Image from "next/image";

/**
 * BlockExchange.buzz brand lockup.
 * Matches the official logo:
 * - Circular gold outline with overlapping B (gold) + E (white)
 * - Wordmark: "BLOCK" (white) + "EXCHANGE" (gold) + ".BUZZ" (white, smaller)
 * - Tagline: "TRADE SMARTER. GROW FASTER."
 */
export function Brand({
  variant = "compact",
  size = "md",
  showTagline = false,
}: {
  variant?: "compact" | "full";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}) {
  const markSize = size === "sm" ? 28 : size === "lg" ? 48 : 36;
  const titleSize = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";
  const buzzSize = size === "sm" ? "text-[8px]" : size === "lg" ? "text-xs" : "text-[10px]";

  if (variant === "full") {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <Image
            src="/blockexchange-mark.svg"
            alt="BlockExchange.buzz mark"
            width={markSize}
            height={markSize}
            className="shrink-0"
          />
          <div className="flex flex-col leading-tight">
            <div className="flex items-baseline">
              <span className={`${titleSize} font-extrabold tracking-tight text-white`}>BLOCK</span>
              <span className={`${titleSize} font-extrabold tracking-tight text-amber-500`}>EXCHANGE</span>
              <span className={`${buzzSize} font-bold text-white ml-0.5`}>.BUZZ</span>
            </div>
          </div>
        </div>
        {showTagline && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] font-medium">
            <span className="text-white">TRADE SMARTER.</span>{" "}
            <span className="text-amber-500">GROW FASTER.</span>
          </p>
        )}
      </div>
    );
  }

  // Compact — sidebar/header lockup
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/blockexchange-mark.svg"
        alt="BlockExchange.buzz"
        width={markSize}
        height={markSize}
        className="shrink-0"
        priority
      />
      <div className="flex flex-col leading-tight">
        <div className="flex items-baseline">
          <span className={`${titleSize} font-extrabold tracking-tight text-white`}>BLOCK</span>
          <span className={`${titleSize} font-extrabold tracking-tight text-amber-500`}>EXCHANGE</span>
          <span className={`${buzzSize} font-bold text-white ml-0.5`}>.BUZZ</span>
        </div>
      </div>
    </div>
  );
}
