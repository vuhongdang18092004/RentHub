"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { userService, PublicOwnerResponse } from "@/services/user-service";
import { useToast } from "@/context/ToastContext";

export default function PublicProfilePage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const router = useRouter();
  const { triggerToast } = useToast();
  
  const [profile, setProfile] = useState<PublicOwnerResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.getPublicProfile(Number(id));
        setProfile(data);
      } catch (err) {
        console.error("Lỗi lấy hồ sơ công khai:", err);
        triggerToast("Không tìm thấy thành viên!");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, router, triggerToast]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-primary">
      <Header />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center">
        {loading ? (
          <div className="py-24 bg-white border border-zinc-200 rounded-3xl w-full max-w-md flex flex-col items-center justify-center gap-4 shadow-sm">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-zinc-500 font-semibold">Đang tải hồ sơ...</p>
          </div>
        ) : profile ? (
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 flex flex-col items-center text-center space-y-6 w-full max-w-md">
            
            {/* Back button */}
            <div className="w-full flex justify-start -mt-2 -ml-2">
              <button 
                onClick={() => router.back()}
                className="text-zinc-450 hover:text-zinc-700 flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
              </button>
            </div>

            {/* Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-violet-50 bg-zinc-50 shadow-md flex items-center justify-center shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-violet-700 bg-violet-50">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* User Name & Badges */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-xl font-extrabold text-zinc-800">{profile.fullName}</h2>
                <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-black border border-green-200/50 flex items-center gap-0.5 select-none">
                  ✓ Đã xác minh
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-bold">
                Thành viên uy tín của RentHub
              </p>
            </div>

            {/* Verified Owner Stats */}
            <div className="w-full border-t border-zinc-100 pt-5 flex justify-around text-center select-none">
              <div>
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider block">ĐÁNH GIÁ</span>
                <span className="text-sm font-black text-zinc-800">★ 4.9 / 5</span>
              </div>
              <div className="border-l border-zinc-100 h-8 self-center" />
              <div>
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider block">GIAO DỊCH</span>
                <span className="text-sm font-black text-zinc-800">512+ lần</span>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
