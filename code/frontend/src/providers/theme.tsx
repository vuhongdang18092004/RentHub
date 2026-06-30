"use client";

import { ThemeProvider } from "next-themes";

// TODO: Theme provider handling theme state (light/dark-mode)

export function Theme({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" value={{ light: "light-mode", dark: "dark-mode" }} defaultTheme="light" forcedTheme="light">
            {children}
        </ThemeProvider>
    );
}
