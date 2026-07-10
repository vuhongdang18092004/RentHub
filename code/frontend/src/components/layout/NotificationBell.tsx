"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { notificationService, NotificationResponse } from "@/services/notification-service";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function NotificationBell() {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.unreadCount);
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const res = await notificationService.getRecentNotifications(5);
      setNotifications(res);
    } catch (error) {
      console.error("Failed to fetch recent notifications", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Polling every 10 seconds for real-time notifications
    const intervalId = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchRecentNotifications();
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-zinc-50 rounded-xl text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer"
        title="Thông báo"
        aria-label="Thông báo"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-zinc-150 rounded-2xl shadow-xl py-2 z-50 flex flex-col font-sans max-h-[85vh]">
          <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <h3 className="text-sm font-bold text-zinc-800">Thông báo</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-zinc-500 text-sm font-medium">
                Bạn chưa có thông báo nào.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-zinc-50 border-b border-zinc-50 transition-colors ${
                      !notification.isRead ? "bg-brand-50/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.isRead ? "bg-brand-500" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.isRead ? "font-bold text-zinc-900" : "font-semibold text-zinc-700"}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] font-medium text-zinc-400 mt-1.5">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: vi })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-zinc-100 mt-auto sticky bottom-0 bg-white rounded-b-2xl">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs font-bold text-brand-600 hover:text-brand-800 py-1"
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
