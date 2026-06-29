"use client";

import { ReactNode } from "react";

export interface AuthHeroProps {
  image: string;
  title: string;
  subtitle: string;
  badge?: ReactNode;
  topWidgets?: ReactNode;
  className?: string;
}

export function AuthHero({
  image,
  title,
  subtitle,
  badge,
  topWidgets,
  className = "",
}: AuthHeroProps) {
  return (
    <div className={`relative w-full h-full min-h-[600px] overflow-hidden rounded-[24px] ${className}`}>
      {/* Background Image with cover positioning */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: `url(${image})` }}
      />
      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

      {/* Top Widgets Panel */}
      {topWidgets && (
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start gap-4 z-10">
          {topWidgets}
        </div>
      )}

      {/* Bottom Main Content Panel */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        {badge ? (
          badge
        ) : (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white shadow-lg space-y-2">
            <h3 className="text-xl md:text-2xl font-bold leading-tight">{title}</h3>
            <p className="text-white/80 text-sm">{subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
}
