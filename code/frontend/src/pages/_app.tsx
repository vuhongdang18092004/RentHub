import type { AppProps } from "next/app";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/wishlist-context";
import { Theme } from "@/providers/theme";
import { RouteProvider } from "@/providers/router-provider";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RouteProvider>
      <Theme>
        <AuthProvider>
          <ToastProvider>
            <WishlistProvider>
              <Component {...pageProps} />
            </WishlistProvider>
          </ToastProvider>
        </AuthProvider>
      </Theme>
    </RouteProvider>
  );
}
