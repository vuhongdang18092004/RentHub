"use client";

export interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none ${className || ""}`}>
      {/* Shario Premium Loop Gradient Icon */}
      <svg
        className="w-7 h-7"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26C21.5228 26 26 21.5228 26 16C26 10.4772 21.5228 6 16 6ZM4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16C28 22.6274 22.6274 28 16 28C9.37258 28 4 22.6274 4 16Z"
          fill="url(#logo-gradient)"
        />
        <path
          d="M13.5 12C11.567 12 10 13.567 10 15.5C10 17.433 11.567 19 13.5 19C15.433 19 17 17.433 17 15.5C17 13.567 15.433 12 13.5 12ZM18.5 12C16.567 12 15 13.567 15 15.5C15 17.433 16.567 19 18.5 19C20.433 19 22 17.433 22 15.5C22 13.567 20.433 12 18.5 12Z"
          fill="url(#logo-gradient)"
          opacity="0.9"
        />
        <defs>
          <linearGradient
            id="logo-gradient"
            x1="4"
            y1="4"
            x2="28"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--color-brand-500)" />
            <stop offset="1" stopColor="var(--color-brand-700)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-bold text-xl text-zinc-900 tracking-tight dark:text-white">
        Shario
      </span>
    </div>
  );
}
