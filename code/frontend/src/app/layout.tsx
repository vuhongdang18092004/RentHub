import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/wishlist-context";
import { ChatProvider } from "@/context/chat-context";
import { ChatDrawer } from "@/components/features/chat/chat-drawer";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";

// TODO: Root layout structure injecting fonts, theme, router provider, and global styles as per docs

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "RentHub — Chia sẻ và cho thuê đồ dùng thông minh",
    description: "Hệ thống chia sẻ và cho thuê đồ dùng thông minh hàng đầu",
};

export const viewport: Viewport = {
    themeColor: "#7f56d9",
    colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cx(inter.variable, "bg-primary antialiased")}>
                <RouteProvider>
                    <Theme>
                        <AuthProvider>
                            <ToastProvider>
                                <WishlistProvider>
                                    <ChatProvider>
                                        {children}
                                        <ChatDrawer />
                                    </ChatProvider>
                                </WishlistProvider>
                            </ToastProvider>
                        </AuthProvider>
                    </Theme>
                </RouteProvider>
            </body>
        </html>
    );
}
