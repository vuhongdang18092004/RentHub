"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { FilterSidebar, ProductFilters } from "@/components/features/products/filter-sidebar";
import { productService, PublicProductSummaryResponse } from "@/services/product-service";
import { CategoryResponse } from "@/types/backend";
import { useWishlist } from "@/context/wishlist-context";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isFavorited, toggleFavorite } = useWishlist();
  const { triggerToast } = useToast();

  // Search parameters from URL
  const queryKeyword = searchParams?.get("keyword") || "";
  const queryCategoryId = searchParams?.get("categoryId") || "";
  const queryAddress = searchParams?.get("address") || "";

  // Component States
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<PublicProductSummaryResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<ProductFilters>({
    categoryIds: queryCategoryId ? [Number(queryCategoryId)] : [],
    priceRange: [0, 5000000],
    minRating: undefined,
    sort: "newest",
  });

  // Sync categoryId from URL query when it changes
  useEffect(() => {
    if (queryCategoryId) {
      setFilters((prev) => ({
        ...prev,
        categoryIds: [Number(queryCategoryId)],
      }));
      setPage(0);
    }
  }, [queryCategoryId]);

  // Load categories list once
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catList = await productService.getCategories();
        setCategories(catList || []);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };
    loadCategories();
  }, []);

  // Fetch products whenever filters or page or query changes
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        // Backend GET /api/products/public only accepts a single categoryId
        const activeCatId = filters.categoryIds.length > 0 ? filters.categoryIds[0] : undefined;

        const res = await productService.getPublicProducts({
          page,
          size: 12,
          keyword: queryKeyword || undefined,
          categoryId: activeCatId,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          address: queryAddress || undefined,
          sort: filters.sort,
        });

        // Filter client-side by rating if active
        let filteredContent = res.content || [];
        if (filters.minRating) {
          // Since rating is mocked in UI, we can filter using a deterministic hash of product ID to simulate ratings
          filteredContent = filteredContent.filter((p) => {
            const pRating = 3.5 + (p.id % 15) * 0.1; // Simulated rating between 3.5 and 5.0
            return pRating >= (filters.minRating || 0);
          });
        }

        setProducts(filteredContent);
        setTotalElements(res.totalElements);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        triggerToast("Lỗi kết nối máy chủ. Không thể lấy dữ liệu sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [filters, page, queryKeyword, queryAddress]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const getSimulatedRating = (id: number) => {
    return (3.5 + (id % 15) * 0.1).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-primary">
      <Header />

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
        
        {/* Top Header Summary */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900">
              {queryKeyword ? `Kết quả tìm kiếm cho "${queryKeyword}"` : "Khám phá tất cả đồ dùng"}
            </h1>
            <p className="text-xs text-zinc-400 font-extrabold mt-1 uppercase tracking-wider">
              TÌM THẤY <span className="text-violet-600">{totalElements}</span> MÓN ĐỒ
            </p>
          </div>

          {/* Sort Selection Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 select-none shrink-0">Sắp xếp:</span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value as any })}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-extrabold text-zinc-700 focus:outline-none cursor-pointer focus:border-violet-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="relevant">Liên quan</option>
            </select>
          </div>
        </div>

        {/* Main Columns Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column - Filter Sidebar (280px) */}
          <FilterSidebar
            categories={categories}
            filters={filters}
            onChange={handleFilterChange}
          />

          {/* Right Column - Results Listing Grid */}
          <div className="flex-1 w-full space-y-8">
            {loading ? (
              /* Grid skeleton loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[4/3] bg-zinc-200 rounded-2xl" />
                    <div className="h-4 bg-zinc-200 rounded w-3/4" />
                    <div className="h-3 bg-zinc-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 border border-zinc-150 border-dashed rounded-3xl p-6">
                <svg className="w-12 h-12 text-zinc-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-extrabold text-sm text-zinc-700">Không tìm thấy sản phẩm nào</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Hãy thử thay đổi phạm vi khoảng giá, chọn danh mục khác, hoặc xóa bớt bộ lọc tìm kiếm.
                </p>
              </div>
            ) : (
              /* Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p) => {
                  const favorited = isFavorited(p.id);
                  return (
                    <div
                      key={p.id}
                      className="border border-zinc-150 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 group bg-white relative flex flex-col h-full"
                    >
                      {/* Heart Toggle Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(p.id, p.name);
                        }}
                        className={`absolute top-3 right-3 p-1.5 rounded-full shadow-sm transition-all duration-200 z-10 cursor-pointer hover:scale-105 active:scale-95 ${
                          favorited ? "bg-red-50/95 text-red-500" : "bg-white/80 text-zinc-500 hover:text-red-500"
                        }`}
                      >
                        <svg className={`w-4 h-4 ${favorited ? "fill-current" : "fill-none stroke-current"}`} viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      {/* Image Frame with Price Tag */}
                      <Link href={`/products/${p.id}`} className="block aspect-[4/3] w-full overflow-hidden relative bg-zinc-100 shrink-0">
                        {p.primaryImageUrl ? (
                          <img
                            src={p.primaryImageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-300 select-none"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                        )}
                        <span className="absolute bottom-3 left-3 bg-white/95 px-3 py-1 rounded-lg text-[10px] font-black text-zinc-800 shadow-sm">
                          {p.pricePerDay.toLocaleString("vi-VN")}đ<span className="text-[9px] font-bold text-zinc-400 select-none">/ngày</span>
                        </span>
                      </Link>

                      {/* Info Details Section */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-xs text-zinc-800 leading-snug truncate group-hover:text-violet-600 transition-colors">
                            <Link href={`/products/${p.id}`}>{p.name}</Link>
                          </h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
                            <span className="text-amber-500 font-extrabold flex items-center gap-0.5">
                              ★ {getSimulatedRating(p.id)}
                            </span>
                            <span>•</span>
                            <span>{p.categoryName}</span>
                          </div>
                        </div>

                        {p.address && (
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold truncate">
                            <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{p.address}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-zinc-100">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-3.5 py-2 border border-zinc-200 rounded-xl text-xs font-extrabold text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPage(idx)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      page === idx
                        ? "bg-violet-600 text-white shadow-sm"
                        : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="px-3.5 py-2 border border-zinc-200 rounded-xl text-xs font-extrabold text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  Sau
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div>Đang tải trang khám phá...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
