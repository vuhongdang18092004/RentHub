import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 px-4 text-center">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[32px] shadow-sm border border-zinc-100">
        {/* Logo hệ thống */}
        <div className="inline-flex items-center gap-2 font-bold text-3xl text-[#3F1B6B]">
          <span className="p-2 bg-[#3F1B6B] text-white rounded-xl text-sm tracking-wider">SO</span> RentHub
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Chào mừng đến với RentHub
          </h1>
          <p className="text-zinc-500 text-sm">
            Nền tảng kết nối thuê và cho thuê đồ dùng tối ưu, nhanh chóng và an toàn.
          </p>
        </div>

        {/* Cụm nút bấm điều hướng người dùng */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/login"
            className="flex-1 py-3 bg-[#3F1B6B] hover:bg-[#2D134D] text-white font-semibold rounded-xl text-sm transition-colors shadow-sm text-center"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="flex-1 py-3 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold rounded-xl text-sm transition-colors text-center"
          >
            Đăng ký tài khoản
          </Link>
        </div>
      </div>
    </div>
  );
}