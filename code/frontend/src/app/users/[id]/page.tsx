"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { userService, PublicOwnerResponse } from "@/services/user-service";
import { useToast } from "@/context/ToastContext";
import { ArrowLeft, Loader2, User as UserIcon, CheckCircle2, Star, Activity } from "lucide-react";

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
    <div className="min-h-screen bg-secondary flex flex-col font-sans text-primary">
      <Header />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center">
        {loading ? (
          <div className="py-24 bg-primary border border-secondary rounded-3xl w-full max-w-md flex flex-col items-center justify-center gap-4 shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
            <p className="text-sm text-secondary font-semibold">Đang tải hồ sơ...</p>
          </div>
        ) : profile ? (
          <div className="bg-primary rounded-3xl border border-secondary shadow-sm p-8 flex flex-col items-center text-center space-y-6 w-full max-w-md relative">
            
            {/* Back button */}
            <div className="w-full flex justify-start absolute top-6 left-6">
              <button 
                onClick={() => router.back()}
                className="text-secondary hover:text-primary flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
            </div>

            {/* Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary bg-secondary shadow-lg flex items-center justify-center shrink-0 mt-8 relative group">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                  <UserIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            
            {/* User Name & Badges */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-bold text-primary">{profile.fullName}</h2>
                <div className="flex items-center justify-center bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 p-1 rounded-full border border-emerald-200 dark:border-emerald-900" title="Đã xác minh">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-sm text-secondary font-medium">
                Thành viên uy tín của RentHub
              </p>
            </div>

            {/* Verified Owner Stats */}
            <div className="w-full border-t border-secondary pt-6 flex justify-around text-center select-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold uppercase tracking-wide">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Đánh giá
                </div>
                <span className="text-lg font-bold text-primary">4.9 / 5</span>
              </div>
              
              <div className="border-l border-secondary h-12 self-center" />
              
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold uppercase tracking-wide">
                  <Activity className="w-4 h-4 text-brand-600" />
                  Giao dịch
                </div>
                <span className="text-lg font-bold text-primary">512+ lần</span>
              </div>
            </div>

          </div>
        ) : null}
      </main>
    </div>
  );
}
