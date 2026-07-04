"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/ToastContext";

export default function CartPage() {
  const { items, itemCount, totalPrice, removeItem, updateRentDays, clearCart } = useCart();
  const { triggerToast } = useToast();
  const router = useRouter();

  const handleRemove = (productId: number, name: string) => {
    removeItem(productId);
    triggerToast(`Đã xóa "${name}" khỏi giỏ hàng`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 font-sans">
        <Header />

        <div className="max-w-[960px] mx-auto px-4 md:px-6 py-8 md:py-12">

          {/* Page header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900">
                🛍 Giỏ hàng
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {itemCount > 0 ? `${itemCount} sản phẩm đang chờ bạn` : "Giỏ hàng trống"}
              </p>
            </div>
            {itemCount > 0 && (
              <button
                onClick={() => { clearCart(); triggerToast("Đã xóa toàn bộ giỏ hàng"); }}
                className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {itemCount === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 space-y-5">
              <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center">
                <svg className="w-10 h-10 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-zinc-400 font-semibold text-sm">Chưa có sản phẩm nào trong giỏ</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                ← Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Cart items list */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(({ product, rentDays }) => {
                  const subtotal = product.pricePerDay * rentDays;
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex gap-4 p-4"
                    >
                      {/* Thumbnail */}
                      <Link href={`/products/${product.id}`} className="shrink-0">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100">
                          {product.primaryImage ? (
                            <img
                              src={product.primaryImage}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                          )}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <Link href={`/products/${product.id}`}>
                          <h3 className="font-extrabold text-sm text-zinc-800 line-clamp-1 hover:text-violet-700 transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-xs text-zinc-400">{product.category?.name}</p>

                        {/* Rent days control */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 font-medium">Số ngày thuê:</span>
                          <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateRentDays(product.id, rentDays - 1)}
                              disabled={rentDays <= 1}
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 transition-colors cursor-pointer"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-zinc-800">{rentDays}</span>
                            <button
                              onClick={() => updateRentDays(product.id, rentDays + 1)}
                              className="w-7 h-7 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-xs text-zinc-400">ngày</span>
                        </div>
                      </div>

                      {/* Price + remove */}
                      <div className="shrink-0 flex flex-col items-end justify-between">
                        <button
                          onClick={() => handleRemove(product.id, product.name)}
                          className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-400">
                            {Number(product.pricePerDay).toLocaleString("vi-VN")}đ × {rentDays}
                          </p>
                          <p className="text-base font-extrabold text-violet-700">
                            {Number(subtotal).toLocaleString("vi-VN")}đ
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 space-y-4 sticky top-24">
                  <h2 className="font-extrabold text-zinc-800 text-base">Tóm tắt đơn hàng</h2>

                  <div className="space-y-2 text-sm">
                    {items.map(({ product, rentDays }) => (
                      <div key={product.id} className="flex justify-between text-zinc-500">
                        <span className="truncate max-w-[150px]">{product.name}</span>
                        <span className="font-semibold text-zinc-700 shrink-0 ml-2">
                          {Number(product.pricePerDay * rentDays).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-zinc-100 pt-3 flex justify-between items-center">
                    <span className="font-bold text-zinc-700">Tổng cộng</span>
                    <span className="font-extrabold text-xl text-violet-700">
                      {Number(totalPrice).toLocaleString("vi-VN")}đ
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    * Giá tính theo số ngày thuê đã chọn. Tiền đặt cọc sẽ được tính khi xác nhận đơn.
                  </p>

                  <button
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-extrabold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                    onClick={() => router.push("/checkout")}
                  >
                    Tiến hành đặt thuê →
                  </button>

                  <Link
                    href="/"
                    className="flex items-center justify-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    ← Tiếp tục mua sắm
                  </Link>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
