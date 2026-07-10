"use client";

import { useEffect, useState } from "react";
import { ReviewResponse } from "@/types/backend";
import { reviewService } from "@/services/review-service";

interface ProductReviewsProps {
  productId: number;
  reviewCount: number;
  averageRating: number;
}

export function ProductReviews({ productId, reviewCount, averageRating }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetchReviews();
  }, [productId, page, sort]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewService.getProductReviews(productId, page, 5, sort);
      setReviews(res.content);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  if (reviewCount === 0) {
    return (
      <div className="space-y-6 pb-6 border-b border-zinc-100">
        <h3 className="font-extrabold text-sm text-zinc-800 uppercase tracking-wider">Đánh giá từ người dùng (0)</h3>
        <p className="text-zinc-500 text-sm">Sản phẩm này chưa có đánh giá nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 border-b border-zinc-100">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-zinc-800 uppercase tracking-wider">
          Đánh giá từ người dùng ({reviewCount})
        </h3>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(0);
          }}
          className="text-xs border-none bg-zinc-50 font-bold text-zinc-600 rounded-lg px-2 py-1 outline-none cursor-pointer"
        >
          <option value="newest">Mới nhất</option>
          <option value="highest">Cao nhất</option>
          <option value="lowest">Thấp nhất</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-4xl font-black text-zinc-800 leading-none">{averageRating.toFixed(1)}</div>
        <div className="flex flex-col">
          <div className="flex gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-sm">{i < Math.round(averageRating) ? "★" : "☆"}</span>
            ))}
          </div>
          <div className="text-[10px] text-zinc-400 font-bold">Điểm trung bình</div>
        </div>
      </div>

      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 bg-zinc-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-4 bg-zinc-50/50 border border-zinc-100 rounded-2xl space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0 border border-zinc-300">
                    <span className="text-zinc-600 font-bold text-xs">
                      {rev.reviewer.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-black text-zinc-700 block">{rev.reviewer.fullName}</span>
                    <span className="text-[9px] text-zinc-400 font-bold block mt-0.5">
                      {new Date(rev.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i}>{i < rev.rating ? "★" : "☆"}</span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">{rev.comment}</p>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-50"
          >
            Trước
          </button>
          <span className="text-xs font-bold text-zinc-600 flex items-center">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
