"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { productService } from "@/services/product-service";
import { useWishlist } from "@/context/wishlist-context";
import { useToast } from "@/context/ToastContext";
import { MOCK_PRODUCTS, LOCAL_QA, DEFAULT_AI_RESPONSE } from "./database";

// Unified product type that works for both mock catalog & backend public search response
interface UnifiedProduct {
  id: number;
  name: string;
  pricePerDay: number;
  categoryName: string;
  primaryImageUrl: string | null;
  similarityScore?: number;
}

// Map any product representation to a UnifiedProduct
const mapToUnifiedProduct = (prod: any): UnifiedProduct => {
  return {
    id: prod.id,
    name: prod.name,
    pricePerDay: prod.pricePerDay,
    categoryName: prod.categoryName || prod.category?.name || "Khác",
    primaryImageUrl: prod.primaryImageUrl || prod.primaryImage || null,
    similarityScore: prod.similarityScore
  };
};

// --- Text Utilities for Cosine Similarity ---
const removeAccents = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const tokenize = (text: string): string[] => {
  const clean = removeAccents(text).replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
  return clean.split(/\s+/).filter((w) => w.length >= 2);
};

const getTermFrequency = (tokens: string[]): Record<string, number> => {
  const tf: Record<string, number> = {};
  tokens.forEach((t) => {
    tf[t] = (tf[t] || 0) + 1;
  });
  return tf;
};

