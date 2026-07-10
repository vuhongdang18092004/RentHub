"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useToast } from "@/context/ToastContext";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  endpoint: string;
  filename: string;
  label?: string;
}

export function ExportButton({ endpoint, filename, label = "Xuất dữ liệu" }: ExportButtonProps) {
  const { triggerToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint, { responseType: 'blob' });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      triggerToast("Xuất dữ liệu thành công!");
    } catch (error) {
      console.error("Export error", error);
      triggerToast("Xuất dữ liệu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary border border-secondary rounded-lg text-sm font-medium text-secondary hover:bg-tertiary disabled:opacity-50 transition-all duration-200 cursor-pointer"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {label}
    </button>
  );
}
