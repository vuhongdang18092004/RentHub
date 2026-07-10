"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notificationService, NotificationResponse } from "@/services/notification-service";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Bell, Check, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNotifications = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications(pageNumber, 10);
      setNotifications(res.content);
      setTotalPages(res.totalPages);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
      try {
        await notificationService.deleteNotification(id);
        fetchNotifications(page);
      } catch (error) {
        console.error("Failed to delete notification", error);
        alert("Xóa thông báo thất bại");
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Thông báo</h1>
            <p className="text-sm text-secondary mt-1">Cập nhật thông tin mới nhất về tài khoản của bạn</p>
          </div>
          
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 text-sm font-medium text-brand-600 bg-brand-50 dark:bg-brand-950/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <Check className="w-4 h-4" />
            Đánh dấu đã đọc tất cả
          </button>
        </div>

        <div className="bg-primary border border-secondary rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
              <p className="text-sm text-secondary">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-tertiary">
                <Bell className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-primary">Không có thông báo nào</h3>
              <p className="text-sm text-secondary mt-1 max-w-sm">Bạn chưa nhận được thông báo nào. Khi có thông báo mới, chúng sẽ hiển thị tại đây.</p>
            </div>
          ) : (
            <div className="divide-y divide-secondary">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-4 p-5 sm:p-6 cursor-pointer hover:bg-tertiary transition-colors ${
                    !notification.isRead ? "bg-brand-50/30 dark:bg-brand-950/10" : ""
                  }`}
                >
                  <div className={`mt-2 w-2.5 h-2.5 rounded-full shrink-0 ${!notification.isRead ? "bg-brand-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" : "bg-transparent"}`} />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm ${!notification.isRead ? "font-semibold text-primary" : "font-medium text-secondary"}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm mt-1 line-clamp-2 md:line-clamp-none ${!notification.isRead ? "text-primary" : "text-secondary"}`}>
                      {notification.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                      <span className="text-xs font-medium text-tertiary">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, notification.id)}
                    className="p-2 text-tertiary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
                    title="Xóa thông báo"
                    aria-label="Xóa thông báo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 rounded-lg border border-secondary text-secondary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-secondary px-4">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 rounded-lg border border-secondary text-secondary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
