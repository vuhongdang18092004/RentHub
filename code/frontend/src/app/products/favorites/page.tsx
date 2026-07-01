"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { favoriteService, FavoriteItem } from "@/services/favorite-service";
import { useToast } from "@/context/ToastContext";

export default function MyFavoritesPage() {
  const { triggerToast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFavorites = async (pageNum = 0) => {
    try {
      setLoading(true);
      const res = await favoriteService.getMyFavorites(pageNum, 12);
      setFavorites(res.content || []);
      setTotalPages(res.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error("Lỗi lấy danh sách yêu thích:", err);
      triggerToast("Không thể tải danh sách sản phẩm yêu thích!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites(0);
  }, []);

  const handleRemoveFavorite = async (e: React.MouseEvent, productId: number, productName: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await favoriteService.removeFavorite(productId);
      triggerToast(`Đã bỏ thích "${productName}"!`);
      // Reload favorites
      fetchFavorites(page);
    } catch (err) {
      console.error("Lỗi bỏ thích sản phẩm:", err);
      triggerToast("Không thể bỏ thích sản phẩm.");
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6 font-sans">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-primary">Sản phẩm yêu thích của tôi</h1>
            <p className="text-sm text-secondary">
              Danh sách các món đồ bạn đã thích và quan tâm để dễ dàng theo dõi, thuê khi cần.
            </p>
          </div>

          {loading ? (
            <div className="py-24 bg-white border border-secondary rounded-2xl flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-secondary font-medium">Đang tải danh sách yêu thích...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="py-24 bg-white border border-secondary rounded-2xl flex flex-col items-center justify-center text-center p-8 space-y-4">
              <span className="text-5xl">❤️</span>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-primary">Chưa có sản phẩm yêu thích</h3>
                <p className="text-xs text-secondary max-w-[280px]">
                  Bấm biểu tượng trái tim trên các sản phẩm khi lướt xem để lưu vào danh sách này.
                </p>
              </div>
              <Link
                href="/"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all inline-block"
              >
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favorites.map((item) => {
                  const priceLabel = `${Number(item.rentalPrice).toLocaleString("vi-VN")}đ`;
                  const isAvailable = item.productStatus === "AVAILABLE";

                  return (
                    <Link
                      key={item.favoriteId}
                      href={`/products/${item.productId}`}
                      className="bg-white border border-zinc-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative block"
                    >
                      {/* Heart Button to remove */}
                      <button
                        onClick={(e) => handleRemoveFavorite(e, item.productId, item.productName)}
                        title="Bỏ thích"
                        className="absolute top-3 right-3 p-2 rounded-full shadow-sm bg-white/90 hover:bg-white text-red-500 hover:scale-105 transition-all z-10 cursor-pointer"
                      >
                        <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Thumbnail */}
                      <div className="h-[180px] w-full overflow-hidden relative">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.productName} className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-300" />
                        ) : (
                          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-3xl">📦</div>
                        )}
                        <span className="absolute bottom-3 left-3 bg-white/95 px-3 py-1 rounded-lg text-xs font-black shadow-sm text-zinc-800">
                          {priceLabel} <span className="text-[9px] font-bold text-zinc-500">/ ngày</span>
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-extrabold text-sm text-zinc-800 line-clamp-1 group-hover:text-violet-700 transition-colors">{item.productName}</h3>
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isAvailable ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {item.productStatusMessage || (isAvailable ? "Sẵn sàng" : "Đang bận")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                  <button
                    disabled={page === 0}
                    onClick={() => fetchFavorites(page - 1)}
                    className="px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Trước
                  </button>
                  <span className="text-xs font-bold text-zinc-500">
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => fetchFavorites(page + 1)}
                    className="px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 disabled:opacity-40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
