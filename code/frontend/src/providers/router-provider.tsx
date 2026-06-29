"use client";

import type { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";

// TODO: RouteProvider wraps React Aria RouterProvider with Next.js router integration

declare module "react-aria-components" {
    interface RouterConfig {
        routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
    }
}

export const RouteProvider = ({ children }: PropsWithChildren) => {
    const router = useRouter();
    return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
};