const getCosineSimilarity = (tfA: Record<string, number>, tfB: Record<string, number>): number => {
  const terms = new Set([...Object.keys(tfA), ...Object.keys(tfB)]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  terms.forEach((term) => {
    const valA = tfA[term] || 0;
    const valB = tfB[term] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// --- Custom Markdown Renderer ---
function MarkdownRenderer({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-1.5 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200">
      {parts.map((part, idx) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "";
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div
              key={idx}
              className="relative my-2 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-950 font-mono text-[10px] shadow-sm"
            >
              <div className="flex items-center justify-between px-3 py-1 border-b border-zinc-900 bg-zinc-900 text-zinc-400">
                <span className="uppercase text-[8px] font-bold tracking-wider">{lang || "code"}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-violet-700 text-zinc-300 hover:text-white transition-all text-[8px] font-semibold cursor-pointer"
                >
                  Copy
                </button>
              </div>
              <pre className="p-2 overflow-x-auto text-zinc-250 leading-normal">
                <code>{code}</code>
              </pre>
            </div>
          );
        } else {
          const lines = part.split("\n");
          return (
            <div key={idx} className="space-y-0.5">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("###")) {
                  return (
                    <h3 key={lIdx} className="text-xs font-extrabold text-violet-700 dark:text-violet-400 mt-2 mb-0.5">
                      {trimmed.replace("###", "").trim()}
                    </h3>
                  );
                }
                if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
                  return (
                    <li key={lIdx} className="ml-3 list-disc pl-0.5 py-0.5">
                      {trimmed.slice(1).trim()}
                    </li>
                  );
                }
                if (/^\d+\./.test(trimmed)) {
                  const matchDigit = trimmed.match(/^(\d+)\./);
                  const digitLength = matchDigit ? matchDigit[0].length : 2;
                  return (
                    <li key={lIdx} className="ml-3 list-decimal pl-0.5 py-0.5">
                      {trimmed.slice(digitLength).trim()}
                    </li>
                  );
                }
                if (trimmed === "") {
                  return <div key={lIdx} className="h-0.5" />;
                }

                const boldParts = trimmed.split(/(\*\*.*?\*\*)/g);
                return (
                  <p key={lIdx} className="my-0.5">
                    {boldParts.map((bp, bpIdx) => {
                      if (bp.startsWith("**") && bp.endsWith("**")) {
                        return (
                          <strong key={bpIdx} className="font-extrabold text-zinc-900 dark:text-white">
                            {bp.slice(2, -2)}
                          </strong>
                        );
                      }
                      const codeParts = bp.split(/(\`.*?\`)/g);
                      return codeParts.map((cp, cpIdx) => {
                        if (cp.startsWith("`") && cp.endsWith("`")) {
                          return (
                            <code
                              key={cpIdx}
                              className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-1 py-0.5 rounded text-amber-600 dark:text-amber-400 font-mono text-[10px]"
                            >
                              {cp.slice(1, -1)}
                            </code>
                          );
                        }
                        return cp;
                      });
                    })}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

// --- Product Card Component for Chat Bubbles ---
interface ChatProductCardProps {
  prod: UnifiedProduct;
  rentalDays: number;
  onHeartClick: (e: React.MouseEvent, id: number, name: string) => void;
}

function ChatProductCard({ prod, rentalDays, onHeartClick }: ChatProductCardProps) {
  const { isFavorited } = useWishlist();
  const favorited = isFavorited(prod.id);
  const price = `${Number(prod.pricePerDay).toLocaleString("vi-VN")}đ`;
  const totalPrice = `${Number(prod.pricePerDay * rentalDays).toLocaleString("vi-VN")}đ`;
  const similarityScore = prod.similarityScore || 0;

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 hover:border-violet-400 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all group shrink-0 w-full sm:w-[260px] relative">
      
      {/* Cosine Similarity Badge */}
      {similarityScore > 0 && (
        <span className="absolute top-2 left-2 z-10 bg-violet-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm shadow-sm border border-violet-500 animate-pulse flex items-center gap-0.5">
          ⚡ Khớp {Math.round(similarityScore * 100)}%
        </span>
      )}

      {/* Heart Toggle Button */}
      <button
        onClick={(e) => onHeartClick(e, prod.id, prod.name)}
        title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
        className={`absolute top-2 right-2 p-1 rounded-full shadow-sm transition-all duration-200 z-10 cursor-pointer hover:scale-105 active:scale-95 ${
          favorited
            ? "bg-red-50/95 text-red-500"
            : "bg-white/80 hover:bg-white text-zinc-500 hover:text-red-500"
        }`}
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${
            favorited ? "scale-110 fill-current" : "fill-none stroke-current"
          }`}
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Product Image & Info */}
      <div className="flex items-center gap-2.5 p-2 flex-1 pt-7">
        <div className="w-12 h-12 rounded bg-zinc-100 dark:bg-zinc-800 shrink-0 relative overflow-hidden">
          {prod.primaryImageUrl ? (
            <img
              src={prod.primaryImageUrl}
              alt={prod.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base">📦</div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <h4 className="font-extrabold text-[11px] text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-tight group-hover:text-violet-600 transition-colors">
            {prod.name}
          </h4>
          <div className="flex flex-col text-[9px] text-zinc-400">
            <span>{prod.categoryName}</span>
            <span>Đơn giá: <span className="font-bold text-zinc-650 dark:text-zinc-300">{price}/ngày</span></span>
          </div>
        </div>
      </div>

      {/* Calculator display */}
      {rentalDays > 1 && (
        <div className="px-2 py-1 bg-violet-50/50 dark:bg-violet-950/20 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[9px] font-bold text-violet-700 dark:text-violet-400">
          <span>Tổng ({rentalDays} ngày):</span>
          <span>{totalPrice}</span>
        </div>
      )}

      {/* Action links */}
      <div className="flex border-t border-zinc-100 dark:border-zinc-800 text-center text-[10px] divide-x divide-zinc-100 dark:divide-zinc-800">
        <Link
          href={`/products/${prod.id}`}
          className="flex-1 py-1.5 font-bold text-zinc-550 hover:bg-zinc-50 hover:text-zinc-850 dark:hover:bg-zinc-800/40 transition-colors"
        >
          Xem chi tiết
        </Link>
        <Link
          href={`/products/${prod.id}`}
          className="flex-1 py-1.5 font-black text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
        >
          Thuê ngay
        </Link>
      </div>
    </div>
  );
}

// --- Chat Message Interface ---
interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  reasoningLogs?: string[];
}

export function AiChatbotBubble() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [reasoningOpenIndex, setReasoningOpenIndex] = useState<number | null>(null);

  // Floating Heart Animation State
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Date Range Calculator State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [calcExpanded, setCalcExpanded] = useState(false);

  // Dynamic Suggestion Chips
  const [suggestionChips, setSuggestionChips] = useState<string[]>([
    "📷 Thuê Máy ảnh & Flycam",
    "🎵 Thuê Loa Bluetooth",
    "🏕️ Đồ dùng cắm trại"
  ]);

  // Available products catalog loaded from RentHub
  const [availableProducts, setAvailableProducts] = useState<UnifiedProduct[]>([]);

  // Credentials config
  const [cfConfig, setCfConfig] = useState({ accountId: "", token: "", proxy: "" });
  const [isConnected, setIsConnected] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { triggerToast } = useToast();
  const { isFavorited, toggleFavorite } = useWishlist();

  // Load configuration and default dates on mount
  useEffect(() => {
    const savedAccId = localStorage.getItem("cf_account_id") || "";
    const savedToken = localStorage.getItem("cf_api_token") || "";
    const savedProxy = localStorage.getItem("cf_cors_proxy") || "";
    
    setCfConfig({ accountId: savedAccId, token: savedToken, proxy: savedProxy });
    setIsConnected(!!savedToken);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    setStartDate(today.toISOString().split("T")[0]);
    setEndDate(tomorrow.toISOString().split("T")[0]);

    // Initial products fetch
    const loadProducts = async () => {
      try {
        const res = await productService.getAvailableProducts(0, 50);
        if (res && res.content && res.content.length > 0) {
          setAvailableProducts(res.content.map(mapToUnifiedProduct));
        } else {
          setAvailableProducts(MOCK_PRODUCTS.map(mapToUnifiedProduct));
        }
      } catch (err) {
        console.log("Fallback to mock catalog:", err);
        setAvailableProducts(MOCK_PRODUCTS.map(mapToUnifiedProduct));
      }
    };
    loadProducts();

    // Welcome message
    setMessages([{ sender: "assistant", text: LOCAL_QA[0].reply }]);
    setMounted(true);
  }, []);

  // Web Speech API Voice Recognition initialization
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "vi-VN"; // Vietnamese language
        
        rec.onstart = () => {
          setIsListening(true);
        };
        
        rec.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setInputValue(text);
          setTimeout(() => {
            handleSendMessage(text);
          }, 600);
        };
        
        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e);
          setIsListening(false);
        };
        
        rec.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current = rec;
      }
    }
  }, [availableProducts]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  // Handle Speech Recognition Toggle
  const toggleSpeechListening = () => {
    if (!recognitionRef.current) {
      alert("Trình duyệt của bạn không hỗ trợ Web Speech API!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInputValue("");
      recognitionRef.current.start();
    }
  };

  // Save CF config
  const handleSaveConfig = () => {
    localStorage.setItem("cf_account_id", cfConfig.accountId.trim());
    localStorage.setItem("cf_api_token", cfConfig.token.trim());
    localStorage.setItem("cf_cors_proxy", cfConfig.proxy.trim());
    setIsConnected(!!cfConfig.token.trim());
    setConfigOpen(false);
    triggerToast("Đã lưu thông tin cấu hình Cloudflare AI! ⚙️");
  };

  const handleClearConfig = () => {
    localStorage.removeItem("cf_account_id");
    localStorage.removeItem("cf_api_token");
    localStorage.removeItem("cf_cors_proxy");
    setCfConfig({ accountId: "", token: "", proxy: "" });
    setIsConnected(false);
    setConfigOpen(false);
    triggerToast("Đã xóa thông tin credentials Cloudflare.");
  };

  // Wishlist Heart click with floating heart effect
  const handleWishlistToggle = async (e: React.MouseEvent, prodId: number, name: string) => {
    await handleWishlistToggleAction(e, prodId, name);
  };

  const handleWishlistToggleAction = async (e: React.MouseEvent, prodId: number, name: string) => {
    e.preventDefault();
    e.stopPropagation();

    const before = isFavorited(prodId);
    // Directly call state change via toggleFavorite on the global RentHub context
    await toggleFavorite(prodId, name);
    const after = !before;

    if (after) {
      triggerToast(`Đã thêm "${name}" vào danh sách yêu thích! ❤️`);
      // Get chat window coordinate space to spawn floating heart particle
      const rect = e.currentTarget.getBoundingClientRect();
      const heartId = Date.now();
      setHearts((prev) => [...prev, { id: heartId, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== heartId));
      }, 1000);
    } else {
      triggerToast(`Đã xóa "${name}" khỏi danh sách yêu thích.`);
    }
  };

  // Duration in days
  const getRentalDays = (): number => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  };
  const rentalDays = getRentalDays();

  // --- TF-IDF & Cosine Similarity Math Engine ---
  const rankProductsForQuery = (query: string, products: UnifiedProduct[], limit = 4): UnifiedProduct[] => {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const queryTf = getTermFrequency(queryTokens);

    const scored: UnifiedProduct[] = products.map((prod) => {
      const docText = `${prod.name} ${prod.categoryName || ""}`;
      const docTokens = tokenize(docText);
      const docTf = getTermFrequency(docTokens);

      const similarity = getCosineSimilarity(queryTf, docTf);
      return { ...prod, similarityScore: similarity };
    });

    return scored
      .filter((item) => (item.similarityScore || 0) > 0.05)
      .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
      .slice(0, limit);
  };

  // Parse product and button elements
  const extractProductIds = (text: string): number[] => {
    const regex = /\[PRODUCT:(\d+)\]/g;
    const ids: number[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      ids.push(parseInt(match[1]));
    }
    return ids;
  };

  const cleanMessageText = (text: string): string => {
    let clean = text.replace(/\[PRODUCT:\d+\]/g, "");
    return clean.replace(/\[BUTTON:.*?\|.*?\]/g, "");
  };

  const extractButtons = (text: string): { label: string; query: string }[] => {
    const regex = /\[BUTTON:(.*?)\|(.*?)\]/g;
    const buttons: { label: string; query: string }[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      buttons.push({ label: match[1], query: match[2] });
    }
    return buttons;
  };

  const updateChipsForTopic = (text: string) => {
    const clean = text.toLowerCase();
    if (
      clean.includes("may anh") ||
      clean.includes("camera") ||
      clean.includes("sony") ||
      clean.includes("chup") ||
      clean.includes("quay") ||
      clean.includes("flycam")
    ) {
      setSuggestionChips([
        "📷 Thuê ống kính Sony rời",
        "🚁 Thuê Flycam DJI Air 2S",
        "⚙️ Phụ kiện chân quay Tripod"
      ]);
    } else if (
      clean.includes("cam trai") ||
      clean.includes("da ngoai") ||
      clean.includes("leu") ||
      clean.includes("ban ghe") ||
      clean.includes("camping")
    ) {
      setSuggestionChips([
        "⛺ Lều cắm trại 4 người",
        "🪑 Thuê bộ bàn ghế xếp gọn",
        "🔦 Thuê đèn pin dã ngoại"
      ]);
    } else if (
      clean.includes("loa") ||
      clean.includes("bluetooth") ||
      clean.includes("jbl") ||
      clean.includes("nhac") ||
      clean.includes("micro")
    ) {
      setSuggestionChips([
        "🔊 Loa JBL PartyBox 310",
        "🎤 Thuê Micro hát Karaoke",
        "💡 Thuê đèn nhấp nháy Party"
      ]);
    } else {
      setSuggestionChips([
        "📷 Thuê Máy ảnh & Flycam",
        "🎵 Thuê Loa Bluetooth",
        "🏕️ Đồ dùng cắm trại"
      ]);
    }
  };

  // Check if message has viewing/rental intent for a specific product
  const detectProductIntent = (text: string, products: UnifiedProduct[]) => {
    const cleanText = removeAccents(text).toLowerCase();
    
    // Intent trigger keywords
    const intentKeywords = ["thue", "xem", "chi tiet", "muon thue", "muon xem", "tim hieu", "thong tin", "mua", "dat", "book", "khao sat"];
    const hasIntent = intentKeywords.some(kw => cleanText.includes(kw));
    
    if (!hasIntent) return null;
    
    // Search for a product name match in the user input
    for (const prod of products) {
      const cleanProdName = removeAccents(prod.name).toLowerCase();
      const tokens = tokenize(prod.name);
      
      const hasExactMatch = cleanText.includes(cleanProdName);
      const isUniqueMatch = tokens.some(token => {
        if (["o", "to", "may", "anh", "da", "ngoai", "cam", "trai", "cho", "thue"].includes(token)) return false;
        return token.length >= 3 && cleanText.includes(token);
      });
      
      if (hasExactMatch || isUniqueMatch) {
        return prod;
      }
    }
    
    return null;
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    if (!textToSend) setInputValue("");
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setIsTyping(true);

    updateChipsForTopic(text);

    // Dynamic Backend Integration Check: Fetch matching products from backend PostgreSQL database
    let backendProducts: UnifiedProduct[] = [];
    let backendLogs = ["🌐 Kết nối RentHub Backend API...", "🔍 Đang gọi /api/products/public với tham số từ khóa..."];
    try {
      // Execute live search query against project backend
      const searchRes = await productService.getPublicProducts({ keyword: text, size: 8 });
      if (searchRes && searchRes.content && searchRes.content.length > 0) {
        backendProducts = searchRes.content.map(mapToUnifiedProduct);
        backendLogs.push(`✓ Đã tìm thấy ${backendProducts.length} sản phẩm thực tế từ RentHub database!`);
      } else {
        backendLogs.push("⚠️ Không tìm thấy sản phẩm khớp trong database. Dùng Mock catalog làm dự phòng.");
      }
    } catch (err) {
      console.log("Backend offline or error. Fallback to mock catalog:", err);
      backendLogs.push("❌ Lỗi kết nối backend API. Chuyển sang dùng Mock catalog.");
    }

    const catalogToUse = backendProducts.length > 0 ? backendProducts : availableProducts;
    const matchedProduct = detectProductIntent(text, catalogToUse);

    if (matchedProduct) {
      setTimeout(() => {
        setIsTyping(false);
        let intro = "";
        const lowerName = matchedProduct.name.toLowerCase();
        if (lowerName.includes("vf7")) {
          intro = "Đây là **VF7** - mẫu xe điện mới ra mắt với thiết kế khí động học thể thao đột phá, động cơ mạnh mẽ và công nghệ an toàn ADAS thông minh vượt trội cho năm 2026. Phù hợp cho những chuyến đi trải nghiệm đẳng cấp!";
        } else if (lowerName.includes("vf8")) {
          intro = "Đây là **VF8** - dòng xe SUV điện phân khúc D đẳng cấp, sở hữu khoang lái rộng rãi sang trọng, công nghệ tự lái tiên tiến và khả năng tăng tốc ấn tượng. Trải nghiệm tuyệt vời cho gia đình!";
        } else if (lowerName.includes("vf6")) {
          intro = "Đây là **VF6** - mẫu SUV đô thị trẻ trung, năng động, tối ưu hóa không gian nội thất, vận hành thông minh và cực kỳ tiết kiệm nhiên liệu điện. Rất thích hợp để vi vu trong phố!";
        } else if (lowerName.includes("leu")) {
          intro = "Đây là chiếc **Lều cắm trại** dã ngoại chất lượng cao, có khả năng chống thấm mưa tốt, bộ khung hợp kim chắc chắn, thông thoáng tốt và không gian rộng rãi để mang lại giấc ngủ ngon giữa thiên nhiên.";
        } else if (lowerName.includes("sony") || lowerName.includes("may anh")) {
          intro = "Đây là dòng **Máy ảnh Sony** chuyên nghiệp độ phân giải cao, hỗ trợ lấy nét tự động mắt thời gian thực và chống rung tốt giúp ghi lại mọi khoảnh khắc sắc nét đỉnh cao.";
        } else {
          intro = `Đây là **${matchedProduct.name}** - sản phẩm chất lượng cao thuộc danh mục **${matchedProduct.categoryName}**, được thiết kế thông minh và tiện dụng nhằm đem lại trải nghiệm thuê tốt nhất cho bạn.`;
        }

        const botReply = `### 🚗 ${matchedProduct.name}\n${intro}\n\n*Tôi đang chuyển bạn đến trang chi tiết của sản phẩm để tiến hành đặt thuê ngay...* [PRODUCT:${matchedProduct.id}]`;
        
        setMessages((prev) => [...prev, { 
          sender: "assistant", 
          text: botReply, 
          reasoningLogs: ["🎯 Phát hiện ý định xem/thuê sản phẩm cụ thể...", `📍 Trùng khớp sản phẩm: "${matchedProduct.name}" (ID: ${matchedProduct.id})`, "🚀 Đang kích hoạt chuyển trang tự động..."] 
        }]);

        // Redirect after 1.8 seconds
        setTimeout(() => {
          router.push(`/products/${matchedProduct.id}`);
        }, 1800);
      }, 950);
      
      return;
    }

    const clientOverrideKey = localStorage.getItem("gemini_api_key") || "";
    callGeminiAI(text, backendProducts, backendLogs, clientOverrideKey);
  };

  const runSimulatorFallback = (prompt: string, catalogToUse: UnifiedProduct[], logs: string[]) => {
    setIsTyping(false);
    const ranked = rankProductsForQuery(prompt, catalogToUse, 3);
    
    let localLogs = [...logs];
    localLogs.push("🧠 Khởi động thuật toán so khớp Cosine Similarity tại local...");
    localLogs.push(`🧮 Tính khoảng cách góc Vector trên ${catalogToUse.length} sản phẩm...`);

    let reply = "";
    if (ranked.length > 0) {
      localLogs.push(`⚡ Tìm thấy ${ranked.length} sản phẩm khớp có Cosine Score > 0.05.`);
      
      const itemsList = ranked
        .map((p, idx) => `${idx + 1}. **${p.name}** [PRODUCT:${p.id}]`)
        .join("\n");
      
      let botBtnTags = "";
      if (prompt.toLowerCase().includes("máy ảnh") || prompt.toLowerCase().includes("camera")) {
        botBtnTags = " [BUTTON:🚁 Xem thêm Flycam|Tôi muốn thuê flycam] [BUTTON:⚙️ Tripod chân quay|Tôi muốn thuê tripod]";
      } else if (prompt.toLowerCase().includes("cắm trại") || prompt.toLowerCase().includes("lều")) {
        botBtnTags = " [BUTTON:🪑 Thuê bàn ghế xếp|Tôi muốn thuê bộ bàn ghế dã ngoại] [BUTTON:🔦 Đèn pin dã ngoại|Tôi muốn thuê đèn pin cắm trại]";
      } else {
        botBtnTags = " [BUTTON:🚴 Thuê xe đạp Giant|Tôi muốn thuê xe đạp Giant] [BUTTON:🔊 Thuê loa nghe nhạc|Tôi muốn thuê loa kéo]";
      }

      reply = `### 💡 Đề xuất sản phẩm từ RentHub dành cho bạn:
Dưới đây là các sản phẩm phù hợp nhất tôi vừa tìm thấy trong cơ sở dữ liệu:

${itemsList}

Bạn có thể chỉnh ngày nhận và ngày trả đồ ở mục **📅 Bộ tính giá thuê** để hệ thống tự động cộng dồn tiền nhé! ${botBtnTags}`;
    } else {
      localLogs.push("⚠️ Không có sản phẩm khớp Cosine. Chuyển sang quét Keyword định cấu hình trước.");
      const cleanVal = prompt.toLowerCase();
      let matchedKeyword = false;
      for (const item of LOCAL_QA) {
        for (const kw of item.keywords) {
          if (cleanVal.includes(kw)) {
            localLogs.push(`✓ Khớp từ khóa: "${kw}". Lấy câu trả lời định sẵn.`);
            reply = item.reply;
            matchedKeyword = true;
            break;
          }
        }
        if (matchedKeyword) break;
      }
      if (!matchedKeyword) {
        localLogs.push("❌ Không tìm thấy từ khóa khớp. Trả về câu trả lời mặc định.");
        reply = DEFAULT_AI_RESPONSE;
      }
    }

    setMessages((prev) => [...prev, { sender: "assistant", text: reply, reasoningLogs: localLogs }]);
  };

  const callGeminiAI = async (
    prompt: string,
    backendProducts: UnifiedProduct[],
    backendLogs: string[],
    apiKey: string
  ) => {
    const catalogToUse = backendProducts.length > 0 ? backendProducts : availableProducts;
    const relevantProducts = rankProductsForQuery(prompt, catalogToUse, 5);
    const contextCatalog = relevantProducts.length > 0 ? relevantProducts : catalogToUse.slice(0, 5);

    const catalogSummary = contextCatalog
      .map((p) => `- ID ${p.id}: ${p.name} (Giá: ${Number(p.pricePerDay).toLocaleString("vi-VN")}đ/ngày, Danh mục: ${p.categoryName})`)
      .join("\n");

    const systemPrompt = `Bạn là Trợ lý Mua sắm & Thuê đồ thông minh RentHub AI.
Nhiệm vụ của bạn là tư vấn nhiệt tình và gợi ý sản phẩm cho thuê phù hợp với nhu cầu của khách hàng.

Dưới đây là danh sách sản phẩm hiện đang có sẵn trên hệ thống RentHub phù hợp nhất được truy vấn từ backend:
${catalogSummary}

LƯU Ý QUAN TRỌNG: Khi đề xuất một mặt hàng cụ thể từ danh sách trên, bạn BẮT BUỘC phải chèn thẻ [PRODUCT:id] (với id là số ID của sản phẩm) ở vị trí phù hợp trong đoạn văn để hệ thống hiển thị thẻ sản phẩm trực quan.
Ví dụ: "Bạn có thể tham khảo thuê máy ảnh Sony Alpha A7 III [PRODUCT:2] để chụp ảnh."

Ngoài ra, bạn cũng có thể chèn các nút gợi ý phản hồi nhanh ở cuối câu trả lời bằng cú pháp [BUTTON:Tên nút|Câu lệnh gửi đi].
Ví dụ: "Bạn có muốn xem thêm flycam chụp từ trên cao không? [BUTTON:🚁 Xem thêm Flycam|Tôi muốn thuê flycam] [BUTTON:⚙️ Chân máy ảnh|Tôi muốn thuê tripod]"

Hãy phản hồi bằng tiếng Việt thân thiện, tự nhiên. Không tự bịa sản phẩm không có trong danh sách trên.`;

    const endpoint = "/api/gemini";

    const history = messages.map(msg => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: cleanMessageText(msg.text) }]
    }));

    const payload = {
      contents: [
        ...history,
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tôi chưa nhận được phản hồi từ Gemini.";
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: reply,
          reasoningLogs: [
            ...backendLogs,
            "🌐 Gọi qua Next.js Gemini API Proxy...",
            "⚡ Trả về câu trả lời thông minh từ Gemini thành công!"
          ]
        }
      ]);
    } catch (err: any) {
      console.warn("Gemini call failed, triggering local fallback:", err);
      runSimulatorFallback(prompt, catalogToUse, backendLogs);
    } finally {
      setIsTyping(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Particles Overlay */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="fixed text-xl pointer-events-none select-none z-55"
          style={{
            left: h.x,
            top: h.y,
            transform: "translate(-50%, -50%)",
            animation: "floatUp 1s ease-out forwards"
          }}
        >
          ❤️
        </span>
      ))}

      {/* Floating heart inline CSS style injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes floatUp {
            0% { transform: translate(-50%, -50%) translateY(0) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -50%) translateY(-60px) scale(1.6); opacity: 0; }
          }
        `
      }} />

      {/* Floating Bubble Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setCalcExpanded(false);
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform cursor-pointer hover:scale-105 active:scale-95 relative ${
            isOpen
              ? "bg-zinc-800 text-white rotate-90"
              : "bg-linear-to-r from-violet-600 to-indigo-700 text-white"
          }`}
          title="Trợ lý RentHub AI"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <div className="relative">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Expandable Chat Card Widget */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-40 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-[360px] sm:w-[380px] h-[520px] shadow-2xl flex flex-col overflow-hidden animate-slideUp font-sans">
          
          {/* Header Panel */}
          <div className="flex items-center justify-between bg-linear-to-r from-violet-700 to-indigo-900 text-white px-4 py-3 shrink-0 shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-black border border-white/20">
                AI
              </div>
              <div>
                <h3 className="font-extrabold text-xs">Trợ lý RentHub AI</h3>
                <span className="text-[9px] text-purple-200 font-semibold uppercase tracking-wider block">
                  {isConnected ? "Llama 3 Cloudflare Edge" : "Local Coordination Mode"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div ref={chatContainerRef} className="flex-1 bg-white dark:bg-zinc-950 p-3 overflow-y-auto space-y-3 shadow-inner">
            {messages.map((msg, i) => {
              const productIds = extractProductIds(msg.text);
              const buttons = extractButtons(msg.text);
              const cleanedText = cleanMessageText(msg.text);
              const catalog = availableProducts.length > 0 ? availableProducts : MOCK_PRODUCTS.map(mapToUnifiedProduct);
              const isReasoningOpen = reasoningOpenIndex === i;

              return (
                <div
                  key={i}
                  className={`flex gap-2.5 max-w-[85%] animate-fadeIn ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7.5 h-7.5 rounded-full flex items-center justify-center shrink-0 font-bold shadow-sm text-xs ${
                      msg.sender === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-violet-600 dark:text-violet-400 border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {msg.sender === "user" ? "👤" : "🧡"}
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    
                    {/* Expandable Reasoning Logs */}
                    {msg.reasoningLogs && msg.reasoningLogs.length > 0 && (
                      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden text-[9px] bg-zinc-50 dark:bg-zinc-900/50 shadow-sm">
                        <button
                          onClick={() => setReasoningOpenIndex(isReasoningOpen ? null : i)}
                          className="w-full px-2 py-1 flex items-center justify-between font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-150 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-1">🧠 Nhật ký suy luận (Reasoning)</span>
                          <span>{isReasoningOpen ? "▲" : "▼"}</span>
                        </button>
                        {isReasoningOpen && (
                          <div className="px-2 pb-2 pt-0.5 border-t border-zinc-150 dark:border-zinc-800 font-mono text-[8px] text-zinc-500 space-y-0.5 bg-zinc-100/40 dark:bg-zinc-950/20">
                            {msg.reasoningLogs.map((log, lIdx) => (
                              <div key={lIdx} className="flex items-start gap-1">
                                <span>{log}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`py-2 px-3 rounded-xl border text-xs leading-normal shadow-xs relative ${
                        msg.sender === "user"
                          ? "bg-violet-50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900 rounded-tr-none text-zinc-900 dark:text-zinc-100"
                          : "bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-tl-none border-l-4 border-l-orange-500"
                      }`}
                    >
                      <MarkdownRenderer text={cleanedText} />
                      
                      {/* Interactive Buttons */}
                      {buttons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-zinc-150 dark:border-zinc-800/60">
                          {buttons.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => handleSendMessage(btn.query)}
                              className="px-2 py-0.5 bg-violet-50 hover:bg-violet-600 text-violet-700 hover:text-white dark:bg-violet-950/30 dark:hover:bg-violet-500 rounded border border-violet-200/50 dark:border-violet-850 text-[9px] font-bold cursor-pointer transition-all"
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Inline product recommendations cards grid */}
                    {productIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {productIds.map((pId) => {
                          const matchedProduct = catalog.find((p) => p.id === pId);
                          if (!matchedProduct) return null;

                          // Compute Cosine Similarity score for active display
                          const queryTokens = tokenize(cleanedText);
                          const docTokens = tokenize(`${matchedProduct.name} ${matchedProduct.categoryName || ""}`);
                          const sim = getCosineSimilarity(getTermFrequency(queryTokens), getTermFrequency(docTokens));

                          const scoredProduct: UnifiedProduct = {
                            ...matchedProduct,
                            similarityScore: sim > 0 ? sim : 0.7 // default fallback indicator
                          };

                          return (
                            <ChatProductCard
                              key={pId}
                              prod={scoredProduct}
                              rentalDays={rentalDays}
                              onHeartClick={handleWishlistToggle}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-7.5 h-7.5 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-violet-600 shrink-0 font-bold shadow-xs">
                  🧡
                </div>
                <div className="py-2 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900 rounded-tl-none flex items-center gap-1">
                  <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-100" />
                  <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-200" />
                  <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            )}
          </div>

          {/* Interactive Rental Date Cost Calculator Bar */}
          <div className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800 px-3 py-1.5 shrink-0 select-none">
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
              <span className="flex items-center gap-1">📅 Bộ tính giá thuê: <span className="text-violet-600 font-extrabold">{rentalDays} ngày</span></span>
              <button
                onClick={() => setCalcExpanded(!calcExpanded)}
                className="text-[9px] text-violet-600 hover:underline cursor-pointer"
              >
                {calcExpanded ? "Ẩn chọn ngày" : "Chọn ngày nhận/trả"}
              </button>
            </div>
            {calcExpanded && (
              <div className="grid grid-cols-2 gap-2 mt-1.5 text-[9px] animate-slideDown">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[8px] font-bold text-zinc-400 uppercase">Ngày nhận</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded text-[10px] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[8px] font-bold text-zinc-400 uppercase">Ngày trả</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded text-[10px] outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input Panel */}
          <div className="bg-white dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800 p-3 shadow-md shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.slice(2).trim())} // strip emoji
                  className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-400 text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-1.5 items-center"
            >
              {/* Voice wave visualizer */}
              {isListening ? (
                <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-violet-500 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] text-violet-600 font-bold animate-pulse">
                  <span>🎤 Đang lắng nghe...</span>
                  <div className="flex items-center gap-0.5 h-4">
                    <span className="w-0.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-0.5 h-3.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                    <span className="w-0.5 h-2.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: "0.5s" }} />
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Hỏi thuê món đồ gì hôm nay?..."
                  className="flex-1 bg-zinc-55 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              )}

              {/* Mic Speech recognition */}
              <button
                type="button"
                onClick={toggleSpeechListening}
                className={`rounded-lg p-2 cursor-pointer shadow-xs transition-all flex items-center justify-center shrink-0 border text-xs ${
                  isListening
                    ? "bg-red-500 border-red-500 text-white animate-pulse"
                    : "bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-600 hover:bg-zinc-200"
                }`}
                title={isListening ? "Dừng thu âm" : "Nói giọng nói"}
              >
                🎤
              </button>

              <button
                type="submit"
                disabled={isListening}
                className="bg-violet-600 hover:bg-violet-750 disabled:bg-zinc-300 text-white rounded-lg p-2 cursor-pointer shadow-xs transition-all flex items-center justify-center shrink-0"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
