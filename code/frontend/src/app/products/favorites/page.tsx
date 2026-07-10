"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { favoriteService, FavoriteItem } from "@/services/favorite-service";
import { useToast } from "@/context/ToastContext";
import { Heart, HeartOff, Package, Loader2 } from "lucide-react";

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
      fetchFavorites(page);
    } catch (err) {
      console.error("Lỗi bỏ thích sản phẩm:", err);
      triggerToast("Không thể bỏ thích sản phẩm.");
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6 w-full">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-primary">Sản phẩm yêu thích</h1>
            <p className="text-sm text-secondary">
              Danh sách các món đồ bạn đã thích và quan tâm
            </p>
          </div>

          {loading ? (
            <div className="py-20 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center gap-4 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              <p className="text-sm text-secondary font-medium">Đang tải danh sách yêu thích...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="py-20 bg-primary border border-secondary rounded-xl flex flex-col items-center justify-center text-center px-6 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1 mb-6">
                <h3 className="text-base font-semibold text-primary">Chưa có sản phẩm yêu thích</h3>
                <p className="text-sm text-secondary max-w-sm mx-auto">
                  Bấm biểu tượng trái tim trên các sản phẩm khi lướt xem để lưu vào danh sách này.
                </p>
              </div>
              <Link
                href="/explore"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((item) => {
                  const priceLabel = `${Number(item.rentalPrice).toLocaleString("vi-VN")}đ`;
                  const isAvailable = item.productStatus === "AVAILABLE";

                  return (
                    <Link
                      key={item.favoriteId}
                      href={`/products/${item.productId}`}
                      className="bg-primary border border-secondary rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative flex flex-col"
                    >
                      {/* Remove button */}
                      <button
                        onClick={(e) => handleRemoveFavorite(e, item.productId, item.productName)}
                        title="Bỏ thích"
                        className="absolute top-3 right-3 p-2 rounded-full shadow-sm bg-primary hover:bg-red-50 text-secondary hover:text-red-500 transition-colors z-10"
                      >
                        <HeartOff className="w-4 h-4" />
                      </button>

                      {/* Image */}
                      <div className="aspect-[4/3] w-full overflow-hidden relative bg-secondary flex items-center justify-center border-b border-secondary">
                        {item.thumbnail ? (
                          <img 
                            src={item.thumbnail} 
                            alt={item.productName} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <Package className="w-12 h-12 text-tertiary" />
                        )}
                        <span className="absolute bottom-3 left-3 bg-primary/95 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-semibold shadow-sm text-primary">
                          {priceLabel} <span className="text-[10px] font-medium text-secondary">/ ngày</span>
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <h3 className="font-semibold text-sm text-primary line-clamp-2 group-hover:text-brand-600 transition-colors">
                          {item.productName}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                            isAvailable 
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900" 
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                          }`}>
                            {item.productStatusMessage || (isAvailable ? "Sẵn sàng" : "Đang bận")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    disabled={page === 0}
                    onClick={() => fetchFavorites(page - 1)}
                    className="px-4 py-2 border border-secondary rounded-lg text-sm font-medium text-secondary hover:bg-secondary disabled:opacity-50 transition-colors"
                  >
                    Trước
                  </button>
                  <span className="text-sm font-medium text-secondary px-2">
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => fetchFavorites(page + 1)}
                    className="px-4 py-2 border border-secondary rounded-lg text-sm font-medium text-secondary hover:bg-secondary disabled:opacity-50 transition-colors"
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
