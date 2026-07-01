"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ProductSummary } from "@/services/product-service";
import { useAuth } from "@/context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: ProductSummary;
  quantity: number;
  rentDays: number; // số ngày thuê dự kiến
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (product: ProductSummary, rentDays?: number) => void;
  removeItem: (productId: number) => void;
  updateRentDays: (productId: number, rentDays: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Dynamically calculate the localStorage key based on logged-in user ID
  const cartKey = user?.id ? `renthub_cart_${user.id}` : "renthub_cart_guest";

  // Rehydrate from localStorage when active user key changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(cartKey);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  }, [cartKey]);

  // Persist to localStorage whenever items or the active user key changes
  useEffect(() => {
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, cartKey]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const addItem = useCallback((product: ProductSummary, rentDays = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // Already in cart — just bump rentDays if provided
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, rentDays: Math.max(item.rentDays, rentDays) }
            : item
        );
      }
      return [...prev, { product, quantity: 1, rentDays }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateRentDays = useCallback((productId: number, rentDays: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, rentDays: Math.max(1, rentDays) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (productId: number) => items.some((item) => item.product.id === productId),
    [items]
  );

  // ── Derived state ────────────────────────────────────────────────────────────

  const itemCount = items.length;
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.pricePerDay * item.rentDays,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        addItem,
        removeItem,
        updateRentDays,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a <CartProvider>");
  return ctx;
}
