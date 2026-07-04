"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { productService, ProductDetail, ProductSummary } from "@/services/product-service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/wishlist-context";
import { BookingWidget } from "@/components/features/booking/booking-widget";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { user } = useAuth();
  const { triggerToast } = useToast();
  const { isFavorited, toggleFavorite } = useWishlist();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [similarProducts, setSimilarProducts] = useState<ProductSummary[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProductAndSimilar = async () => {
      try {
        setLoading(true);
        const data = await productService.getPublicProductDetail(Number(id));
        setProduct(data);

        // Fetch similar products in same category from public endpoint
        try {
          const simRes = await productService.getPublicProducts({
            page: 0,
            size: 4,
            categoryId: data.category.id,
          });
          const mapped = (simRes.content || []).map((p) => ({
            id: p.id,
            name: p.name,
            pricePerDay: p.pricePerDay,
            status: p.status,
            category: {
              id: data.category.id,
              name: p.categoryName,
              slug: "",
            },
            primaryImage: p.primaryImageUrl,
            createdAt: p.createdAt,
          }));
          // Filter out current product
          const filtered = mapped.filter((p) => p.id !== data.id);
          setSimilarProducts(filtered);
        } catch (simErr) {
          console.error("Lỗi lấy sản phẩm tương tự:", simErr);
        }
      } catch (err) {
        console.error("Lỗi tải chi tiết sản phẩm:", err);
        triggerToast("Không tìm thấy sản phẩm!");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndFavorite();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    async function fetchProductAndFavorite() {
      await fetchProductAndSimilar();
    }
  }, [id]);

  const isOwner = !!(user && product && product.owner.id === (user as any).id);
  const favorited = product ? isFavorited(product.id) : false;

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

  const handlePrevImage = () => {
    if (!product) return;
    setActiveImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product) return;
    setActiveImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  // Mock data for rating & amenities to match Shario design
  const mockRating = {
    average: 4.8,
    totalCount: 12,
    stars: [
      { count: 5, percentage: 75, countLabel: "9" },
      { count: 4, percentage: 17, countLabel: "2" },
      { count: 3, percentage: 8, countLabel: "1" },
      { count: 2, percentage: 0, countLabel: "0" },
      { count: 1, percentage: 0, countLabel: "0" },
    ],
  };

  const mockFeatures = [
    { num: 1, title: "Thiết kế cao cấp", desc: "Vật liệu hoàn thiện tỉ mỉ, độ bền cao" },
    { num: 2, title: "Hiệu năng vượt trội", desc: "Được tối ưu hóa cho mục đích sử dụng chuyên nghiệp" },
    { num: 3, title: "Tiện lợi linh hoạt", desc: "Dễ dàng thao tác và di chuyển mọi nơi" },
    { num: 4, title: "Chất lượng tin cậy", desc: "Đảm bảo kỹ thuật và an toàn tối đa" },
  ];

  const mockReviews = [
    {
      author: "Trần Thị Hương",
      rating: 5,
      time: "2 tuần trước",
      avatarLetter: "H",
      content: "Đồ dùng nhận được rất đúng mô tả, chủ cho thuê cực kỳ thân thiện và hướng dẫn sử dụng rất nhiệt tình. Chắc chắn sẽ tiếp tục ủng hộ!",
    },
    {
      author: "Nguyễn Quốc Bảo",
      rating: 5,
      time: "1 tháng trước",
      avatarLetter: "B",
      content: "Trải nghiệm sản phẩm tuyệt vời, giao hàng nhanh chóng, hỗ trợ nhiệt tình. Rất xứng đáng 5 sao!",
    },
    {
      author: "Lê Minh Châu",
      rating: 4,
      time: "1 tháng trước",
      avatarLetter: "C",
      content: "Sản phẩm chất lượng tốt, chạy ổn định, thủ tục giao nhận nhanh gọn lẹ. Sẽ thuê tiếp khi cần thiết.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-primary">
      <Header />

      {loading ? (
        /* Loading skeleton */
        <div className="max-w-[1200px] mx-auto px-6 py-12 animate-pulse space-y-6">
          <div className="h-8 bg-zinc-200 rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="aspect-[16/9] bg-zinc-200 rounded-3xl" />
              <div className="h-24 bg-zinc-200 rounded-3xl" />
            </div>
            <div className="lg:col-span-4 h-[400px] bg-zinc-200 rounded-3xl" />
          </div>
        </div>
      ) : !product ? null : (
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-10 space-y-10">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 font-bold">
            <Link href="/" className="hover:text-zinc-700 transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/explore" className="hover:text-zinc-700 transition-colors">Khám phá</Link>
            <span>/</span>
            <span className="text-zinc-500">{product.category.name}</span>
            <span>/</span>
            <span className="text-zinc-800 truncate max-w-[200px]">{product.name}</span>
          </nav>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column (60%) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              
              {/* Image Gallery */}
              <div className="space-y-4">
                {/* Large viewport image with carousel arrows */}
                <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-zinc-100 shadow-sm relative group">
                  {product.images.length > 0 ? (
                    <>
                      <img
                        src={product.images[activeImage]?.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover select-none"
                      />
                      {product.images.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-700 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-700 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </>
                      )}
                      
                      {/* Counter Badge */}
                      <span className="absolute bottom-4 right-4 bg-zinc-950/75 px-3 py-1 rounded-full text-[10px] font-bold text-white tracking-widest select-none">
                        {activeImage + 1}/{product.images.length}
                      </span>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                      Chưa có ảnh
                    </div>
                  )}
                </div>

                {/* Thumbnails list */}
                {product.images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {product.images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(idx)}
                        className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          activeImage === idx ? "border-violet-600 shadow-sm" : "border-transparent hover:border-zinc-300"
                        }`}
                      >
                        <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-3 pb-6 border-b border-zinc-100">
                <div className="flex items-center justify-between gap-4">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 leading-tight">
                    {product.name}
                  </h1>

                  {/* Wishlist toggle button */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      disabled={actionLoading}
                      onClick={handleToggleFavorite}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${
                        favorited
                          ? "border-red-100 bg-red-50 text-red-500"
                          : "border-zinc-200 bg-white text-zinc-500 hover:text-red-500 hover:bg-zinc-50"
                      }`}
                      title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
                    >
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          favorited ? "scale-110 fill-current animate-heartBeat" : "fill-none stroke-current"
                        }`}
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        triggerToast("Đã copy liên kết sản phẩm! 🔗");
                      }}
                      className="w-10 h-10 rounded-full border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                      title="Chia sẻ"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l5.068-2.534m0 0A3 3 0 1118 7.5a3 3 0 01-4.248 2.742m-5.068 1.484l5.068 2.534m0 0A3 3 0 1118 16.5a3 3 0 01-4.248-2.742m-5.068-1.484a3 3 0 11-4.248-2.742" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-bold text-zinc-500">
                  <span className="flex items-center gap-0.5 text-amber-500 font-extrabold">
                    ★ {mockRating.average} <span className="text-zinc-400 font-bold">({mockRating.totalCount})</span>
                  </span>
                  <span>•</span>
                  {product.address && (
                    <>
                      <span className="text-zinc-600">{product.address}</span>
                      <span>•</span>
                    </>
                  )}
                  <span className="text-zinc-400">{product.category.name}</span>
                </div>

                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-2xl font-black text-zinc-900">
                    {product.pricePerDay.toLocaleString("vi-VN")}đ
                  </span>
                  <span className="text-xs text-zinc-400 font-extrabold uppercase">/ ngày</span>
                </div>
              </div>

              {/* Verified Owner Card */}
              <div className="p-4 bg-zinc-50/50 border border-zinc-150 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center shrink-0 border border-violet-200">
                    <span className="text-violet-700 font-black text-sm">
                      {product.owner.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-zinc-800">{product.owner.fullName}</span>
                      <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-black border border-green-200/50 flex items-center gap-0.5">
                        ✓ Đã xác minh
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                      ★ 4.9 • 512 lượt thuê thành công
                    </p>
                  </div>
                </div>
                <Link
                  href={user && product.owner.id === user.id ? "/profile" : `/users/${product.owner.id}`}
                  className="px-4 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl text-xs font-extrabold text-zinc-600 transition-colors cursor-pointer inline-block"
                >
                  Xem hồ sơ
                </Link>
              </div>

              {/* Description */}
              <div className="space-y-3 pb-6 border-b border-zinc-100">
                <h3 className="font-extrabold text-sm text-zinc-800 uppercase tracking-wider">Về món đồ này</h3>
                <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                  {product.description || "Chủ sản phẩm chưa cung cấp thông tin mô tả chi tiết."}
                </p>
              </div>

              {/* Features (Tính năng) */}
              <div className="space-y-4 pb-6 border-b border-zinc-100">
                <h3 className="font-extrabold text-sm text-zinc-800 uppercase tracking-wider">Tính năng nổi bật</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockFeatures.map((feat) => (
                    <div key={feat.num} className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-xl flex items-start gap-3">
                      <span className="text-2xl font-black text-violet-600/35 select-none leading-none mt-0.5">
                        {feat.num}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-zinc-800">{feat.title}</h4>
                        <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-normal">{feat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Analysis */}
              <div className="space-y-6 pb-6 border-b border-zinc-100">
                <h3 className="font-extrabold text-sm text-zinc-800 uppercase tracking-wider">Đánh giá từ người dùng ({mockRating.totalCount})</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  {/* Left big number */}
                  <div className="sm:col-span-4 text-center sm:border-r sm:border-zinc-100 py-2">
                    <div className="text-4xl font-black text-zinc-800 leading-none">{mockRating.average}</div>
                    <div className="flex justify-center gap-0.5 text-amber-400 my-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-sm">★</span>
                      ))}
                    </div>
                    <div className="text-[10px] text-zinc-400 font-bold">Điểm trung bình</div>
                  </div>

                  {/* Progress bars */}
                  <div className="sm:col-span-8 space-y-1.5">
                    {mockRating.stars.map((star) => (
                      <div key={star.count} className="flex items-center gap-3 text-[10px] font-bold text-zinc-500">
                        <span className="w-3 select-none">{star.count}</span>
                        <span className="text-zinc-400">★</span>
                        <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${star.percentage}%` }} />
                        </div>
                        <span className="w-5 text-right select-none">{star.countLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review comments list */}
                <div className="space-y-4 pt-2">
                  {mockReviews.map((rev, idx) => (
                    <div key={idx} className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 border border-zinc-300">
                            <span className="text-zinc-600 font-bold text-xs">{rev.avatarLetter}</span>
                          </div>
                          <div>
                            <span className="text-xs font-black text-zinc-700 block">{rev.author}</span>
                            <span className="text-[9px] text-zinc-400 font-bold block mt-0.5">{rev.time}</span>
                          </div>
                        </div>
                        <div className="flex gap-0.5 text-amber-400 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">{rev.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar Products */}
              {similarProducts.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-extrabold text-sm text-zinc-800 uppercase tracking-wider">Món đồ tương tự</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {similarProducts.map((p) => {
                      const favoritedSim = isFavorited(p.id);
                      return (
                        <div key={p.id} className="border border-zinc-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative bg-white">
                          
                          {/* Heart toggle on similar card */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(p.id, p.name);
                            }}
                            className={`absolute top-2.5 left-2.5 p-1.5 rounded-full shadow-sm transition-all duration-200 z-10 cursor-pointer hover:scale-105 active:scale-95 ${
                              favoritedSim ? "bg-red-50/95 text-red-500" : "bg-white/80 text-zinc-500 hover:text-red-500"
                            }`}
                          >
                            <svg className={`w-3.5 h-3.5 ${favoritedSim ? "fill-current" : "fill-none stroke-current"}`} viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>

                          {/* Image */}
                          <Link href={`/products/${p.id}`} className="block h-[120px] overflow-hidden relative">
                            {p.primaryImage ? (
                              <img src={p.primaryImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-300" />
                            ) : (
                              <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-xl">📦</div>
                            )}
                            <span className="absolute bottom-2 left-2 bg-white/95 px-2 py-0.5 rounded-md text-[9px] font-black text-zinc-800 shadow-sm">
                              {p.pricePerDay.toLocaleString("vi-VN")}đ
                            </span>
                          </Link>

                          {/* Info */}
                          <div className="p-3 space-y-1">
                            <h4 className="text-[11px] font-black text-zinc-800 truncate leading-tight group-hover:text-violet-600 transition-colors">
                              <Link href={`/products/${p.id}`}>{p.name}</Link>
                            </h4>
                            <p className="text-[9px] text-zinc-400 font-bold">{p.category.name}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column (40%, sticky) */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
              <BookingWidget
                product={product}
                isOwner={isOwner}
                onMessageClick={() => {
                  // Direct to message
                  if (!user) {
                    triggerToast("Vui lòng đăng nhập để gửi tin nhắn");
                    setTimeout(() => router.push("/login"), 1500);
                  } else {
                    // Custom global dispatch for opening chat
                    const event = new CustomEvent("open-chat-drawer", {
                      detail: { recipientId: product.owner.id },
                    });
                    window.dispatchEvent(event);
                  }
                }}
              />
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
