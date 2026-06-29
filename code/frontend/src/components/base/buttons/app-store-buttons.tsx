"use client";

// TODO: Filled App Store & Play Store redirect buttons.

export type AppStorePlatform = "ios" | "android";

export interface AppStoreButtonsProps {
  platform: AppStorePlatform;
  href?: string;
  className?: string;
}

export function AppStoreButtons(props: AppStoreButtonsProps) {
  return <div>TODO: AppStoreButtons</div>;
}
