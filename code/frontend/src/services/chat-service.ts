import api from "@/lib/axios";

export type MessageType = "TEXT" | "PRODUCT" | "IMAGE";

export interface ConversationSummaryResponse {
  conversationId: number;
  otherUser: {
    id: number;
    email: string;
    fullName: string;
  };
  lastMessage: string | null;
  lastMessageType: MessageType | null;
  lastMessageTime: string | null;
  unreadCount: number;
}

export interface ReferencedProduct {
  id: number;
  name: string;
  pricePerDay: number;
  depositAmount: number;
  primaryImageUrl: string | null;
}

export interface MessageResponse {
  id: number;
  conversationId: number;
  sender: {
    id: number;
    email: string;
    fullName: string;
  };
  messageType: MessageType;
  content: string;
  referencedProduct: ReferencedProduct | null;
  isRead: boolean;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}

export const chatService = {
  // POST /api/chat/conversations
  getOrCreateConversation: async (recipientId: number): Promise<ConversationSummaryResponse> => {
    const res = await api.post("/chat/conversations", { recipientId });
    return res.data;
  },

  // GET /api/chat/conversations
  getMyConversations: async (): Promise<ConversationSummaryResponse[]> => {
    const res = await api.get("/chat/conversations");
    return res.data;
  },

  // DELETE /api/chat/conversations/{id}
  hideConversation: async (conversationId: number): Promise<void> => {
    await api.delete(`/chat/conversations/${conversationId}`);
  },

  // POST /api/chat/messages
  sendMessage: async (data: {
    conversationId: number;
    content: string;
    messageType?: MessageType;
    referencedProductId?: number;
  }): Promise<MessageResponse> => {
    const res = await api.post("/chat/messages", data);
    return res.data;
  },

  // GET /api/chat/conversations/{id}/messages
  getMessages: async (
    conversationId: number,
    page = 0,
    size = 20
  ): Promise<PageResponse<MessageResponse>> => {
    const res = await api.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, size },
    });
    return res.data;
  },

  // PUT /api/chat/conversations/{id}/read
  markAsRead: async (conversationId: number): Promise<void> => {
    await api.put(`/chat/conversations/${conversationId}/read`);
  },
};
