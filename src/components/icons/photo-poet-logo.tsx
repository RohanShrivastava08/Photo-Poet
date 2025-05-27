import type { SVGProps } from 'react';

export function PhotoPoetLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 50" // Adjusted viewBox slightly
      {...props}
    >
      <defs>
        <linearGradient id="logoGradientClassy" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
         <filter id="subtleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
          <feOffset dx="1" dy="1" result="offsetblur"/>
          <feFlood floodColor="hsl(var(--foreground))" floodOpacity="0.2"/>
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#subtleShadow)">
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans), Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif" // More elegant font stack
        fontSize="30" // Increased size
        fontWeight="500" // Medium weight
        fill="url(#logoGradientClassy)"
        letterSpacing="-0.75" // Tighter spacing
      >
        PhotoPoet
      </text>
      {/* Optional: A subtle underline or embellishment */}
      <path
        d="M 40 42 Q 110 38 180 42" // Simple curved underline
        stroke="url(#logoGradientClassy)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      </g>
    </svg>
  );
}
