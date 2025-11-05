import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import { X, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminChatbotStore as useChatbotStore } from "../stores/AdminChatbotStore";
import { sendNinaAdminMessage } from "../utils/sendNinaAdminMessage";

export default function AdminChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { messages, addMessage, clearChat } = useChatbotStore();

  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Generate compliance report",
    "Show current data requests",
    "Summarize privacy policies",
    "Check compliance health",
  ];

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    addMessage({
      from: "user",
      text: content,
      timestamp: new Date().toISOString(),
    });
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendNinaAdminMessage(content);
      addMessage({
        from: "bot",
        text: res,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition"
      >
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 z-50 flex flex-col w-full max-w-[680px] bg-gray-950 text-gray-100 shadow-xl max-h-[80vh] mx-auto rounded-t-2xl md:rounded-2xl border border-gray-800 overflow-hidden"
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 25 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 bg-[color:var(--color-primary)] text-white">
                <h2 className="font-semibold text-lg">
                  NDPR Compliance Assistant
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearChat}
                    className="text-sm text-muted-foreground bg-[color:var(--color-primary-foreground)] px-3 py-1 rounded)] rounded-xl"
                  >
                    Clear
                  </button>
                  <button onClick={() => setOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div
                ref={containerRef}
                className="lex-1 overflow-y-auto p-4 space-y-3 bg-[color:var(--color-background)] dark:bg-[color:var(--color-sidebar)]"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`prose p-3 rounded-lg w-fit max-w-[80%] ${
                      m.from === "bot"
                        ? "bg-[color:var(--color-muted)] dark:bg-[color:var(--color-muted-foreground)] text-[color:var(--color-foreground)] dark:text-[color:var(--color-primary-foreground)]"
                        : "bg-[color:var(--color-primary)] text-white ml-auto"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {m.text}
                    </ReactMarkdown>
                  </div>
                ))}
                {isLoading && (
                  <div className="custom-loader">
                    <div className="flex gap-1.5">
                      <hr />
                      <hr />
                      <hr />
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="p-3 flex flex-wrap gap-2 border-t border-gray-300 dark:border-[color:var(--color-border)] bg-[color:var(--color-card)] dark:bg-[color:var(--color-sidebar)]">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-sm text-foreground bg-white dark:bg-[color:var(--color-card)] border border-gray-300 dark:border-[color:var(--color-border)] px-3 py-1.5 rounded hover:bg-[color:var(--color-primary-foreground)] dark:hover:bg-[color:var(--color-primary)] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 flex gap-2 border-t dark:border-[color:var(--color-border)] bg-white dark:bg-[color:var(--color-sidebar)]">
                <input
                  type="text"
                  className="flex-1 border rounded-lg p-2 bg-gray-100 dark:bg-[color:var(--color-muted)] text-gray-900 dark:text-white"
                  placeholder="Ask about reports, requests, or NDPR compliance..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading}
                  className="bg-[color:var(--color-primary)] text-white px-4 rounded-lg hover:bg-[color:var(--color-primary-foreground)]"
                >
                  Send
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
