"use client";

import { useState } from "react";
import { CategoryResponse } from "@/types/backend";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Slider } from "@/components/base/slider/slider";
import { ChevronDown } from "lucide-react";

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
  onClearAll?: () => void;
}

export function FilterSidebar({ categories, filters, onChange, onClearAll }: FilterSidebarProps) {
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

  const presetPrices = [500000, 2000000, 5000000, 10000000, 20000000, 50000000];

  const handleClearFilters = () => {
    onChange({
      categoryIds: [],
      priceRange: [0, 50000000],
      minRating: undefined,
      sort: "newest",
    });
    if (onClearAll) {
      onClearAll();
    }
  };

  return (
    <div className="w-[280px] bg-primary border border-secondary rounded-2xl p-6 shadow-sm space-y-6 select-none shrink-0 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
      
      {/* Categories Section */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between font-bold text-sm text-primary uppercase tracking-wide cursor-pointer hover:text-brand-600 transition-colors"
        >
          <span>Danh mục</span>
          <ChevronDown
            className={`w-4 h-4 text-tertiary transition-transform duration-300 ${collapsed.categories ? "rotate-180" : ""}`}
          />
        </button>

        {!collapsed.categories && (
          <div className="space-y-3 pt-2">
            {/* All categories option */}
            <Checkbox
              isSelected={filters.categoryIds.length === 0}
              onChange={handleAllCategoriesChange}
            >
              Tất cả danh mục
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

      <hr className="border-secondary" />

      {/* Price Range Section */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between font-bold text-sm text-primary uppercase tracking-wide cursor-pointer hover:text-brand-600 transition-colors"
        >
          <span>Mức giá</span>
          <ChevronDown
            className={`w-4 h-4 text-tertiary transition-transform duration-300 ${collapsed.price ? "rotate-180" : ""}`}
          />
        </button>

        {!collapsed.price && (
          <div className="space-y-5 pt-2">
            {/* Price values readout */}
            <div className="flex justify-between items-center text-sm font-bold text-primary bg-secondary/50 rounded-xl px-4 py-2.5">
              <span>{formatPrice(filters.priceRange[0])}đ</span>
              <span className="text-tertiary font-medium px-2">—</span>
              <span>{formatPrice(filters.priceRange[1])}đ</span>
            </div>

            {/* Slider */}
            <Slider
              value={filters.priceRange}
              onChange={(val) => onChange({ ...filters, priceRange: val as [number, number] })}
              min={0}
              max={50000000}
              step={50000}
            />

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {presetPrices.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onChange({ ...filters, priceRange: [filters.priceRange[0], preset] })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    filters.priceRange[1] === preset
                      ? "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-950/30 dark:border-brand-900 dark:text-brand-400"
                      : "bg-primary border-secondary text-secondary hover:border-brand-200 hover:text-brand-600"
                  }`}
                >
                  {formatPrice(preset)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <hr className="border-secondary" />

      {/* Ratings Section */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("rating")}
          className="w-full flex items-center justify-between font-bold text-sm text-primary uppercase tracking-wide cursor-pointer hover:text-brand-600 transition-colors"
        >
          <span>Đánh giá</span>
          <ChevronDown
            className={`w-4 h-4 text-tertiary transition-transform duration-300 ${collapsed.rating ? "rotate-180" : ""}`}
          />
        </button>

        {!collapsed.rating && (
          <div className="space-y-3 pt-2">
            {[
              { label: "Tùy ý", value: undefined },
              { label: "Từ 3 sao", value: 3 },
              { label: "Từ 4 sao", value: 4 },
              { label: "Từ 4.5 sao", value: 4.5 },
            ].map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 text-sm font-medium text-secondary cursor-pointer select-none hover:text-primary transition-colors group"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.minRating === opt.value}
                    onChange={() => onChange({ ...filters, minRating: opt.value })}
                    className="peer appearance-none w-4 h-4 border border-secondary rounded-full checked:border-brand-600 transition-colors cursor-pointer"
                  />
                  <div className="w-2 h-2 rounded-full bg-brand-600 absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={handleClearFilters}
        className="w-full py-3 bg-secondary hover:bg-tertiary text-primary rounded-xl text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-[0.98] mt-4"
      >
        Xóa tất cả bộ lọc
      </button>

    </div>
  );
}
