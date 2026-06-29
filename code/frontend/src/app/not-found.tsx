"use client";

// TODO: NotFound component handling 404 pages

export interface NotFoundProps {}

export default function NotFound(props: NotFoundProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 gap-4">
      <h1 className="text-display-md font-bold text-error-primary">404 - Not Found</h1>
      <p className="text-md text-secondary">The page you are looking for does not exist.</p>
    </div>
  );
}
