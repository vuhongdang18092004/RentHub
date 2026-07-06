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
    activeReferencedProduct,
    setActiveReferencedProduct,
  } = useChat();

  const [searchText, setSearchText] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState(0);

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Cloudinary signature-based upload helper
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cấu hình Cloudinary thiếu trong file .env");
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const stringToSign = `timestamp=${timestamp}${apiSecret}`;
    const buffer = new TextEncoder().encode(stringToSign);
    const hash = await crypto.subtle.digest("SHA-1", buffer);
    const signature = Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Tải ảnh thất bại");
    }

    const resData = await response.json();
    return resData.secure_url;
  };

  const handleAttachImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeConversationId) return;

    try {
      setUploadingImage(true);
      const url = await uploadImageToCloudinary(files[0]);
      await sendMessage(url, "IMAGE");
    } catch (err: any) {
      console.error("Lỗi đính kèm hình ảnh:", err);
      alert(err.message || "Không thể tải lên hình ảnh");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSendProduct = async () => {
    if (!activeReferencedProduct || !activeConversationId) return;
    await sendMessage(
      `Tôi quan tâm đến sản phẩm này: ${activeReferencedProduct.name}`,
      "PRODUCT",
      activeReferencedProduct.id
    );
    setActiveReferencedProduct(null);
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
                              className={`block p-2 rounded-xl transition-all text-left mb-2 border ${
                                isMe
                                  ? "bg-white/15 hover:bg-white/20 text-white border-white/10"
                                  : "bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200"
                              }`}
                            >
                              <div className="flex gap-2 items-center">
                                <div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-zinc-100 border border-zinc-200/50">
                                  {msg.referencedProduct.primaryImage ? (
                                    <img src={msg.referencedProduct.primaryImage} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="w-full h-full flex items-center justify-center text-xs">📦</span>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className={`font-extrabold text-[10px] truncate leading-tight ${isMe ? "text-white" : "text-zinc-800"}`}>
                                    {msg.referencedProduct.name}
                                  </h4>
                                  <span className={`text-[9px] font-black mt-0.5 block ${isMe ? "text-white/90" : "text-violet-600"}`}>
                                    {msg.referencedProduct.pricePerDay.toLocaleString("vi-VN")}đ/ngày
                                  </span>
                                </div>
                              </div>
                            </Link>
                          )}
                          
                          {/* If IMAGE message type */}
                          {msg.messageType === "IMAGE" ? (
                            <div className="max-w-[200px] rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-all border border-zinc-200/30">
                              <img
                                src={msg.content}
                                alt="Ảnh đính kèm"
                                className="w-full h-auto object-cover max-h-[160px]"
                                onClick={() => window.open(msg.content, "_blank")}
                              />
                            </div>
                          ) : (
                            <p className="whitespace-pre-line break-words">{msg.content}</p>
                          )}
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

              {/* Product Reference Bar */}
              {activeReferencedProduct && (
                <div className="px-4 py-2 border-t border-zinc-150 bg-zinc-50 flex items-center justify-between gap-3 animate-fade-in select-none">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-200">
                      {activeReferencedProduct.primaryImage ? (
                        <img src={activeReferencedProduct.primaryImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm bg-zinc-100">📦</div>
                      )}
                    </div>
                    <div className="min-w-0 text-xs">
                      <p className="text-zinc-500 text-[9px] font-bold">Bạn đang hỏi về sản phẩm:</p>
                      <h4 className="font-extrabold text-zinc-800 truncate max-w-[280px]">{activeReferencedProduct.name}</h4>
                      <p className="text-violet-600 font-bold text-[9px]">{activeReferencedProduct.pricePerDay.toLocaleString("vi-VN")}đ/ngày</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSendProduct}
                      className="px-3 py-1.5 bg-violet-600 hover:bg-violet-750 text-white text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                    >
                      Gửi link sản phẩm
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveReferencedProduct(null)}
                      className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Input form */}
              <form onSubmit={handleSend} className="p-3.5 border-t border-zinc-150 bg-white">
                <div className="flex gap-2 items-end">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAttachImage}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all cursor-pointer border border-zinc-200"
                    title="Đính kèm hình ảnh"
                  >
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-zinc-450 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>

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
                    disabled={!typedMessage.trim() || uploadingImage}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                      typedMessage.trim() && !uploadingImage
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
