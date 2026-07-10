"use client";

import React, { useState, useEffect } from "react";
import { LocationMapPreview } from "@/components/location/location-map-preview";
import { useToast } from "@/context/ToastContext";
import { X, Search, LocateFixed, MapPin } from "lucide-react";

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (lat: number, lng: number, radius: number, address: string) => void;
  onClear?: () => void;
  initialLat?: number | null;
  initialLng?: number | null;
  initialRadius?: number | null;
  initialAddress?: string;
}

export default function LocationSelectorModal({
  isOpen,
  onClose,
  onApply,
  onClear,
  initialLat,
  initialLng,
  initialRadius,
  initialAddress,
}: LocationSelectorModalProps) {
  const { triggerToast } = useToast();

  const [modalSearchQuery, setModalSearchQuery] = useState(initialAddress || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [modalCoords, setModalCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat || 20.9625,
    lng: initialLng || 105.7486,
  });
  const [modalAddress, setModalAddress] = useState(initialAddress || "Hà Nội");
  const [modalRadius, setModalRadius] = useState(initialRadius || 10);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalSearchQuery(initialAddress || "");
      setModalAddress(initialAddress || "Hà Nội");
      setModalRadius(initialRadius || 10);
      setModalCoords({
        lat: initialLat || 20.9625,
        lng: initialLng || 105.7486,
      });
    }
  }, [isOpen, initialAddress, initialLat, initialLng, initialRadius]);

  if (!isOpen) return null;

  // Query VietMap Autocomplete API
  const handleQueryChange = async (val: string) => {
    setModalSearchQuery(val);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      setSuggestionsLoading(true);
      const url = `/api/vietmap?action=autocomplete&text=${encodeURIComponent(val)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.data)) list = data.data;
        else if (data && Array.isArray(data.results)) list = data.results;
        setSuggestions(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Select a location suggestion
  const handleSelectSuggestion = async (sugg: any) => {
    const addressName = sugg.name || sugg.description || sugg.display_name || "";
    setModalAddress(addressName);
    setModalSearchQuery(addressName);
    setSuggestions([]);
    
    // Fetch place details for coordinates
    const refId = sugg.refid || sugg.ref_id || sugg.place_id || "";
    if (refId) {
      try {
        const url = `/api/vietmap?action=place&refid=${encodeURIComponent(refId)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.lat !== undefined && data.lng !== undefined) {
            setModalCoords({ lat: data.lat, lng: data.lng });
          }
        }
      } catch (err) {
        console.error(err);
      }
    } else if (sugg.lat && sugg.lng) {
      setModalCoords({ lat: sugg.lat, lng: sugg.lng });
    }
  };

  const handleGPSLocate = () => {
    if (navigator.geolocation) {
      triggerToast("Đang định vị vị trí của bạn...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setModalCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setModalAddress("Vị trí hiện tại của bạn");
          setModalSearchQuery("Vị trí hiện tại của bạn");
          triggerToast("Đã lấy vị trí thành công!");
        },
        (err) => {
          console.error("Lỗi lấy vị trí:", err);
          triggerToast("Không thể lấy vị trí. Vui lòng cấp quyền trong trình duyệt.");
        }
      );
    } else {
      triggerToast("Trình duyệt không hỗ trợ định vị.");
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-primary rounded-3xl w-full max-w-[480px] overflow-hidden shadow-2xl border border-secondary flex flex-col font-sans relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-primary">Tìm đồ gần bạn</h3>
          <button 
            onClick={onClose}
            className="p-2 text-secondary hover:text-primary hover:bg-secondary rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="px-6 pb-6 space-y-5 flex-1 flex flex-col overflow-y-auto max-h-[85vh] custom-scrollbar">
          {/* Input block */}
          <div className="relative z-50">
            <div className="flex items-center gap-2 border border-secondary focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 rounded-xl px-4 py-3 bg-primary transition-all">
              <Search className="w-4 h-4 text-tertiary shrink-0" />
              <input
                type="text"
                placeholder="Nhập địa chỉ..."
                value={modalSearchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm font-semibold text-primary placeholder-tertiary p-0"
              />
              <button 
                onClick={handleGPSLocate}
                title="Định vị hiện tại"
                className="p-1.5 text-secondary hover:text-brand-600 bg-secondary hover:bg-brand-50 dark:hover:bg-brand-950/30 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <LocateFixed className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-primary border border-secondary rounded-xl shadow-xl overflow-hidden max-h-[250px] overflow-y-auto custom-scrollbar">
                {suggestions.map((sugg, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(sugg)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary text-sm font-medium text-primary transition-colors border-b border-secondary last:border-b-0 flex items-start gap-3 cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                    <span>{sugg.name || sugg.description || sugg.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Preview */}
          <div className="w-full h-[220px] rounded-2xl overflow-hidden relative z-0 border border-secondary shadow-sm">
            <LocationMapPreview latitude={modalCoords.lat} longitude={modalCoords.lng} radius={modalRadius} />
          </div>

          {/* Selected Location Indicator */}
          <div className="flex items-center gap-3 text-sm font-semibold text-primary bg-secondary/50 p-4 rounded-xl border border-secondary">
            <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-brand-600" />
            </div>
            <span className="truncate flex-1">{modalAddress}</span>
          </div>

          {/* Radius select */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-secondary uppercase tracking-wide text-xs">Bán kính tìm kiếm</span>
              <span className="text-brand-600 font-bold bg-brand-50 dark:bg-brand-950/30 px-2 py-0.5 rounded-lg">{modalRadius} km</span>
            </div>
            <input 
              type="range"
              min="1"
              max="50"
              value={modalRadius}
              onChange={(e) => setModalRadius(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-secondary bg-primary">
          <button 
            onClick={handleClear}
            className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Bỏ chọn vị trí
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 bg-secondary hover:bg-tertiary text-primary text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Huỷ
            </button>
            <button 
              onClick={() => onApply(modalCoords.lat, modalCoords.lng, modalRadius, modalAddress)}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
