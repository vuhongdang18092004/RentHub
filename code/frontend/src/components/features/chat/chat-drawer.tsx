"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/chat-context";
import { MessageResponse } from "@/services/chat-service";
import Link from "next/link";

export function ChatDrawer() {
  const { user } = useAuth();
  const {
    isOpen,
    activeConversationId,
    conversations,
    closeChat,
    selectConversation,
    sendMessage,
    messages,
    loadingMessages,
    loadMoreMessages,
  } = useChat();

  const [searchText, setSearchText] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle scrolling to top to load more messages
  const handleScroll = async () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && !loadingMessages) {
      setPrevScrollHeight(container.scrollHeight);
      await loadMoreMessages();
    }
  };

  // Adjust scroll position after loading old messages so user doesn't lose place
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && prevScrollHeight > 0) {
      container.scrollTop = container.scrollHeight - prevScrollHeight;
      setPrevScrollHeight(0);
    }
  }, [messages, prevScrollHeight]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedMessage.trim() || !activeConversationId) return;

    await sendMessage(typedMessage.trim());
    setTypedMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen || !user) return null;

  // Filter conversations client-side
  const filteredConversations = conversations.filter((c) =>
    c.otherUser.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  const activeConv = conversations.find((c) => c.conversationId === activeConversationId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        onClick={closeChat}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-[720px] h-full bg-white shadow-2xl flex border-l border-zinc-150 transition-transform duration-300 ease-out z-10 animate-[slideIn_0.25s_ease-out]">
        
        {/* Left Column — Conversation List (260px) */}
        <div className="w-[260px] border-r border-zinc-150 flex flex-col h-full bg-zinc-50 shrink-0 select-none">
          {/* Header */}
          <div className="p-4 border-b border-zinc-150 flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-zinc-800 tracking-wider uppercase">Tin nhắn</h2>
            <button
              onClick={closeChat}
              className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search bar */}
          <div className="p-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm người trò chuyện..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <svg className="w-4 h-4 text-zinc-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Conversations Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400 font-bold">
                Không tìm thấy hộp thoại
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.conversationId === activeConversationId;
                return (
                  <button
                    key={c.conversationId}
                    onClick={() => selectConversation(c.conversationId)}
                    className={`w-full p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                      isActive ? "bg-violet-50/70 border-l-4 border-violet-600" : "hover:bg-zinc-100/60"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center shrink-0 border border-violet-200">
                      <span className="text-violet-700 font-black text-xs">
                        {c.otherUser.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline gap-1">
                        <span className="font-extrabold text-xs text-zinc-800 truncate">
                          {c.otherUser.fullName}
                        </span>
                        <span className="text-[9px] text-zinc-400 shrink-0 font-bold">
                          {c.lastMessageTime
                            ? new Date(c.lastMessageTime).toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium leading-relaxed">
                        {c.lastMessageType === "PRODUCT"
                          ? "📦 [Sản phẩm]"
                          : c.lastMessageType === "IMAGE"
                          ? "📷 [Hình ảnh]"
                          : c.lastMessage || "Chưa có tin nhắn"}
                      </p>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column — Chat Window */}
        <div className="flex-1 flex flex-col h-full bg-white">
          {activeConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-zinc-150 flex items-center justify-between bg-zinc-50/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8.5 h-8.5 rounded-full bg-violet-100 flex items-center justify-center border border-violet-200">
                    <span className="text-violet-700 font-black text-xs">
                      {activeConv.otherUser.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-zinc-800 leading-none">
                      {activeConv.otherUser.fullName}
                    </h3>
                    <span className="text-[9px] text-zinc-400 font-bold">Trực tuyến</span>
                  </div>
                </div>
                 <Link
                  href={user && activeConv.otherUser.id === user.id ? "/profile" : `/users/${activeConv.otherUser.id}`}
                  className="px-3 py-1.5 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-lg text-[10px] font-extrabold text-zinc-600 transition-colors"
                >
                  Hồ sơ
                </Link>
              </div>

              {/* Message Feed */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50/20"
              >
                {loadingMessages && (
                  <div className="py-2 text-center text-[10px] text-zinc-400 font-bold animate-pulse">
                    Đang tải lịch sử...
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender.id === (user as any).id;
                  
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[80%] flex flex-col space-y-1">
                        {/* Bubble */}
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? "bg-violet-600 text-white rounded-tr-none"
                              : "bg-zinc-100 text-zinc-800 rounded-tl-none border border-zinc-200/50"
                          }`}
                        >
                          {/* If PRODUCT message type */}
                          {msg.messageType === "PRODUCT" && msg.referencedProduct && (
                            <Link
                              href={`/products/${msg.referencedProduct.id}`}
                              className="block p-2 bg-white/10 rounded-xl hover:bg-white/15 transition-all text-left mb-2 text-white border border-white/10"
                            >
                              <div className="flex gap-2 items-center">
                                <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-white/20">
                                  {msg.referencedProduct.primaryImageUrl ? (
                                    <img src={msg.referencedProduct.primaryImageUrl} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="w-full h-full flex items-center justify-center text-sm">📦</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-extrabold text-[11px] truncate leading-tight">
                                    {msg.referencedProduct.name}
                                  </h4>
                                  <span className="text-[10px] font-black opacity-90 mt-0.5 block">
                                    {msg.referencedProduct.pricePerDay.toLocaleString("vi-VN")}đ/ngày
                                  </span>
                                </div>
                              </div>
                            </Link>
                          )}
                          
                          <p className="whitespace-pre-line break-words">{msg.content}</p>
                        </div>
                        
                        {/* Time label */}
                        <span className={`text-[8px] text-zinc-400 font-bold px-1 ${isMe ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSend} className="p-3.5 border-t border-zinc-150 bg-white">
                <div className="flex gap-2 items-end">
                  <textarea
                    rows={1}
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 border border-zinc-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl px-3 py-2 text-xs focus:outline-none resize-none overflow-y-auto max-h-[80px]"
                  />
                  <button
                    type="submit"
                    disabled={!typedMessage.trim()}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      typedMessage.trim()
                        ? "bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-zinc-400 select-none">
              <svg className="w-12 h-12 text-zinc-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="font-extrabold text-xs text-zinc-500">Chưa chọn cuộc trò chuyện</h3>
              <p className="text-[10px] text-zinc-400 max-w-[200px] mt-1 font-medium leading-normal">
                Chọn người trò chuyện từ danh sách bên trái để gửi tin nhắn.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
