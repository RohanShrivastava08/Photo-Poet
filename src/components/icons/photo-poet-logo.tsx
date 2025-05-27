import type { SVGProps } from 'react';

export function PhotoPoetLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 50"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradientClassyModern" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 0.85 }} /> {/* Slightly more subtle accent stop */}
        </linearGradient>
         <filter id="subtleShadowModern" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.75"/> {/* Softer blur */}
          <feOffset dx="0.5" dy="0.5" result="offsetblur"/> {/* Smaller offset */}
          <feFlood floodColor="hsl(var(--foreground))" floodOpacity="0.15"/> {/* More subtle flood */}
          <feComposite in2="offsetblur" operator="in"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#subtleShadowModern)">
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fontFamily="var(--font-geist-sans), 'Helvetica Neue', Arial, sans-serif" // Clean sans-serif stack
        fontSize="29" // Slightly adjusted size
        fontWeight="500" 
        fill="url(#logoGradientClassyModern)"
        letterSpacing="-0.8" // Slightly adjusted spacing
      >
        PhotoPoet
      </text>
      {/* More subtle underline */}
      <path
        d="M 50 41.5 L 170 41.5" // Straight, shorter underline
        stroke="url(#logoGradientClassyModern)"
        strokeWidth="1.25" // Thinner
        fill="none"
        strokeLinecap="round"
        opacity="0.45" // More subtle
      />
      </g>
    </svg>
  );
}
