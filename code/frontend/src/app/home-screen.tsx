"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/context/cart-context";
import api from "@/lib/axios";
import { Header } from "@/components/layout/header";
import { productService, ProductSummary } from "@/services/product-service";

const THUMBNAILS = [
  "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&auto=format&fit=crop&q=60", // bicycle
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=300&auto=format&fit=crop&q=60", // tent
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&auto=format&fit=crop&q=60", // boat
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=60", // hands/book
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=60", // shoes
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=60", // t-shirt
  "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&auto=format&fit=crop&q=60", // computer
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&auto=format&fit=crop&q=60", // skiing
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&auto=format&fit=crop&q=60"  // camera
];

const CATEGORIES = [
  { id: "all", name: "Tất cả", count: null, icon: "🔍", color: "bg-brand-50 text-brand-700" },
  { id: "electronic", name: "Điện tử", count: 284, icon: "📷", color: "bg-purple-50 text-purple-700" },
  { id: "sport", name: "Thể thao", count: 156, icon: "🚲", color: "bg-orange-50 text-orange-700" },
  { id: "outdoor", name: "Dã ngoại", count: 203, icon: "⛺", color: "bg-green-50 text-green-700" },
  { id: "music", name: "Âm nhạc", count: 98, icon: "🎸", color: "bg-pink-50 text-pink-700" },
  { id: "vehicle", name: "Phương tiện", count: 124, icon: "🚗", color: "bg-blue-50 text-blue-700" },
  { id: "appliance", name: "Gia dụng", count: 86, icon: "🏠", color: "bg-amber-50 text-amber-700" }
];


