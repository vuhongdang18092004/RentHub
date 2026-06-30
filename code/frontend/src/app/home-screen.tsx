"use client";

import Link from "next/link";
import { Button } from "@/components/base/buttons/button";

// TODO: HomeScreen component containing main screen layout with quick access to Auth pages

export interface HomeScreenProps {}

export function HomeScreen(props: HomeScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 gap-6 bg-secondary font-sans">
      <div className="text-center space-y-2">
        <h1 className="text-display-md font-bold text-primary">
          RentHub Application
        </h1>
        <p className="text-md text-secondary">
          Hệ thống chia sẻ và cho thuê đồ dùng thông minh
        </p>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-4 mt-4">
        <Button href="/login" size="lg" color="primary">
          Đăng nhập
        </Button>
        <Button href="/register" size="lg" color="secondary">
          Đăng ký tài khoản
        </Button>
      </div>
    </div>
  );
}
