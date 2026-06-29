"use client";

// TODO: HomeScreen component containing main screen layout

export interface HomeScreenProps {}

export function HomeScreen(props: HomeScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <h1 className="text-display-md font-semibold text-primary">RentHub Skeleton App</h1>
    </div>
  );
}
