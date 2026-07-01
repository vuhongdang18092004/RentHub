"use client";

import { useState, useEffect, useRef } from "react";

interface LocationAutocompleteProps {
  onLocationSelect: (location: {
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
  defaultValue?: string;
  placeholder?: string;
  isRequired?: boolean;
}

export function LocationAutocomplete({
  onLocationSelect,
  defaultValue = "",
  placeholder = "Nhập địa điểm bàn giao đồ...",
  isRequired = false,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize defaultValue
  useEffect(() => {
    if (defaultValue) {
      setQuery(defaultValue);
    }
  }, [defaultValue]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions from VietMap Autocomplete API
  const fetchSuggestions = async (searchText: string) => {
    const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY || "7a45350d010dc9414c4a0149d8eb129b6adb5601c6eb6c4e";

    try {
      setLoading(true);
      setError(null);

      const url = `https://maps.vietmap.vn/api/autocomplete/v3?apikey=${apiKey}&text=${encodeURIComponent(searchText)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Lỗi gọi VietMap Autocomplete API");
      }

      const data = await response.json();
      
      // Parse suggestions defensively
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data && Array.isArray(data.results)) {
        list = data.results;
      }

      setSuggestions(list);
      setIsOpen(list.length > 0);
      setActiveIndex(-1);
    } catch (err: any) {
      console.error("Lỗi VietMap Autocomplete:", err);
      setError("Không thể tải dữ liệu vị trí");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  // Fetch coordinates using VietMap Place API
  const handleSelectSuggestion = async (suggestion: any) => {
    const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY || "7a45350d010dc9414c4a0149d8eb129b6adb5601c6eb6c4e";
    const refId = suggestion.ref_id || suggestion.refid;

    if (!refId) {
      // If no ref_id, fall back to basic address with default coordinates (Hanoi center)
      setQuery(suggestion.address || suggestion.name);
      setIsOpen(false);
      onLocationSelect({
        address: suggestion.address || suggestion.name,
        latitude: 21.0285,
        longitude: 105.8542,
      });
      return;
    }

    try {
      setLoading(true);
      setQuery(suggestion.address || suggestion.name);
      setIsOpen(false);

      const url = `https://maps.vietmap.vn/api/place/v3?apikey=${apiKey}&refid=${refId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Lỗi gọi VietMap Place API");
      }

      const placeDetail = await response.json();
      
      const lat = placeDetail.lat || placeDetail.latitude || (placeDetail.geometry?.coordinates?.[1]);
      const lng = placeDetail.lng || placeDetail.longitude || (placeDetail.geometry?.coordinates?.[0]);

      if (lat && lng) {
        onLocationSelect({
          address: suggestion.address || suggestion.name,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        });
      } else {
        throw new Error("Không lấy được tọa độ chi tiết");
      }
    } catch (err: any) {
      console.error("Lỗi lấy tọa độ VietMap:", err);
      // Fallback
      onLocationSelect({
        address: suggestion.address || suggestion.name,
        latitude: 21.0285,
        longitude: 105.8542,
      });
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full font-sans">
      <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
        Địa điểm bàn giao đồ {isRequired && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-2xl border border-zinc-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm pl-10"
        />
        
        {/* Search Icon */}
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-base">
          📍
        </span>

        {/* Loading Spinner */}
        {loading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
            <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          </span>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-150 rounded-2xl shadow-xl overflow-hidden max-h-[280px] overflow-y-auto">
          {suggestions.map((item, index) => (
            <div
              key={item.ref_id || item.refid || index}
              onClick={() => handleSelectSuggestion(item)}
              className={`px-4 py-3 cursor-pointer text-xs transition-all border-b border-zinc-50 last:border-b-0 flex flex-col gap-0.5 ${
                index === activeIndex ? "bg-violet-50/70 text-violet-900" : "hover:bg-zinc-50 text-zinc-700"
              }`}
            >
              <span className="font-bold text-zinc-900 line-clamp-1">{item.name}</span>
              <span className="text-zinc-500 text-[10px] line-clamp-1">{item.address || item.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* States messages */}
      {!loading && isOpen && suggestions.length === 0 && query.trim() !== "" && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-150 rounded-2xl shadow-md p-4 text-center text-xs text-zinc-400 font-semibold">
          Không tìm thấy địa điểm phù hợp
        </div>
      )}

      {error && (
        <div className="mt-1 text-xs text-red-500 font-semibold">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
