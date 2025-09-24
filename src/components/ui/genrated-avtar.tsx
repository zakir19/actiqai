"use client";

import * as React from "react";
import { createAvatar, type Style } from "@dicebear/core";
import { initials, thumbs, shapes, notionists } from "@dicebear/collection";

type GeneratedAvatarProps = {
  seed: string;
  size?: number;
  variant?: "initials" | "thumbs" | "shapes" | "notionists";
  className?: string;
  title?: string;
};

export function GeneratedAvatar({
  seed,
  size = 64,
  variant = "notionists",
  className,
  title,
}: GeneratedAvatarProps) {
  const svgMarkup = React.useMemo(() => {
    const style =
      variant === "initials"
        ? initials
        : variant === "thumbs"
        ? thumbs
        : variant === "shapes"
        ? shapes
        : notionists;

    const selectedStyle = style as unknown as Style<Record<string, unknown>>;
    const avatar = createAvatar(
      selectedStyle,
      { seed: seed || "user", size, backgroundColor: ["1f2937"] } as Record<string, unknown>
    );
    return avatar.toString();
  }, [seed, size, variant]);

  const ariaHidden = title ? undefined : true;
  return (
    <span
      className={className}
      title={title}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
      {...(ariaHidden ? { "aria-hidden": true } : {})}
    />
  );
}

export default GeneratedAvatar;


