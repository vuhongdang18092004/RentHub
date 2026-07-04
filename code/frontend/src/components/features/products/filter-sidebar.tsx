"use client";

import { useState } from "react";
import { CategoryResponse } from "@/types/backend";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Slider } from "@/components/base/slider/slider";

export interface ProductFilters {
  categoryIds: number[];
  priceRange: [number, number]; // [min, max]
  minRating?: number;
  sort: "newest" | "price_asc" | "price_desc" | "relevant";
}

interface FilterSidebarProps {
  categories: CategoryResponse[];
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

export function FilterSidebar({ categories, filters, onChange }: FilterSidebarProps) {
  // Accordion open/collapse states
  const [collapsed, setCollapsed] = useState({
    categories: false,
    price: false,
    rating: false,
  });

  const toggleSection = (section: "categories" | "price" | "rating") => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (catId: number, isSelected: boolean) => {
    let newCatIds = [...filters.categoryIds];
    if (isSelected) {
      newCatIds.push(catId);
    } else {
      newCatIds = newCatIds.filter((id) => id !== catId);
    }
    onChange({ ...filters, categoryIds: newCatIds });
  };

  const handleAllCategoriesChange = (isSelected: boolean) => {
    if (isSelected) {
      onChange({ ...filters, categoryIds: [] });
    }
  };

  const formatPrice = (val: number) => {
    if (val >= 1000000) return `${val / 1000000}M`;
    if (val >= 1000) return `${val / 1000}K`;
    return `${val}`;
  };

  const presetPrices = [200000, 500000, 1000000, 2000000, 5000000];

  const handleClearFilters = () => {
    onChange({
      categoryIds: [],
      priceRange: [0, 5000000],
      minRating: undefined,
      sort: "newest",
    });
  };

  return (
    <div className="w-[280px] bg-white border border-zinc-150 rounded-3xl p-5 shadow-sm space-y-6 select-none shrink-0 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
      
      {/* Categories Section */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between font-black text-xs text-zinc-800 uppercase tracking-wider cursor-pointer"
        >
          <span>Phân loại</span>
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${collapsed.categories ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {!collapsed.categories && (
          <div className="space-y-2.5 pt-1.5 transition-all">
            {/* All categories option */}
            <Checkbox
              isSelected={filters.categoryIds.length === 0}
              onChange={handleAllCategoriesChange}
            >
              Tất cả các loại
            </Checkbox>

            {/* Individual categories */}
            {categories.map((cat) => (
              <Checkbox
                key={cat.id}
                isSelected={filters.categoryIds.includes(cat.id)}
                onChange={(selected) => handleCategoryChange(cat.id, selected)}
              >
                {cat.name}
              </Checkbox>
            ))}
          </div>
        )}
      </div>

      <hr className="border-zinc-100" />

      {/* Price Range Section */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between font-black text-xs text-zinc-800 uppercase tracking-wider cursor-pointer"
        >
          <span>Giá mỗi ngày</span>
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${collapsed.price ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {!collapsed.price && (
          <div className="space-y-4 pt-1 transition-all">
            {/* Price values readout */}
            <div className="flex justify-between items-center text-xs font-extrabold text-zinc-600 bg-zinc-50/50 border border-zinc-150 rounded-xl px-3 py-2">
              <span>{formatPrice(filters.priceRange[0])}đ</span>
              <span className="text-zinc-300 font-normal">—</span>
              <span>{formatPrice(filters.priceRange[1])}đ</span>
            </div>

            {/* Slider */}
            <Slider
              value={filters.priceRange}
              onChange={(val) => onChange({ ...filters, priceRange: val as [number, number] })}
              min={0}
              max={5000000}
              step={5000}
            />

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presetPrices.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onChange({ ...filters, priceRange: [filters.priceRange[0], preset] })}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                    filters.priceRange[1] === preset
                      ? "bg-violet-50 border-violet-200 text-violet-700 font-extrabold"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-350"
                  }`}
                >
                  {formatPrice(preset)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <hr className="border-zinc-100" />

      {/* Ratings Section */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("rating")}
          className="w-full flex items-center justify-between font-black text-xs text-zinc-800 uppercase tracking-wider cursor-pointer"
        >
          <span>Đánh giá</span>
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${collapsed.rating ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {!collapsed.rating && (
          <div className="space-y-2.5 pt-1.5 transition-all">
            {[
              { label: "Tùy ý", value: undefined },
              { label: "3+ ★", value: 3 },
              { label: "4+ ★", value: 4 },
              { label: "4.5+ ★", value: 4.5 },
            ].map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === opt.value}
                  onChange={() => onChange({ ...filters, minRating: opt.value })}
                  className="w-4 h-4 text-violet-600 border-zinc-300 focus:ring-violet-500 cursor-pointer accent-violet-600"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={handleClearFilters}
        className="w-full py-2.5 bg-zinc-50 hover:bg-zinc-100/80 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
      >
        Xóa bộ lọc
      </button>

    </div>
  );
}
