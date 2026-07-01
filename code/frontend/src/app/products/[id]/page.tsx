"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { productService, ProductDetail } from "@/services/product-service";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/wishlist-context";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, isInCart } = useCart();
  const { triggerToast } = useToast();
  const { isFavorited, toggleFavorite } = useWishlist();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getPublicProductDetail(Number(id));
        setProduct(data);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        triggerToast("Không tìm thấy sản phẩm!");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const isOwner = user && product && product.owner.id === (user as any).id;
  const canAddToCart = product?.status === "AVAILABLE" && !isOwner;
  const alreadyInCart = product ? isInCart(product.id) : false;

  const handleAddToCart = () => {
    if (!user) {
      triggerToast("Vui lòng đăng nhập để sử dụng tính năng này");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
      return;
    }
    if (!product) return;
    // Convert ProductDetail to ProductSummary shape for cart
    const summary = {
      id: product.id,
      name: product.name,
      pricePerDay: product.pricePerDay,
      status: product.status,
      category: product.category as any,
      primaryImage: product.images.find((img) => img.isPrimary)?.imageUrl ?? product.images[0]?.imageUrl ?? null,
      createdAt: product.createdAt,
    };
    addItem(summary as any, 1);
    triggerToast("Đã thêm vào giỏ hàng! 🛍");
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    if (actionLoading) return;
    
    setActionLoading(true);
    try {
      await toggleFavorite(product.id, product.name);
    } catch (err) {
      console.error("Lỗi yêu thích:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const statusLabel: Record<string, { text: string; cls: string }> = {
    AVAILABLE:   { text: "Có sẵn",     cls: "bg-green-100 text-green-700" },
    RENTED:      { text: "Đang cho thuê", cls: "bg-amber-100 text-amber-700" },
    UNAVAILABLE: { text: "Không khả dụng", cls: "bg-zinc-100 text-zinc-500" },
    PENDING:     { text: "Chờ duyệt",   cls: "bg-yellow-100 text-yellow-700" },
    BLOCKED:     { text: "Đã khóa (Admin)", cls: "bg-rose-100 text-rose-700" },
  };

  const favorited = product ? isFavorited(product.id) : false;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <Header />

      {loading ? (
        /* Loading skeleton */
        <div className="max-w-[1080px] mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-8 bg-zinc-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-[4/3] bg-zinc-200 rounded-2xl" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 bg-zinc-200 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      ) : !product ? null : (
        <div className="max-w-[1080px] mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <Link href="/" className="hover:text-zinc-700 transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-zinc-500">{product.category.name}</span>
            <span>/</span>
            <span className="text-zinc-800 truncate max-w-[200px]">{product.name}</span>
          </nav>

          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

            {/* Left — Image gallery */}
            <div className="space-y-3">
              {/* Primary image */}
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 shadow-sm relative">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[activeImage]?.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                    Chưa có ảnh
                  </div>
                )}
                
                {/* Floating Heart Icon on Image as well (Airbnb Style) */}
                <button
                  disabled={actionLoading}
                  onClick={handleToggleFavorite}
                  className={`absolute top-4 right-4 p-3 rounded-full shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer ${
                    favorited 
                      ? "bg-red-50/95 text-red-500 scale-105" 
                      : "bg-white/90 text-zinc-600 hover:text-red-500 hover:scale-105"
                  } active:scale-95`}
                  title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
                >
                  <svg 
                    className={`w-5.5 h-5.5 transition-transform duration-200 ${favorited ? "scale-110 fill-current" : "fill-none stroke-current"}`} 
                    viewBox="0 0 24 24" 
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(idx)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === idx ? "border-violet-500" : "border-transparent hover:border-zinc-300"
                      }`}
                    >
                      <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — Product info */}
            <div className="space-y-5">
              {/* Status badge */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusLabel[product.status]?.cls}`}>
                  {statusLabel[product.status]?.text}
                </span>
                <span className="text-xs text-zinc-400">{product.category.name}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 leading-tight">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                <span className="text-3xl font-black text-violet-700">
                  {product.pricePerDay.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-sm text-violet-500 font-semibold">/ngày</span>
                {product.depositAmount > 0 && (
                  <span className="ml-auto text-xs text-zinc-500 font-medium">
                    Đặt cọc: {product.depositAmount.toLocaleString("vi-VN")}đ
                  </span>
                )}
              </div>

              {/* Owner */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-200">
                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                  <span className="text-violet-700 font-bold text-sm">
                    {product.owner.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Người cho thuê</p>
                  <p className="text-sm font-bold text-zinc-800">{product.owner.fullName}</p>
                </div>
              </div>

              {/* Address */}
              {product.address && (
                <div className="flex items-start gap-2 text-sm text-zinc-600">
                  <svg className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{product.address}</span>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mô tả</p>
                  <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {/* CTA */}
              <div className="pt-2 space-y-3">
                {isOwner ? (
                  <div className="flex gap-3">
                    <Link
                      href={`/products/my`}
                      className="flex-1 text-center py-3 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-bold hover:bg-zinc-200 transition-colors"
                    >
                      Đây là sản phẩm của bạn
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      disabled={!canAddToCart || alreadyInCart}
                      onClick={handleAddToCart}
                      className={`flex-1 py-3.5 rounded-xl text-sm font-extrabold transition-all ${
                        alreadyInCart
                          ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
                          : canAddToCart
                          ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md cursor-pointer"
                          : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                      }`}
                    >
                      {alreadyInCart
                        ? "✓ Đã có trong giỏ"
                        : canAddToCart
                        ? "🛍 Thêm vào giỏ"
                        : product.status === "RENTED"
                        ? "Đang được thuê"
                        : "Không khả dụng"}
                    </button>

                    <button
                      disabled={actionLoading}
                      onClick={handleToggleFavorite}
                      className={`px-6 rounded-full border flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:scale-105 active:scale-95 ${
                        actionLoading
                          ? "bg-zinc-50 border-zinc-200 text-zinc-400 cursor-not-allowed"
                          : favorited
                          ? "border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
                          : "border-zinc-200 bg-white text-zinc-500 hover:text-red-500 hover:bg-zinc-50"
                      }`}
                      title={favorited ? "Bỏ yêu thích" : "Yêu thích sản phẩm"}
                    >
                      <svg 
                        className={`w-5 h-5 transition-transform duration-200 ${
                          actionLoading ? "animate-pulse" : favorited ? "scale-110 fill-current animate-[heartBeat_0.4s_ease-in-out]" : "fill-none stroke-current"
                        }`} 
                        viewBox="0 0 24 24" 
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-xs font-extrabold select-none">
                        {actionLoading ? "Đang xử lý..." : favorited ? "Đã yêu thích" : "Yêu thích"}
                      </span>
                    </button>
                  </div>
                )}

                <Link
                  href="/"
                  className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  ← Quay lại trang chủ
                </Link>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
