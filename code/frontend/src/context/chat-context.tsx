"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { chatService, ConversationSummaryResponse, MessageResponse, MessageType } from "@/services/chat-service";

interface ChatContextType {
  isOpen: boolean;
  activeConversationId: number | null;
  conversations: ConversationSummaryResponse[];
  openChat: (recipientId?: number) => Promise<void>;
  closeChat: () => void;
  selectConversation: (id: number) => Promise<void>;
  sendMessage: (content: string, type?: MessageType, referencedProductId?: number) => Promise<void>;
  messages: MessageResponse[];
  loadingMessages: boolean;
  unreadTotal: number;
  refreshConversations: () => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  activeReferencedProduct: any | null;
  setActiveReferencedProduct: (product: any | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ConversationSummaryResponse[]>([]);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeReferencedProduct, setActiveReferencedProduct] = useState<any | null>(null);

  const refreshConversations = async () => {
    if (isLoading || !isAuthenticated || !user) return;
    try {
      const data = await chatService.getMyConversations();
      setConversations(data || []);
    } catch (err) {
      console.error("Lỗi lấy hộp thoại chat:", err);
    }
  };

  // Poll conversations and active messages while drawer is open
  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    refreshConversations();

    // Set interval to poll conversations and active message list every 4 seconds
    const interval = setInterval(() => {
      if (isOpen) {
        refreshConversations();
        if (activeConversationId) {
          // Silent fetch latest messages to keep chat updated
          chatService.getMessages(activeConversationId, 0, 30).then((res) => {
            // Sort ascending by ID or createdAt
            const sorted = (res.content || []).reverse();
            setMessages(sorted);
          }).catch(console.error);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [user, isLoading, isAuthenticated, isOpen, activeConversationId]);

  const selectConversation = async (id: number) => {
    setActiveConversationId(id);
    setLoadingMessages(true);
    setPage(0);
    setHasMore(true);
    try {
      const res = await chatService.getMessages(id, 0, 20);
      // Reverse messages since page content comes in desc order (newest first)
      const sorted = (res.content || []).reverse();
      setMessages(sorted);
      
      // Mark as read in backend
      await chatService.markAsRead(id);
      
      // Update local conversation list read status
      setConversations(prev =>
        prev.map(c => (c.conversationId === id ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!activeConversationId || !hasMore || loadingMessages) return;
    const nextPage = page + 1;
    try {
      const res = await chatService.getMessages(activeConversationId, nextPage, 20);
      if (res.content.length === 0) {
        setHasMore(false);
        return;
      }
      const sortedNew = (res.content || []).reverse();
      setMessages(prev => [...sortedNew, ...prev]);
      setPage(nextPage);
    } catch (err) {
      console.error("Lỗi tải tin nhắn cũ:", err);
    }
  };

  const openChat = async (recipientId?: number) => {
    setIsOpen(true);
    if (!user) return;

    await refreshConversations();

    if (recipientId) {
      try {
        const conv = await chatService.getOrCreateConversation(recipientId);
        // Add to list if not already there
        setConversations(prev => {
          if (prev.some(c => c.conversationId === conv.conversationId)) return prev;
          return [conv, ...prev];
        });
        await selectConversation(conv.conversationId);
      } catch (err) {
        console.error("Lỗi tạo/lấy hội thoại:", err);
      }
    } else if (conversations.length > 0 && !activeConversationId) {
      // Open the first conversation in the list by default
      await selectConversation(conversations[0].conversationId);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setActiveReferencedProduct(null); // Clear active product context on close
  };

  const sendMessage = async (content: string, type: MessageType = "TEXT", referencedProductId?: number) => {
    if (!activeConversationId) return;
    try {
      const msg = await chatService.sendMessage({
        conversationId: activeConversationId,
        content,
        messageType: type,
        referencedProductId,
      });
      setMessages(prev => [...prev, msg]);
      await refreshConversations();
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  // Custom global event listener for details page
  useEffect(() => {
    const handleOpenChatEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const recipientId = customEvent.detail?.recipientId;
      const productInfo = customEvent.detail?.productId ? {
        id: customEvent.detail.productId,
        name: customEvent.detail.productName,
        pricePerDay: customEvent.detail.productPrice,
        primaryImage: customEvent.detail.productImage,
      } : null;

      setActiveReferencedProduct(productInfo);
      openChat(recipientId);
    };

    window.addEventListener("open-chat-drawer", handleOpenChatEvent);
    return () => {
      window.removeEventListener("open-chat-drawer", handleOpenChatEvent);
    };
  }, [conversations]);

  const unreadTotal = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        activeConversationId,
        conversations,
        openChat,
        closeChat,
        selectConversation,
        sendMessage,
        messages,
        loadingMessages,
        unreadTotal,
        refreshConversations,
        loadMoreMessages,
        activeReferencedProduct,
        setActiveReferencedProduct,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
