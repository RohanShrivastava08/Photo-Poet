import type { SVGProps } from 'react';

export function PhotoPoetLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50" // Adjusted viewBox for potentially taller/wider logo if needed
      // Default width and height are removed, will be controlled by className or style prop
      // width="120" // Example: Can be overridden by props
      // height="30"  // Example: Can be overridden by props
      {...props} // Spread props to allow overriding width, height, className, etc.
    >
      <defs>
        <linearGradient id="logoGradientElegant" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {/* Optional: a subtle background rectangle if needed, or keep transparent */}
      {/* <rect width="200" height="50" rx="5" fill="transparent" /> */}
      <text
        x="50%" // Center text horizontally
        y="50%" // Center text vertically
        dy=".3em" // Fine-tune vertical alignment
        textAnchor="middle" // Ensure horizontal centering
        fontFamily="var(--font-geist-mono), monospace"
        fontSize="28" // Slightly adjusted font size
        fontWeight="600" // Slightly less bold for elegance
        fill="url(#logoGradientElegant)"
        letterSpacing="-0.5" // Slightly tighter letter spacing
      >
        PhotoPoet
      </text>
    </svg>
  );
}
