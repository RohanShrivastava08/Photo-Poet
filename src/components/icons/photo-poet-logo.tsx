import type { SVGProps } from 'react';

export function PhotoPoetLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <rect width="200" height="50" rx="5" fill="transparent" />
      <text
        x="10"
        y="35"
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="30"
        fontWeight="bold"
        fill="url(#logoGradient)"
      >
        PhotoPoet
      </text>
    </svg>
  );
}
