"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { favoriteService } from "@/services/favorite-service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

interface WishlistContextType {
  wishlistIds: number[];
  loading: boolean;
  isFavorited: (productId: number) => boolean;
  toggleFavorite: (productId: number, productName?: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { triggerToast } = useToast();
  const router = useRouter();
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = async () => {
    if (isLoading || !isAuthenticated || !user) {
      setWishlistIds([]);
      return;
    }
    try {
      const res = await favoriteService.getMyFavorites(0, 100);
      setWishlistIds(res.content.map(item => item.productId));
    } catch (err) {
      console.error("Lỗi lấy danh sách yêu thích:", err);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user, isLoading, isAuthenticated]);

  const isFavorited = (productId: number) => wishlistIds.includes(productId);

  const toggleFavorite = async (productId: number, productName = "sản phẩm") => {
    if (!user) {
      triggerToast("Vui lòng đăng nhập để sử dụng tính năng yêu thích");
      // Redirect to login after 1.5s
      setTimeout(() => {
        router.push("/login");
      }, 1500);
      return false;
    }

    const alreadyFavorited = isFavorited(productId);
    setLoading(true);

    try {
      if (alreadyFavorited) {
        // Optimistic update
        setWishlistIds(prev => prev.filter(id => id !== productId));
        await favoriteService.removeFavorite(productId);
        triggerToast("Đã xóa khỏi danh sách yêu thích");
        return false;
      } else {
        // Optimistic update
        setWishlistIds(prev => [...prev, productId]);
        await favoriteService.addFavorite(productId);
        triggerToast("Đã thêm sản phẩm vào danh sách yêu thích");
        return true;
      }
    } catch (err) {
      console.error("Lỗi cập nhật yêu thích:", err);
      triggerToast("Không thể cập nhật trạng thái yêu thích");
      // Revert optimistic update
      refreshWishlist();
      return alreadyFavorited;
    } finally {
      setLoading(false);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, loading, isFavorited, toggleFavorite, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
