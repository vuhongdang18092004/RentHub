"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { productService } from "@/services/product-service";
import { useWishlist } from "@/context/wishlist-context";
import { MOCK_PRODUCTS, LOCAL_QA, DEFAULT_AI_RESPONSE, ProductSummary } from "./database";

// --- Custom Markdown Renderer ---
function MarkdownRenderer({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
      {parts.map((part, idx) => {
        if (part.startsWith("```")) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : "";
          const code = match ? match[2] : part.slice(3, -3);

          return (
            <div
              key={idx}
              className="relative my-3 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-950 font-mono text-xs shadow-sm"
            >
              <div className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-900 bg-zinc-900 text-zinc-400">
                <span className="uppercase text-[9px] font-bold tracking-wider">{lang || "code"}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-violet-700 text-zinc-300 hover:text-white transition-all text-[9px] font-semibold cursor-pointer"
                >
                  Copy
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-zinc-200 leading-normal">
                <code>{code}</code>
              </pre>
            </div>
          );
        } else {
          const lines = part.split("\n");
          return (
            <div key={idx} className="space-y-1">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("###")) {
                  return (
                    <h3 key={lIdx} className="text-sm font-extrabold text-violet-700 dark:text-violet-400 mt-3 mb-1">
                      {trimmed.replace("###", "").trim()}
                    </h3>
                  );
                }
                if (trimmed.startsWith("####")) {
                  return (
                    <h4 key={lIdx} className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-2 mb-1">
                      {trimmed.replace("####", "").trim()}
                    </h4>
                  );
                }
                if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
                  return (
                    <li key={lIdx} className="ml-4 list-disc pl-1 py-0.5">
                      {trimmed.slice(1).trim()}
                    </li>
                  );
                }
                if (/^\d+\./.test(trimmed)) {
                  const matchDigit = trimmed.match(/^(\d+)\./);
                  const digitLength = matchDigit ? matchDigit[0].length : 2;
                  return (
                    <li key={lIdx} className="ml-4 list-decimal pl-1 py-0.5">
                      {trimmed.slice(digitLength).trim()}
                    </li>
                  );
                }
                if (trimmed === "") {
                  return <div key={lIdx} className="h-1" />;
                }

                // Parse bold (**text**) and inline code (`code`)
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
                              className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 px-1 py-0.5 rounded text-amber-600 dark:text-amber-400 font-mono text-[11px]"
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

// --- Product Card inside Chat with Wishlist Integration ---
function ChatProductCard({ prod }: { prod: ProductSummary }) {
  const { isFavorited, toggleFavorite } = useWishlist();
  const favorited = isFavorited(prod.id);
  const price = `${Number(prod.pricePerDay).toLocaleString("vi-VN")}đ`;

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(prod.id, prod.name);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 hover:border-violet-400 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group shrink-0 w-full sm:w-[280px] relative">
      {/* Heart Toggle Button */}
      <button
        onClick={handleHeartClick}
        title={favorited ? "Bỏ yêu thích" : "Yêu thích"}
        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow-sm transition-all duration-200 z-10 cursor-pointer hover:scale-105 active:scale-95 ${
          favorited
            ? "bg-red-50/95 text-red-500"
            : "bg-white/80 hover:bg-white text-zinc-500 hover:text-red-500"
        }`}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
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
      <div className="flex items-center gap-3 p-3 flex-1">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 relative">
          {prod.primaryImage ? (
            <img
              src={prod.primaryImage}
              alt={prod.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200 line-clamp-2 group-hover:text-violet-600 transition-colors">
            {prod.name}
          </h4>
          <div className="flex justify-between items-center text-[10px]">
            <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-semibold">
              {prod.category?.name}
            </span>
            <span className="font-black text-violet-600 dark:text-violet-400">{price}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex border-t border-zinc-150 dark:border-zinc-800 text-center text-xs divide-x divide-zinc-150 dark:divide-zinc-800">
        <Link
          href={`/products/${prod.id}`}
          className="flex-1 py-2 font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-55 hover:text-zinc-800 dark:hover:bg-zinc-800/40 transition-colors"
        >
          Xem chi tiết
        </Link>
        <Link
          href={`/products/${prod.id}`}
          className="flex-1 py-2 font-black text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
        >
          Thuê ngay
        </Link>
      </div>
    </div>
  );
}

// --- Main Chat Page Component ---
export default function CloudflareAiPage() {
  const [messages, setMessages] = useState<{ sender: "user" | "assistant"; text: string }[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  
  // Suggestion chips dynamically change based on chat topic
  const [suggestionChips, setSuggestionChips] = useState<string[]>([
    "📷 Thuê Máy ảnh & Flycam",
    "🎵 Thuê Loa Bluetooth",
    "🏕️ Đồ dùng cắm trại"
  ]);

  // Available products list loaded from RentHub
  const [availableProducts, setAvailableProducts] = useState<ProductSummary[]>([]);

  // Credentials config state
  const [cfConfig, setCfConfig] = useState({ accountId: "", token: "", proxy: "" });
  const [isConnected, setIsConnected] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load configuration and fetch products
  useEffect(() => {
    const savedAccId = localStorage.getItem("cf_account_id") || "";
    const savedToken = localStorage.getItem("cf_api_token") || "";
    const savedProxy = localStorage.getItem("cf_cors_proxy") || "";
    
    setCfConfig({ accountId: savedAccId, token: savedToken, proxy: savedProxy });
    setIsConnected(!!savedToken);

    // Fetch RentHub products
    const loadProducts = async () => {
      try {
        const res = await productService.getAvailableProducts(0, 100);
        if (res && res.content && res.content.length > 0) {
          setAvailableProducts(res.content);
        } else {
          setAvailableProducts(MOCK_PRODUCTS);
        }
      } catch (err) {
        console.log("Fallback to mock catalog:", err);
        setAvailableProducts(MOCK_PRODUCTS);
      }
    };
    loadProducts();

    // Welcome message
    setMessages([{ sender: "assistant", text: LOCAL_QA[0].reply }]);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Handle configuration update
  const handleSaveConfig = () => {
    localStorage.setItem("cf_account_id", cfConfig.accountId.trim());
    localStorage.setItem("cf_api_token", cfConfig.token.trim());
    localStorage.setItem("cf_cors_proxy", cfConfig.proxy.trim());
    setIsConnected(!!cfConfig.token.trim());
    setConfigOpen(false);
    alert("Đã cập nhật thông tin cấu hình Cloudflare Workers AI!");
  };

  const handleClearConfig = () => {
    localStorage.removeItem("cf_account_id");
    localStorage.removeItem("cf_api_token");
    localStorage.removeItem("cf_cors_proxy");
    setCfConfig({ accountId: "", token: "", proxy: "" });
    setIsConnected(false);
    setConfigOpen(false);
    alert("Đã xóa cấu hình credentials!");
  };

  // Typo-tolerant Product Search & Keyword Scoring
  const rankProductsForQuery = (query: string, products: ProductSummary[], limit = 4): ProductSummary[] => {
    const cleanQuery = query.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length >= 2);

    if (queryWords.length === 0) return [];

    const scored = products.map(prod => {
      let score = 0;
      const nameLower = prod.name.toLowerCase();
      const catLower = (prod.category?.name || "").toLowerCase();

      queryWords.forEach(word => {
        // Direct matching word
        if (nameLower.includes(word)) {
          score += 5;
          // Word boundary match gets extra points
          const regex = new RegExp(`\\b${word}\\b`, "i");
          if (regex.test(nameLower)) {
            score += 5;
          }
        }
        
        if (catLower.includes(word)) {
          score += 3;
        }

        // Typo tolerance check: if edit distance / Jaro-Winkler or simple character matching is high
        // Let's do a simple character overlap matching for typo tolerance
        let matchCharCount = 0;
        const nameLetters = nameLower.split("");
        word.split("").forEach(char => {
          const idx = nameLetters.indexOf(char);
          if (idx !== -1) {
            matchCharCount++;
            nameLetters.splice(idx, 1); // remove letter to prevent double scoring
          }
        });
        const overlapRatio = matchCharCount / word.length;
        if (overlapRatio >= 0.8 && word.length >= 3) {
          score += 2; // character overlap match (typo support)
        }
      });

      return { prod, score };
    });

    // Filter products with score > 0 and sort by score descending
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.prod)
      .slice(0, limit);
  };

  // Helper: Extract recommended product IDs from bot response
  const extractProductIds = (text: string): number[] => {
    const regex = /\[PRODUCT:(\d+)\]/g;
    const ids: number[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      ids.push(parseInt(match[1]));
    }
    return ids;
  };

  // Helper: Strip PRODUCT tags from message display bubble
  const cleanMessageText = (text: string): string => {
    return text.replace(/\[PRODUCT:\d+\]/g, "");
  };

  // Dynamically update Suggestion Chips based on conversation keywords
  const updateChipsForTopic = (text: string) => {
    const clean = text.toLowerCase();
    
    if (clean.includes("máy ảnh") || clean.includes("camera") || clean.includes("sony") || clean.includes("quay phim") || clean.includes("chụp hình") || clean.includes("flycam")) {
      setSuggestionChips([
        "📷 Thuê ống kính Sony rời",
        "🚁 Thuê Flycam DJI Air 2S",
        "⚙️ Phụ kiện chân quay Tripod"
      ]);
    } else if (clean.includes("cắm trại") || clean.includes("dã ngoại") || clean.includes("lều") || clean.includes("bàn ghế") || clean.includes("outdoor") || clean.includes("camping")) {
      setSuggestionChips([
        "⛺ Lều cắm trại 4 người",
        "🪑 Thuê bộ bàn ghế xếp gọn",
        "🔦 Thuê đèn pin dã ngoại"
      ]);
    } else if (clean.includes("loa") || clean.includes("bluetooth") || clean.includes("âm thanh") || clean.includes("jbl") || clean.includes("nhạc") || clean.includes("party")) {
      setSuggestionChips([
        "🔊 Loa JBL PartyBox 310",
        "🎤 Thuê Micro hát Karaoke",
        "💡 Thuê đèn nhấp nháy Party"
      ]);
    } else if (clean.includes("cầu lông") || clean.includes("vợt") || clean.includes("yonex") || clean.includes("xe đạp") || clean.includes("giant") || clean.includes("thể thao")) {
      setSuggestionChips([
        "🏸 Thuê Vợt Yonex Astrox",
        "🚴 Thuê Xe đạp địa hình Giant",
        "👟 Giày thể thao leo núi"
      ]);
    } else {
      setSuggestionChips([
        "📷 Thuê Máy ảnh & Flycam",
        "🎵 Thuê Loa Bluetooth",
        "🏕️ Đồ dùng cắm trại"
      ]);
    }
  };

  // Send message handler
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    if (!textToSend) setInputValue("");
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setIsTyping(true);

    // Update suggest chips based on current topic
    updateChipsForTopic(text);

    const accountId = localStorage.getItem("cf_account_id");
    const token = localStorage.getItem("cf_api_token");
    const proxy = localStorage.getItem("cf_cors_proxy");

    if (accountId && token) {
      callLiveAI(text, accountId, token, proxy);
    } else {
      // Simulated response
      setTimeout(() => {
        setIsTyping(false);
        const reply = simulateAI(text);
        setMessages((prev) => [...prev, { sender: "assistant", text: reply }]);
      }, 700);
    }
  };

  const simulateAI = (text: string): string => {
    // 1. Run smart search ranking first
    const catalog = availableProducts.length > 0 ? availableProducts : MOCK_PRODUCTS;
    const ranked = rankProductsForQuery(text, catalog, 3);

    if (ranked.length > 0) {
      const itemsList = ranked
        .map((p, idx) => `${idx + 1}. **${p.name}** (${Number(p.pricePerDay).toLocaleString("vi-VN")}đ/ngày) [PRODUCT:${p.id}]`)
        .join("\n");
      
      return `### 💡 Đề xuất sản phẩm từ RentHub dành cho bạn:
Tôi đã tìm thấy một số món đồ cho thuê rất phù hợp với nhu cầu của bạn trên RentHub:

${itemsList}

Bạn có thể bấm trực tiếp nút **Yêu thích (Tim)** để lưu lại hoặc nhấn **Thuê ngay** để đặt đơn hàng nhé!`;
    }

    // 2. Fallback to predefined keywords Q&A
    const clean = text.toLowerCase();
    for (const item of LOCAL_QA) {
      for (const kw of item.keywords) {
        if (clean.includes(kw)) {
          return item.reply;
        }
      }
    }
    return DEFAULT_AI_RESPONSE;
  };

  const callLiveAI = async (prompt: string, accId: string, token: string, proxy: string | null) => {
    let endpoint = `https://api.cloudflare.com/client/v4/accounts/${accId}/ai/run/@cf/meta/llama-3-8b-instruct`;
    if (proxy) {
      const base = proxy.endsWith("/") ? proxy : proxy + "/";
      endpoint = `${base}client/v4/accounts/${accId}/ai/run/@cf/meta/llama-3-8b-instruct`;
    }

    // Rank products first to build a focused catalog of 5 relevant products
    const catalog = availableProducts.length > 0 ? availableProducts : MOCK_PRODUCTS;
    const relevantProducts = rankProductsForQuery(prompt, catalog, 5);
    
    // Fallback to top 5 catalog if no specific match
    const catalogToUse = relevantProducts.length > 0 ? relevantProducts : catalog.slice(0, 5);

    const catalogSummary = catalogToUse
      .map((p) => `- ID ${p.id}: ${p.name} (Giá: ${Number(p.pricePerDay).toLocaleString("vi-VN")}đ/ngày, Danh mục: ${p.category?.name || "Khác"})`)
      .join("\n");

    const systemPrompt = `Bạn là Trợ lý Mua sắm & Thuê đồ thông minh RentHub AI, hoạt động trên Cloudflare Workers AI.
Nhiệm vụ của bạn là tư vấn nhiệt tình và gợi ý sản phẩm cho thuê phù hợp với nhu cầu của khách hàng.

Dưới đây là danh sách sản phẩm hiện đang có sẵn trên hệ thống RentHub phù hợp nhất với yêu cầu:
${catalogSummary}

LƯU Ý QUAN TRỌNG: Khi đề xuất một mặt hàng cụ thể từ danh sách trên, bạn BẮT BUỘC phải chèn thẻ [PRODUCT:id] (với id là số ID của sản phẩm) ở vị trí phù hợp trong đoạn văn để hệ thống hiển thị thẻ sản phẩm trực quan.
Ví dụ: "Bạn có thể tham khảo thuê máy ảnh Sony Alpha A7 III [PRODUCT:1] để ghi lại những tấm hình đẹp."
Hãy phản hồi bằng tiếng Việt thân thiện, tự nhiên. Không tự chế sản phẩm không có trong danh sách trên.`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });

      setIsTyping(false);

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`HTTP ${response.status} - ${errBody}`);
      }

      const data = await response.json();
      if (data.success && data.result && data.result.response) {
        setMessages((prev) => [...prev, { sender: "assistant", text: data.result.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "assistant", text: `API Cloudflare trả về kết quả lỗi: ${JSON.stringify(data)}` }
        ]);
      }
    } catch (err: any) {
      setIsTyping(false);
      // Fallback message with CORS instructions
      const errTxt = `### ⚠️ Lỗi kết nối Live Cloudflare Workers AI API
Chi tiết: \`${err.message}\`

#### 💡 Cách khắc phục:
1. **CORS Block**: Trình duyệt chặn trực tiếp request đến Cloudflare API vì lý do an toàn. Hãy bật **CORS Proxy** trong tab Cấu hình (click nút Bánh răng ⚙️ ở đầu khung chat).
2. **Offline Simulator**: chatbot đã tự động chuyển sang chế độ Simulator. Bạn vẫn có thể hỏi các câu hỏi thông dụng để bot trỏ sản phẩm từ danh mục!`;
      setMessages((prev) => [...prev, { sender: "assistant", text: errTxt }]);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Header />

      {/* Main chat widget view */}
      <main className="flex-1 max-w-[800px] w-full mx-auto flex flex-col p-4 overflow-hidden relative" style={{ height: "calc(100vh - 70px)" }}>
        
        {/* Chat header panel */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-t-2xl px-5 py-3.5 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">Trợ lý Thuê đồ RentHub AI</h3>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                {isConnected ? "Cloudflare Workers AI Llama 3" : "Simulated Local Engine"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([{ sender: "assistant", text: LOCAL_QA[0].reply }])}
              className="p-2 hover:bg-zinc-55 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 transition-colors text-xs font-semibold cursor-pointer"
              title="Xóa cuộc trò chuyện"
            >
              🧹 Xóa chat
            </button>
            <button
              onClick={() => setConfigOpen(!configOpen)}
              className="p-2 hover:bg-zinc-55 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-200 transition-colors text-base cursor-pointer"
              title="Cấu hình Cloudflare AI"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Configuration Overlay Panel */}
        {configOpen && (
          <div className="bg-white dark:bg-zinc-900 border-x border-b border-zinc-150 dark:border-zinc-800 p-4 space-y-4 shadow-md z-20 shrink-0">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
              <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                Cấu hình Cloudflare Workers AI
              </span>
              <button onClick={() => setConfigOpen(false)} className="text-zinc-400 hover:text-zinc-700 text-sm font-bold cursor-pointer">
                Đóng
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-500">Cloudflare Account ID</label>
                <input
                  type="password"
                  value={cfConfig.accountId}
                  onChange={(e) => setCfConfig((p) => ({ ...p, accountId: e.target.value }))}
                  placeholder="Nhập Cloudflare Account ID"
                  className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-zinc-500">Cloudflare API Token</label>
                <input
                  type="password"
                  value={cfConfig.token}
                  onChange={(e) => setCfConfig((p) => ({ ...p, token: e.target.value }))}
                  placeholder="Nhập Cloudflare API Token"
                  className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-bold text-zinc-500">Worker CORS Proxy URL (Khuyên dùng để tránh chặn CORS)</label>
              <input
                type="text"
                value={cfConfig.proxy}
                onChange={(e) => setCfConfig((p) => ({ ...p, proxy: e.target.value }))}
                placeholder="e.g. https://my-cors-proxy.workers.dev"
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div className="flex gap-2 text-xs">
              <button
                onClick={handleSaveConfig}
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold shadow cursor-pointer transition-colors"
              >
                Lưu cấu hình
              </button>
              <button
                onClick={handleClearConfig}
                className="py-2 px-4 border border-zinc-200 dark:border-zinc-700 text-zinc-500 rounded-lg font-bold cursor-pointer transition-colors"
              >
                Xóa cấu hình
              </button>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div ref={chatContainerRef} className="flex-1 bg-white dark:bg-zinc-950 border-x border-zinc-150 dark:border-zinc-800 p-4 overflow-y-auto space-y-4 shadow-inner">
          {messages.map((msg, i) => {
            const productIds = extractProductIds(msg.text);
            const cleanedText = cleanMessageText(msg.text);
            const catalog = availableProducts.length > 0 ? availableProducts : MOCK_PRODUCTS;

            return (
              <div
                key={i}
                className={`flex gap-3 max-w-[85%] animate-fadeIn ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold shadow-sm text-sm ${
                    msg.sender === "user"
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-violet-600 dark:text-violet-400 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {msg.sender === "user" ? "👤" : "🧡"}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div
                    className={`py-3 px-4.5 rounded-2xl border text-sm leading-relaxed shadow-sm relative ${
                      msg.sender === "user"
                        ? "bg-violet-50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900 rounded-tr-none text-zinc-900 dark:text-zinc-100"
                        : "bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-tl-none border-l-4 border-l-orange-500"
                    }`}
                  >
                    <MarkdownRenderer text={cleanedText} />
                  </div>

                  {/* Inline product recommendations cards grid */}
                  {productIds.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {productIds.map((pId) => {
                        const matchedProduct = catalog.find((p) => p.id === pId);
                        if (!matchedProduct) return null;
                        return <ChatProductCard key={pId} prod={matchedProduct} />;
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-violet-600 shrink-0 font-bold shadow-sm">
                🧡
              </div>
              <div className="py-3 px-5 rounded-2xl border border-zinc-250 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 rounded-tl-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200" />
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}
        </div>

        {/* Input Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-b-2xl p-4 shadow-sm shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.slice(2).trim())} // strip emoji when sending
                className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-400 text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-colors"
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
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Bạn muốn thuê món đồ gì hôm nay?..."
              className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl p-2.5 cursor-pointer shadow-sm hover:scale-[1.03] transition-all flex items-center justify-center shrink-0"
              title="Gửi"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
