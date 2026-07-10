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
import LocationSelectorModal from "@/components/features/search/location-selector-modal";
import { Search, MapPin, Heart, Package, Star, MapPinned, Loader2 } from "lucide-react";

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isFavorited, toggleFavorite } = useWishlist();
  const { triggerToast } = useToast();

  // Search parameters from URL
  const queryKeyword = searchParams?.get("keyword") || "";
  const queryCategoryId = searchParams?.get("categoryId") || "";
  const queryAddress = searchParams?.get("address") || "";
  const queryLatitude = searchParams?.get("latitude") || "";
  const queryLongitude = searchParams?.get("longitude") || "";
  const queryRadius = searchParams?.get("radius") || "";

  // Component States
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<PublicProductSummaryResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<ProductFilters>({
    categoryIds: queryCategoryId ? [Number(queryCategoryId)] : [],
    priceRange: [0, 50000000],
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
        const activeCategoryIds = filters.categoryIds.length > 0 ? filters.categoryIds : undefined;

        const res = await productService.getPublicProducts({
          page,
          size: 12,
          keyword: queryKeyword || undefined,
          categoryIds: activeCategoryIds,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          address: queryAddress || undefined,
          latitude: queryLatitude ? Number(queryLatitude) : undefined,
          longitude: queryLongitude ? Number(queryLongitude) : undefined,
          radius: queryRadius ? Number(queryRadius) : undefined,
          sort: filters.sort,
        });

        // Filter client-side by rating if active
        let filteredContent = res.content || [];
        if (filters.minRating) {
          filteredContent = filteredContent.filter((p) => {
            const pRating = 3.5 + (p.id % 15) * 0.1;
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
  }, [filters, page, queryKeyword, queryAddress, queryLatitude, queryLongitude, queryRadius]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const getSimulatedRating = (id: number) => {
    return (3.5 + (id % 15) * 0.1).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-secondary font-sans text-primary">
      <Header />

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8">
        
        {/* Top Header Summary */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {queryKeyword ? `Kết quả tìm kiếm cho "${queryKeyword}"` : "Khám phá tất cả đồ dùng"}
            </h1>
            <p className="text-sm font-medium text-secondary mt-1">
              Tìm thấy <span className="font-bold text-brand-600">{totalElements}</span> sản phẩm phù hợp
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                queryLatitude && queryLongitude
                  ? "bg-brand-50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-400"
                  : "bg-primary border-secondary text-secondary hover:border-brand-200 hover:bg-brand-50 dark:hover:bg-brand-950/30 hover:text-brand-700"
              }`}
              title="Tìm đồ dùng quanh vị trí của bạn"
            >
              <MapPinned className="w-4 h-4" />
              <span>Gần tôi {queryRadius ? `(${queryRadius}km)` : ""}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-secondary select-none shrink-0 hidden sm:inline">Sắp xếp:</span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value as any })}
                className="px-4 py-2 bg-primary border border-secondary rounded-xl text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="relevant">Liên quan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Columns Content */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column - Filter Sidebar (280px) */}
          <FilterSidebar
            categories={categories}
            filters={filters}
            onChange={handleFilterChange}
            onClearAll={() => router.push("/explore")}
          />

          {/* Right Column - Results Listing Grid */}
          <div className="flex-1 w-full space-y-8">
            {loading ? (
              /* Grid skeleton loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-primary rounded-2xl border border-secondary overflow-hidden shadow-sm">
                    <div className="aspect-[4/3] bg-secondary" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-secondary rounded w-3/4" />
                      <div className="h-3 bg-secondary rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-primary border border-secondary border-dashed rounded-2xl px-6">
                <Search className="w-12 h-12 text-tertiary mx-auto mb-4" />
                <h3 className="font-semibold text-base text-primary">Không tìm thấy sản phẩm nào</h3>
                <p className="text-sm text-secondary mt-2 max-w-sm mx-auto">
                  Hãy thử thay đổi phạm vi khoảng giá, chọn danh mục khác, hoặc xóa bớt bộ lọc tìm kiếm.
                </p>
                <button 
                  onClick={() => router.push("/explore")} 
                  className="mt-6 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              /* Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((p) => {
                  const favorited = isFavorited(p.id);
                  return (
                    <div
                      key={p.id}
                      className="border border-secondary rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 group bg-primary relative flex flex-col h-full"
                    >
                      {/* Heart Toggle Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(p.id, p.name);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all duration-200 z-10 cursor-pointer ${
                          favorited 
                            ? "bg-red-50 text-red-500 dark:bg-red-500/20 dark:text-red-400" 
                            : "bg-primary text-secondary hover:text-red-500"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
                      </button>

                      {/* Image Frame with Price Tag */}
                      <Link href={`/products/${p.id}`} className="block aspect-[4/3] w-full overflow-hidden relative bg-secondary shrink-0 flex items-center justify-center border-b border-secondary">
                        {p.primaryImageUrl ? (
                          <img
                            src={p.primaryImageUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 select-none"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-tertiary" />
                        )}
                        <span className="absolute bottom-3 left-3 bg-primary/95 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-bold text-primary shadow-sm">
                          {p.pricePerDay.toLocaleString("vi-VN")}đ<span className="text-[10px] font-medium text-secondary">/ngày</span>
                        </span>
                      </Link>

                      {/* Info Details Section */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="font-semibold text-sm text-primary leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                            <Link href={`/products/${p.id}`}>{p.name}</Link>
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-medium text-secondary">
                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              {getSimulatedRating(p.id)}
                            </span>
                            <span>•</span>
                            <span className="truncate">{p.categoryName}</span>
                          </div>
                        </div>

                        {p.address && (
                          <div className="flex items-start gap-1.5 text-xs text-secondary font-medium pt-3 border-t border-secondary mt-auto">
                            <MapPin className="w-3.5 h-3.5 text-tertiary shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{p.address}</span>
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
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-secondary rounded-xl text-sm font-semibold text-secondary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>
                
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center ${
                        page === idx
                          ? "bg-brand-600 text-white shadow-sm"
                          : "border border-secondary text-secondary hover:bg-secondary"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                
                <div className="sm:hidden text-sm font-semibold text-secondary px-4">
                  {page + 1} / {totalPages}
                </div>

                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-secondary rounded-xl text-sm font-semibold text-secondary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        initialLat={Number(queryLatitude) || undefined}
        initialLng={Number(queryLongitude) || undefined}
        initialRadius={Number(queryRadius) || undefined}
        initialAddress={queryAddress}
        onClear={() => {
          setIsLocationModalOpen(false);
          const params = new URLSearchParams(searchParams?.toString() || "");
          params.delete("latitude");
          params.delete("longitude");
          params.delete("radius");
          params.delete("address");
          router.push(`/explore?${params.toString()}`);
        }}
        onApply={(lat, lng, radius, address) => {
          setIsLocationModalOpen(false);
          const params = new URLSearchParams(searchParams?.toString() || "");
          params.set("latitude", lat.toString());
          params.set("longitude", lng.toString());
          params.set("radius", radius.toString());
          // Cập nhật address nếu muốn hiển thị
          if (address) params.set("address", address);
          router.push(`/explore?${params.toString()}`);
        }}
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-secondary">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}
