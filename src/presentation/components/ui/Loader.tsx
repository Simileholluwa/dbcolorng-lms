import React from "react";
import Image from "next/image";

interface LoaderProps {
  fullScreen?: boolean;
  className?: string;
  size?: number; // Size of the inner logo circle (in pixels)
}

export default function Loader({ fullScreen = false, className = "", size = 80 }: LoaderProps) {
  const borderOffset = 16; // spacing around the logo for the circular progress circle
  const svgSize = size + borderOffset;
  const strokeWidth = 4;
  const radius = size / 2 + 4;
  const center = svgSize / 2;

  const containerClasses = fullScreen
    ? "fixed top-5 left-0 right-0 bottom-0 h-[calc(100vh-100px)] lg:top-0 lg:left-[90px] lg:right-0 lg:bottom-0 lg:w-[calc(100vw-90px)] lg:h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950 z-40 animate-fade-in"
    : `flex flex-col items-center justify-center p-8 ${className}`;

  return (
    <div className={containerClasses}>
      <div className="relative flex items-center justify-center" style={{ width: svgSize, height: svgSize }}>
        {/* Rotating Circular progress SVG */}
        <svg
          className="absolute animate-spin text-[#A3D14B]"
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          fill="none"
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-neutral-100 dark:stroke-neutral-800"
            strokeWidth={strokeWidth}
          />
          {/* Animated active track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-current"
            strokeWidth={strokeWidth}
            strokeDasharray={2 * Math.PI * radius}
            strokeDashoffset={2 * Math.PI * radius * 0.45} // ~55% arc indicator
            strokeLinecap="round"
          />
        </svg>

        {/* Center Logo Container */}
        <div
          className="relative flex items-center justify-center rounded-full bg-white dark:bg-neutral-900 shadow-md border border-neutral-100 dark:border-neutral-800 overflow-hidden"
          style={{ width: size, height: size }}
        >
          <Image
            src="/logo.png"
            alt="dbcolorsNG Logo"
            width={size - 20}
            height={size - 20}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}
