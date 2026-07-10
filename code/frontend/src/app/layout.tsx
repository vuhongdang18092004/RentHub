import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/wishlist-context";
import { ChatProvider } from "@/context/chat-context";
import { GlobalChatWidget } from "@/components/features/chat/global-chat-widget";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";
 
// TODO: Root layout structure injecting fonts, theme, router provider, and global styles as per docs
 
const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-plus-jakarta-sans",
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
              <body className={cx(plusJakartaSans.variable, "bg-primary antialiased")}>
                  <RouteProvider>
                      <Theme>
                          <AuthProvider>
                              <ToastProvider>
                                  <WishlistProvider>
                                      <ChatProvider>
                                          {children}
                                          <GlobalChatWidget />
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