// Product card component reused across all sections
function ProductCard({ prod }: { prod: ProductSummary }) {
  const { addItem, isInCart } = useCart();
  const { triggerToast } = useToast();
  const inCart = isInCart(prod.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(prod, 1);
    triggerToast("Đã thêm vào giỏ! 🛍");
  };

  const priceLabel = `${Number(prod.pricePerDay).toLocaleString("vi-VN")}đ`;

  return (
    <Link
      href={`/products/${prod.id}`}
      className="bg-white border border-zinc-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative block"
    >
      {/* Cart add button */}
      <button
        onClick={handleAddToCart}
        disabled={prod.status !== "AVAILABLE" || inCart}
        title={inCart ? "Đã trong giỏ" : "Thêm vào giỏ"}
        className={`absolute top-3 right-3 p-2 rounded-full shadow-sm transition-all z-10 cursor-pointer ${
          inCart
            ? "bg-green-50 text-green-600"
            : "bg-white/80 hover:bg-white text-zinc-500 hover:text-violet-600"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {inCart
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
        </svg>
      </button>
      {/* Image */}
      <div className="h-[200px] w-full overflow-hidden relative">
        {prod.primaryImage ? (
          <img src={prod.primaryImage} alt={prod.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-300" />
        ) : (
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-3xl">📦</div>
        )}
        <span className="absolute bottom-3 left-3 bg-white/95 px-3 py-1 rounded-lg text-xs font-black shadow-sm text-zinc-800">
          {priceLabel} <span className="text-[9px] font-bold text-zinc-500">/ ngày</span>
        </span>
      </div>
      {/* Info */}
      <div className="p-4 space-y-1.5">
        <h3 className="font-extrabold text-sm text-zinc-800 line-clamp-1 group-hover:text-violet-700 transition-colors">{prod.name}</h3>
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
          <span className="bg-zinc-100 px-2 py-0.5 rounded-md text-[10px]">{prod.category?.name}</span>
          {prod.status !== "AVAILABLE" && (
            <span className="text-amber-600 text-[10px] font-bold">Đang thuê</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Compact card for trending carousel
function ProductCardCompact({ prod }: { prod: ProductSummary }) {
  const { addItem, isInCart } = useCart();
  const { triggerToast } = useToast();
  const inCart = isInCart(prod.id);
  const priceLabel = `${Number(prod.pricePerDay).toLocaleString("vi-VN")}đ`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(prod, 1);
    triggerToast("Đã thêm vào giỏ! 🛍");
  };

  return (
    <Link
      href={`/products/${prod.id}`}
      className="w-[190px] shrink-0 bg-white border border-zinc-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group relative block"
    >
      <button onClick={handleAddToCart} disabled={prod.status !== "AVAILABLE" || inCart}
        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow-sm z-10 cursor-pointer transition-all ${
          inCart ? "bg-green-50 text-green-600" : "bg-white/80 hover:bg-white text-zinc-500 hover:text-violet-600"
        }`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {inCart
            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
        </svg>
      </button>
      <div className="h-[145px] w-full overflow-hidden relative">
        {prod.primaryImage
          ? <img src={prod.primaryImage} alt={prod.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-300" />
          : <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-2xl">📦</div>}
        <span className="absolute bottom-2.5 left-2.5 bg-white/95 px-2.5 py-0.5 rounded-md text-[10px] font-black shadow-sm text-zinc-800">
          {priceLabel} <span className="text-[8px] font-bold text-zinc-500">/ ngày</span>
        </span>
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-extrabold text-xs text-zinc-800 line-clamp-1 group-hover:text-violet-700 transition-colors">{prod.name}</h3>
        <span className="text-[10px] text-zinc-400">{prod.category?.name}</span>
      </div>
    </Link>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, user: currentAdmin } = useAuth();
  const { triggerToast } = useToast();

  const isAdminParam = searchParams?.get("admin") === "true";
  const showAdminPanel = role === "ROLE_ADMIN" && isAdminParam;

  // Real products from API
  const [availableProducts, setAvailableProducts] = useState<ProductSummary[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<"users" | "categories" | "products">("users");

  // Product Approval State
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [productsApprovalLoading, setProductsApprovalLoading] = useState(false);

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Category Management State
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  // Load Users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data.content || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách tài khoản:", err);
      triggerToast("Không thể tải danh sách tài khoản!");
    } finally {
      setUsersLoading(false);
    }
  };

  // Load Categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await api.get("/categories");
      setCategoriesList(res.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh mục:", err);
      triggerToast("Không thể tải danh mục sản phẩm!");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchPendingProducts = async () => {
    try {
      setProductsApprovalLoading(true);
      const res = await api.get("/admin/products/pending");
      setPendingProducts(res.data.content || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách tin chờ duyệt:", err);
    } finally {
      setProductsApprovalLoading(false);
    }
  };

  const handleApproveProduct = async (id: number, name: string) => {
    try {
      await api.put(`/admin/products/${id}/approve`);
      triggerToast(`Đã duyệt sản phẩm "${name}"! ✅`);
      // Update available products list in home screen as well, so it updates without F5
      const prodRes = await productService.getAvailableProducts(0, 24);
      setAvailableProducts(prodRes.content || []);
      fetchPendingProducts();
    } catch (err) {
      console.error("Lỗi duyệt sản phẩm:", err);
      triggerToast("Không thể duyệt sản phẩm.");
    }
  };

  const handleRejectProduct = async (id: number, name: string) => {
    try {
      await api.put(`/admin/products/${id}/reject`);
      triggerToast(`Đã từ chối duyệt sản phẩm "${name}". ❌`);
      fetchPendingProducts();
    } catch (err) {
      console.error("Lỗi từ chối sản phẩm:", err);
      triggerToast("Không thể từ chối sản phẩm.");
    }
  };

  // Initial mount load for category tags AND real products
  useEffect(() => {
    fetchCategories();
    // Fetch real AVAILABLE products
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await productService.getAvailableProducts(0, 24);
        setAvailableProducts(res.content || []);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
      } finally {
        setProductsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Trigger loading when entering Admin Mode
  useEffect(() => {
    if (showAdminPanel) {
      // Always fetch pending count to keep tab badge updated
      fetchPendingProducts();

      if (adminTab === "users") {
        fetchUsers();
      } else if (adminTab === "categories") {
        fetchCategories();
      }
    }
  }, [showAdminPanel, adminTab]);

  // Toggle user active status
  const toggleUserStatus = async (id: number, currentStatus: string, email: string) => {
    if (email === currentAdmin?.email) {
      triggerToast("Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }
    const nextStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const confirmMsg = `Bạn có chắc chắn muốn chuyển trạng thái tài khoản này thành ${nextStatus === "ACTIVE" ? "HOẠT ĐỘNG" : "BỊ KHÓA"}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/admin/users/${id}/status`, { status: nextStatus });
      triggerToast("Cập nhật trạng thái tài khoản thành công!");
      fetchUsers();
    } catch (err: any) {
      console.error("Lỗi cập nhật trạng thái:", err);
      const errMsg = err.response?.data?.message || "Cập nhật trạng thái thất bại!";
      triggerToast(errMsg);
    }
  };

  // Create or Update Category
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) {
      triggerToast("Tên và Slug danh mục là bắt buộc!");
      return;
    }

    try {
      setCatSaving(true);
      if (editingCatId) {
        await api.put(`/categories/${editingCatId}`, { name: catName, slug: catSlug, description: catDesc });
        triggerToast("Cập nhật danh mục thành công!");
      } else {
        await api.post("/categories", { name: catName, slug: catSlug, description: catDesc });
        triggerToast("Tạo danh mục mới thành công!");
      }
      setCatName("");
      setCatSlug("");
      setCatDesc("");
      setEditingCatId(null);
      fetchCategories();
    } catch (err: any) {
      console.error("Lỗi lưu danh mục:", err);
      const errMsg = err.response?.data?.message || "Lưu danh mục thất bại!";
      triggerToast(errMsg);
    } finally {
      setCatSaving(false);
    }
  };

  // Edit Category
  const handleCategoryEdit = (item: any) => {
    setEditingCatId(item.id);
    setCatName(item.name);
    setCatSlug(item.slug);
    setCatDesc(item.description || "");
  };

  // Delete Category
  const handleCategoryDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await api.delete(`/categories/${id}`);
      triggerToast("Xóa danh mục thành công!");
      fetchCategories();
    } catch (err: any) {
      console.error("Lỗi xóa danh mục:", err);
      const errMsg = err.response?.data?.message || "Xóa danh mục thất bại!";
      triggerToast(errMsg);
    }
  };

  // Exit Admin Panel
  const closeAdminPanel = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-primary text-primary flex flex-col font-sans select-none overflow-x-hidden">
      {/* Header */}
      <Header />

      {/* Hero Layout */}
      <div className="w-full flex flex-col items-center">
        
        {/* Top horizontal thumbnails row — always light */}
        <div className="light-mode w-full overflow-hidden border-b border-zinc-200 py-4 bg-white">
          <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none w-max">
            {/* Set 1 */}
            {THUMBNAILS.map((url, i) => (
              <div
                key={`set1-${i}`}
                className="w-[120px] h-[75px] md:w-[155px] md:h-[95px] rounded-xl overflow-hidden shrink-0 shadow-sm transition-transform hover:scale-[1.02] bg-zinc-100"
              >
                <img
                  src={url}
                  alt={`Product thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {/* Set 2 (Seamless loop duplication) */}
            {THUMBNAILS.map((url, i) => (
              <div
                key={`set2-${i}`}
                className="w-[120px] h-[75px] md:w-[155px] md:h-[95px] rounded-xl overflow-hidden shrink-0 shadow-sm transition-transform hover:scale-[1.02] bg-zinc-100"
              >
                <img
                  src={url}
                  alt={`Product thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Glowing Hero Section — forced light-mode with pastel gradient */}
        <div className="light-mode w-full" style={{ background: "linear-gradient(135deg, #f5f0ff 0%, #eef4ff 40%, #f0f7ff 70%, #faf5ff 100%)" }}>
          <div className="max-w-[1280px] w-full mx-auto px-6 md:px-8 py-10 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 items-center">
          
            {/* Left Stats Grid */}
            <div className="flex md:flex-col justify-around md:justify-center md:items-start md:gap-10 border-b md:border-b-0 md:border-r border-zinc-200 pb-8 md:pb-0 md:pr-10 shrink-0">
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 leading-none">4K+</h3>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Món đồ</p>
              </div>
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 leading-none">1K+</h3>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Người thuê</p>
              </div>
              <div className="text-center md:text-left space-y-1">
                <h3 className="text-2xl md:text-3xl font-extrabold text-zinc-900 leading-none">30+</h3>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Khu vực</p>
              </div>
            </div>

            {/* Right/Center Hero Content — white glass card */}
            <div className="md:col-span-3 flex flex-col items-center justify-center text-center space-y-8 max-w-[840px] mx-auto w-full">
              
              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-[40px] md:text-[64px] font-extrabold tracking-tight leading-[1.08] text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-400">
                  RentHub
                </h1>
                <h2 className="text-[32px] md:text-[52px] font-extrabold tracking-tight leading-none text-sky-400">
                  Thuê Đồ Gần Bạn
                </h2>
                <p className="text-sm md:text-base font-semibold text-zinc-500 max-w-[520px] mx-auto">
                  Thuê đồ từ người xung quanh bạn. Nhanh chóng – tiện lợi – đúng lúc.
                </p>
              </div>

              {/* Detailed Search Panel — white glass, ghost search icon */}
              <div className="w-full bg-white/90 backdrop-blur-md border border-zinc-200/80 rounded-[28px] p-2.5 md:p-3 shadow-md flex flex-col sm:flex-row gap-0 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 items-stretch">
                <div className="flex-1 flex flex-col text-left px-4 py-2.5 justify-center">
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider">Ở đâu?</span>
                  <input
                    type="text"
                    placeholder="Hai Bà Trưng, HN"
                    className="text-sm font-semibold text-zinc-800 bg-transparent border-none outline-none placeholder-zinc-400 p-0 mt-0.5"
                  />
                </div>
                <div className="flex-1 flex flex-col text-left px-4 py-2.5 justify-center">
                  <span className="text-[10px] font-bold text-zinc-400 tracking-wider">Khi nào?</span>
                  <input
                    type="text"
                    placeholder="Không giới hạn"
                    className="text-sm font-semibold text-zinc-800 bg-transparent border-none outline-none placeholder-zinc-400 p-0 mt-0.5"
                  />
                </div>
                <div className="flex-1 flex items-center justify-between pl-4 pr-2 py-2.5 gap-2">
                  <div className="flex flex-col text-left w-full">
                    <span className="text-[10px] font-bold text-zinc-400 tracking-wider">Bạn cần gì?</span>
                    <input
                      type="text"
                      placeholder="Thử &quot;flycam&quot;"
                      className="text-sm font-semibold text-zinc-800 bg-transparent border-none outline-none placeholder-zinc-400 p-0 mt-0.5"
                    />
                  </div>
                  {/* Ghost search icon — no filled circle */}
                  <button className="p-2 text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded-full transition-all cursor-pointer shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Category horizontal scrolling chips */}
        {(() => {
          const activeHomeCategories = categoriesList.length > 0
            ? [
                { id: "all", name: "Tất cả", count: null, icon: "🔍", color: "bg-brand-50 text-brand-700" },
                ...categoriesList.map((c, i) => {
                  let icon = "⛺";
                  let color = "bg-green-50 text-green-700";
                  
                  const slug = c.slug.toLowerCase();
                  if (slug.includes("dien-tu") || slug.includes("electronic") || slug.includes("device")) {
                    icon = "📷";
                    color = "bg-purple-50 text-purple-700";
                  } else if (slug.includes("the-thao") || slug.includes("sport") || slug.includes("bike")) {
                    icon = "🚲";
                    color = "bg-orange-50 text-orange-700";
                  } else if (slug.includes("da-ngoai") || slug.includes("outdoor") || slug.includes("camp")) {
                    icon = "⛺";
                    color = "bg-green-50 text-green-700";
                  } else if (slug.includes("am-nhac") || slug.includes("music") || slug.includes("guitar")) {
                    icon = "🎸";
                    color = "bg-pink-50 text-pink-700";
                  } else if (slug.includes("phuong-tien") || slug.includes("vehicle") || slug.includes("car")) {
                    icon = "🚗";
                    color = "bg-blue-50 text-blue-700";
                  } else if (slug.includes("gia-dung") || slug.includes("appliance") || slug.includes("house")) {
                    icon = "🏠";
                    color = "bg-amber-50 text-amber-700";
                  } else {
                    const colors = [
                      "bg-purple-50 text-purple-700",
                      "bg-orange-50 text-orange-700",
                      "bg-green-50 text-green-700",
                      "bg-pink-50 text-pink-700",
                      "bg-blue-50 text-blue-700",
                      "bg-amber-50 text-amber-700"
                    ];
                    const icons = ["📷", "🚲", "⛺", "🎸", "🚗", "🏠"];
                    color = colors[i % colors.length];
                    icon = icons[i % icons.length];
                  }

                  return {
                    id: c.slug,
                    name: c.name,
                    count: 50 + (c.id * 17) % 250,
                    icon: icon,
                    color: color
                  };
                })
              ]
            : CATEGORIES;

          return (
            <div className="max-w-[1280px] w-full px-6 md:px-8 pb-10 flex gap-3 overflow-x-auto scrollbar-hide items-center justify-start md:justify-center">
              {activeHomeCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shrink-0 shadow-sm ${cat.color}`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  {cat.count !== null && (
                    <span className="opacity-60 text-[10px] font-medium">{cat.count}</span>
                  )}
                </button>
              ))}
            </div>
          );
        })()}

        {/* --- Section 1.5: Inline Admin Controls Panel --- */}
        {showAdminPanel && (
          <div className="max-w-[1280px] w-full px-6 md:px-8 py-10 border-y border-secondary bg-zinc-55/40 backdrop-blur-md space-y-8 relative">
            
            {/* Admin Header Title block */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-secondary pb-6">
              <div className="space-y-1.5 font-sans">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                  <span className="text-[9px] font-black text-red-700 uppercase tracking-widest bg-red-50 border border-red-100 px-2 py-0.5 rounded">Chế độ Admin</span>
                </div>
                <h2 className="text-2xl font-black text-primary">Hệ thống quản trị RentHub</h2>
                <p className="text-xs text-secondary font-medium">Bảng điều khiển và quản trị tích hợp trực tiếp trên trang chủ</p>
              </div>

              {/* Toggle tabs and close actions */}
              <div className="flex items-center gap-3 font-sans">
                <div className="flex bg-secondary p-1 rounded-xl border border-secondary">
                  <button
                    onClick={() => setAdminTab("users")}
                    className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      adminTab === "users" ? "bg-white text-zinc-900 shadow-sm" : "text-secondary hover:text-primary"
                    }`}
                  >
                    Thành viên
                  </button>
                  <button
                    onClick={() => setAdminTab("categories")}
                    className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      adminTab === "categories" ? "bg-white text-zinc-900 shadow-sm" : "text-secondary hover:text-primary"
                    }`}
                  >
                    Danh mục
                  </button>
                  <button
                    onClick={() => setAdminTab("products")}
                    className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer relative ${
                      adminTab === "products" ? "bg-white text-zinc-900 shadow-sm" : "text-secondary hover:text-primary"
                    }`}
                  >
                    Duyệt tin
                    {pendingProducts.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                        {pendingProducts.length}
                      </span>
                    )}
                  </button>
                </div>
                
                <button
                  onClick={closeAdminPanel}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer shadow-sm"
                >
                  Thoát Admin
                </button>
              </div>
            </div>

            {/* Tab 1: Member accounts list */}
            {adminTab === "users" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center font-sans">
                  <h3 className="text-sm font-bold text-primary">Quản lý người dùng ({users.length})</h3>
                  <button onClick={fetchUsers} className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer">
                    Làm mới danh sách
                  </button>
                </div>

                {usersLoading ? (
                  <div className="py-16 bg-white border border-secondary rounded-2xl flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-secondary font-medium">Đang tải danh sách thành viên...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-16 bg-white border border-secondary rounded-2xl flex items-center justify-center text-center">
                    <p className="text-xs text-secondary font-medium">Không tìm thấy thành viên nào.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-secondary rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-sans">
                        <thead>
                          <tr className="bg-secondary/40 border-b border-secondary">
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Họ và tên</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Số điện thoại</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Vai trò</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Trạng thái</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/60">
                          {users.map((item) => (
                            <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-5 py-3.5 font-bold text-xs text-primary">{item.fullName}</td>
                              <td className="px-5 py-3.5 text-xs text-secondary">{item.email}</td>
                              <td className="px-5 py-3.5 text-xs text-secondary">{item.phone || "Chưa cập nhật"}</td>
                              <td className="px-5 py-3.5 text-xs font-semibold text-secondary">
                                {item.role === "ROLE_ADMIN" ? "Admin" : "User"}
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    item.status === "ACTIVE"
                                      ? "bg-green-50 text-green-700"
                                      : item.status === "PENDING"
                                      ? "bg-orange-50 text-orange-700"
                                      : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {item.status === "ACTIVE"
                                    ? "Hoạt động"
                                    : item.status === "PENDING"
                                    ? "Chờ kích hoạt"
                                    : "Đã khóa"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  onClick={() => toggleUserStatus(item.id, item.status, item.email)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                                    item.status === "ACTIVE"
                                      ? "bg-red-50 hover:bg-red-100 text-error-primary"
                                      : "bg-green-50 hover:bg-green-100 text-green-700"
                                  }`}
                                >
                                  {item.status === "ACTIVE" ? "Khóa" : "Kích hoạt"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Category lists and creation form */}
            {adminTab === "categories" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Categories Table representation */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center font-sans">
                    <h3 className="text-sm font-bold text-primary">Danh sách danh mục ({categoriesList.length})</h3>
                    <button onClick={fetchCategories} className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer">
                      Làm mới danh sách
                    </button>
                  </div>

                  {categoriesLoading ? (
                    <div className="py-16 bg-white border border-secondary rounded-2xl flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs text-secondary font-medium">Đang tải danh mục...</p>
                    </div>
                  ) : categoriesList.length === 0 ? (
                    <div className="py-16 bg-white border border-secondary rounded-2xl flex items-center justify-center text-center">
                      <p className="text-xs text-secondary font-medium">Không tìm thấy danh mục nào.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-secondary rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-sans">
                          <thead>
                            <tr className="bg-secondary/40 border-b border-secondary">
                              <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Tên danh mục</th>
                              <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Slug</th>
                              <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Mô tả</th>
                              <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-secondary/60">
                            {categoriesList.map((item) => (
                              <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                                <td className="px-5 py-3.5 font-bold text-xs text-primary">{item.name}</td>
                                <td className="px-5 py-3.5 text-xs text-secondary font-mono">{item.slug}</td>
                                <td className="px-5 py-3.5 text-xs text-secondary truncate max-w-[150px]">{item.description || "Chưa có"}</td>
                                <td className="px-5 py-3.5 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => handleCategoryEdit(item)}
                                      className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                                      title="Sửa danh mục"
                                    >
                                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleCategoryDelete(item.id)}
                                      className="p-1.5 text-error-primary hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Xóa danh mục"
                                    >
                                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar category form */}
                <div className="space-y-4 font-sans">
                  <h3 className="text-sm font-bold text-primary">
                    {editingCatId ? "Cập nhật danh mục" : "Tạo danh mục mới"}
                  </h3>
                  <div className="bg-white p-5 rounded-2xl border border-secondary shadow-sm">
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Tên danh mục <span className="text-error-primary">*</span></label>
                        <input
                          type="text"
                          value={catName}
                          onChange={(e) => {
                            setCatName(e.target.value);
                            if (!editingCatId) {
                              setCatSlug(
                                e.target.value
                                  .toLowerCase()
                                  .normalize("NFD")
                                  .replace(/[\u0300-\u036f]/g, "")
                                  .replace(/[đĐ]/g, "d")
                                  .replace(/([^0-9a-z-\s])/g, "")
                                  .replace(/(\s+)/g, "-")
                              );
                            }
                          }}
                          placeholder="Ví dụ: Đồ gia dụng"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-primary text-xs font-semibold focus:outline-none focus:border-brand-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Slug đường dẫn <span className="text-error-primary">*</span></label>
                        <input
                          type="text"
                          value={catSlug}
                          onChange={(e) => setCatSlug(e.target.value)}
                          placeholder="Ví dụ: do-gia-dung"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-primary text-xs font-mono focus:outline-none focus:border-brand-500 transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-secondary uppercase tracking-wider">Mô tả</label>
                        <textarea
                          value={catDesc}
                          onChange={(e) => setCatDesc(e.target.value)}
                          placeholder="Mô tả danh mục này..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-secondary bg-primary text-xs font-semibold focus:outline-none focus:border-brand-500 transition-colors min-h-[70px]"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        {editingCatId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(null);
                              setCatName("");
                              setCatSlug("");
                              setCatDesc("");
                            }}
                            className="px-3.5 py-2 bg-secondary hover:bg-tertiary text-primary rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
                          >
                            Hủy
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={catSaving}
                          className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-extrabold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {catSaving ? "Đang lưu..." : editingCatId ? "Cập nhật" : "Tạo mới"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            )}

            {/* Tab 3: Pending Product Approvals */}
            {adminTab === "products" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center font-sans">
                  <h3 className="text-sm font-bold text-primary">Sản phẩm chờ duyệt ({pendingProducts.length})</h3>
                  <button onClick={fetchPendingProducts} className="text-xs font-bold text-brand-600 hover:text-brand-700 cursor-pointer">
                    Làm mới danh sách
                  </button>
                </div>

                {productsApprovalLoading ? (
                  <div className="py-16 bg-white border border-secondary rounded-2xl flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 border-3 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-secondary font-medium">Đang tải sản phẩm chờ duyệt...</p>
                  </div>
                ) : pendingProducts.length === 0 ? (
                  <div className="py-16 bg-white border border-secondary rounded-2xl flex items-center justify-center text-center">
                    <p className="text-xs text-secondary font-medium">Không có sản phẩm nào cần phê duyệt. 🎉</p>
                  </div>
                ) : (
                  <div className="bg-white border border-secondary rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse font-sans">
                        <thead>
                          <tr className="bg-secondary/40 border-b border-secondary">
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Hình ảnh</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Tên sản phẩm</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Giá thuê / ngày</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Danh mục</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider">Người đăng</th>
                            <th className="px-5 py-3.5 text-[10px] font-bold text-tertiary uppercase tracking-wider text-right">Phê duyệt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary/60">
                          {pendingProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-secondary/20 transition-colors">
                              <td className="px-5 py-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50">
                                  {prod.primaryImage ? (
                                    <img src={prod.primaryImage} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3 font-bold text-xs text-primary">
                                <Link href={`/products/${prod.id}`} className="hover:underline hover:text-brand-700">
                                  {prod.name}
                                </Link>
                              </td>
                              <td className="px-5 py-3 text-xs font-semibold text-violet-700">
                                {Number(prod.pricePerDay).toLocaleString("vi-VN")}đ
                              </td>
                              <td className="px-5 py-3 text-xs text-secondary font-mono">{prod.category?.name || prod.categoryName}</td>
                              <td className="px-5 py-3 text-xs text-secondary font-semibold">{prod.ownerName || "Người dùng"}</td>
                              <td className="px-5 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleApproveProduct(prod.id, prod.name)}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-extrabold shadow-sm transition-all cursor-pointer"
                                    title="Duyệt cho thuê"
                                  >
                                    Đồng ý
                                  </button>
                                  <button
                                    onClick={() => handleRejectProduct(prod.id, prod.name)}
                                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-extrabold shadow-sm transition-all cursor-pointer"
                                    title="Từ chối duyệt"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* --- Section 2: Special Occasions ("Dịp đặc biệt") --- */}
        <div className="max-w-[1280px] w-full px-6 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          
          {/* Left Description Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Dịp đặc biệt</span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 leading-tight">
                Mọi dịp,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-500">đều có đồ.</span>
              </h2>
            </div>
            <p className="text-sm font-semibold text-zinc-500 leading-relaxed max-w-[320px]">
              Cắm trại, chụp ảnh, tiệc tùng hay cuối tuần thư giãn — tìm ngay đồ thuê phù hợp.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800 hover:underline transition-all mt-2"
            >
              <span>Xem tất cả</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Right Bento Grid Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Column 1: Giant Card */}
            <div className="sm:col-span-2 relative h-[320px] rounded-3xl overflow-hidden group shadow-md transition-all hover:scale-[1.01] hover:shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80"
                alt="Camping Special"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-end p-6 text-white space-y-1">
                <span className="absolute top-6 left-6 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-bold tracking-wider uppercase">3 món</span>
                <h3 className="text-xl font-extrabold">Chuyến cắm trại</h3>
                <p className="text-[11px] font-semibold text-zinc-200">Mọi thứ bạn cần cho chuyến dã ngoại</p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                  <span>Khám phá</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Column 2: Tall Card */}
            <div className="relative h-[320px] rounded-3xl overflow-hidden group shadow-md transition-all hover:scale-[1.01] hover:shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80"
                alt="Photography Special"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 flex flex-col justify-end p-6 text-white space-y-1">
                <span className="absolute top-6 left-6 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[9px] font-bold tracking-wider uppercase">3 món</span>
                <h3 className="text-xl font-extrabold">Buổi chụp ảnh</h3>
                <p className="text-[11px] font-semibold text-zinc-200">Ghi lại mọi khoảnh khắc sắc nét</p>
                <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors">
                  <span>Khám phá</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Column 3: Row of 3 mini-bento cards */}
            <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Card 1 */}
              <div className="relative h-[160px] rounded-2xl overflow-hidden group shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80"
                  alt="Party Special"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-white space-y-0.5">
                  <span className="absolute top-4 left-4 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-bold tracking-wider uppercase">3 món</span>
                  <h4 className="text-sm font-extrabold">Tiệc tại nhà</h4>
                  <p className="text-[10px] font-semibold text-zinc-300">Âm thanh, ánh sáng và không khí sôi động</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="relative h-[160px] rounded-2xl overflow-hidden group shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop&q=80"
                  alt="Weekend Roadtrip"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-white space-y-0.5">
                  <span className="absolute top-4 left-4 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-bold tracking-wider uppercase">6 món</span>
                  <h4 className="text-sm font-extrabold">Du lịch cuối tuần</h4>
                  <p className="text-[10px] font-semibold text-zinc-300">Lên đường với đồ nghề phù hợp</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="relative h-[160px] rounded-2xl overflow-hidden group shadow-sm transition-all hover:scale-[1.01] hover:shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&auto=format&fit=crop&q=80"
                  alt="Relax Weekend"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-white space-y-0.5">
                  <span className="absolute top-4 left-4 px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[8px] font-bold tracking-wider uppercase">6 món</span>
                  <h4 className="text-sm font-extrabold">Cuối tuần thư giãn</h4>
                  <p className="text-[10px] font-semibold text-zinc-300">Nghỉ ngơi, nạp đầy năng lượng, tận hưởng</p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* --- Section 3: Sports and Outdoor Categorized Lists --- */}
        <div className="max-w-[1280px] w-full px-6 md:px-8 py-10 space-y-12">
          
          {/* Sports Category Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-teal-800 font-extrabold text-lg">
                <span>🚲</span>
                <span>Thể thao</span>
              </div>
              <Link href="/" className="text-teal-700 hover:text-teal-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                      <div className="h-[200px] bg-zinc-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-zinc-200 rounded w-3/4" />
                        <div className="h-3 bg-zinc-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                : availableProducts.slice(0, 4).map((prod) => (
                    <ProductCard key={prod.id} prod={prod} />
                  ))}
            </div>
          </div>

          {/* Outdoor Category Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-green-800 font-extrabold text-lg">
                <span>⛺</span>
                <span>Dã ngoại</span>
              </div>
              <Link href="/" className="text-green-700 hover:text-green-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {productsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                      <div className="h-[200px] bg-zinc-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-zinc-200 rounded w-3/4" />
                        <div className="h-3 bg-zinc-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                : availableProducts.slice(4, 8).map((prod) => (
                    <ProductCard key={prod.id} prod={prod} />
                  ))}
            </div>
          </div>

        </div>

        {/* --- Section 4: "Có thể bạn cần" --- */}
        <div className="max-w-[1280px] w-full px-6 md:px-8 py-16 space-y-8 bg-radial-[at_50%_0%] from-purple-50/30 to-transparent">
          
          <div className="space-y-2 relative max-w-[400px]">
            <span className="text-[120px] font-black text-zinc-100/60 uppercase tracking-tighter absolute -top-24 left-0 leading-none select-none -z-10">riêng bạn</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 leading-tight">Có thể bạn cần</h2>
            <p className="text-sm font-semibold text-zinc-500">Chọn lọc riêng cho bạn – đúng gu, đúng chỗ</p>
          </div>

          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-purple-800 font-extrabold text-lg">
                <span>📷</span>
                <span>Điện tử</span>
              </div>
              <Link href="/" className="text-purple-700 hover:text-purple-900 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
              {productsLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                      <div className="h-[170px] bg-zinc-200" />
                      <div className="p-3.5 space-y-2">
                        <div className="h-3 bg-zinc-200 rounded w-3/4" />
                      </div>
                    </div>
                  ))
                : availableProducts.slice(8, 13).map((prod) => (
                    <ProductCard key={prod.id} prod={prod} />
                  ))}
            </div>
          </div>

        </div>

        {/* --- Section 5: "Xu hướng" (Horizontal Carousel) --- */}
        <div className="max-w-[1280px] w-full px-6 md:px-8 py-16 flex flex-col md:flex-row items-stretch gap-6 relative">
          
          {/* Vertical rotated text label on the left */}
          <div className="hidden md:flex items-center justify-center select-none shrink-0 w-[60px] border-r border-zinc-200/80 mr-2">
            <h2 className="text-3xl font-extrabold tracking-widest text-brand-700 uppercase whitespace-nowrap -rotate-90 origin-center py-6">
              XU HƯỚNG
            </h2>
          </div>

          <div className="flex-1 space-y-6 overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-zinc-900 md:hidden">Xu hướng</h2>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-zinc-700 hover:text-brand-700 transition-colors"
              >
                <span>Khám phá thêm</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* Horizontal Carousel Scrolling Container */}
            <div className="flex gap-5 overflow-x-auto scrollbar-hide py-2 px-1 justify-start">
              {productsLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-[190px] shrink-0 bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                      <div className="h-[145px] bg-zinc-200" />
                      <div className="p-3"><div className="h-3 bg-zinc-200 rounded w-2/3" /></div>
                    </div>
                  ))
                : availableProducts.map((prod) => (
                    <ProductCardCompact key={prod.id} prod={prod} />
                  ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
