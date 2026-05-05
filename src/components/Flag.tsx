import { useState } from "react";

interface Props {
  iso2: string;
  emoji?: string;
  size?: number; // px
  rounded?: boolean;
  className?: string;
}

/**
 * Flag image via flagcdn.com, falls back to emoji if image fails to load.
 * Solves emoji-flag rendering on Windows / older browsers.
 */
export const Flag = ({ iso2, emoji, size = 32, rounded = true, className = "" }: Props) => {
  const [errored, setErrored] = useState(false);
  const code = iso2.toLowerCase();
  const w = size;
  const h = Math.round((size * 3) / 4);

  if (errored && emoji) {
    return <span style={{ fontSize: size }} className={className} aria-hidden>{emoji}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w160/${code}.png`}
      srcSet={`https://flagcdn.com/w160/${code}.png 1x, https://flagcdn.com/w320/${code}.png 2x`}
      width={w}
      height={h}
      onError={() => setErrored(true)}
      alt={`${iso2} flag`}
      loading="lazy"
      className={`inline-block object-cover shadow-sm ring-1 ring-border/60 ${rounded ? "rounded-md" : ""} ${className}`}
      style={{ width: w, height: h }}
    />
  );
};
