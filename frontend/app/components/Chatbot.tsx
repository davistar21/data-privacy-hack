import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import { useRef, useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserChatbotStore as useChatbotStore } from "../stores/ChatbotStore"; // Using the updated store
import { sendNinaMessage } from "../utils/sendNinaMessage"; // existing sendNinaMessage function

export const sendMessage = async (text: string) => {
  const { addMessage, setOpen } = useChatbotStore.getState(); // Accessing Zustand store state
  const message = text.trim();
  if (!message) return;

  // Open the chatbot if it's not already open
  setOpen(true);

  const userMsg = {
    from: "user" as const,
    text: message,
    timestamp: new Date().toISOString(),
  };
  addMessage(userMsg);

  try {
    const res = await sendNinaMessage(message);
    const botMsg = {
      from: "bot" as const,
      text: res,
      timestamp: new Date().toISOString(),
    };

    addMessage(botMsg);
  } catch (error) {
    console.error("Error sending message to Nina:", error);
  }
};

export default function Chatbot() {
  const { isOpen, setOpen, messages, addMessage, clearChat } =
    useChatbotStore(); // Accessing Zustand store
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "How do I use this app?",
    "How do I revoke consent?",
    "Explain NDPR rights",
    "What happens if a company misuses my data?",
  ];

  const handleMessageSend = async (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    const userMsg = {
      from: "user" as const,
      text: message,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMsg);
    setInput("");
    setIsLoading(true);

    try {
      const res = await sendNinaMessage(message);
      const botMsg = {
        from: "bot" as const,
        text: res,
        timestamp: new Date().toISOString(),
      };

      addMessage(botMsg);
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
      {/* Button to open/close chatbot */}
      <button
        onClick={() => setOpen(!isOpen)} // Toggle chatbot visibility based on `isOpen`
        className="fixed bottom-6 right-6 z-50 bg-[color:var(--color-primary)] text-white rounded-full p-4 shadow-xl hover:text-muted-foreground hover:bg-[color:var(--color-primary-foreground)] transition"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Modal dialog for the chatbot */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
              onClick={() => setOpen(false)} // Close the chatbot when clicking the overlay
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
                <div className="font-semibold text-lg">NDPR Assistant</div>
                <div className="flex gap-2">
                  <button
                    onClick={clearChat}
                    className="text-sm text-muted-foreground bg-[color:var(--color-primary-foreground)] px-3 py-1 rounded)]"
                  >
                    Clear
                  </button>
                  <button onClick={() => setOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-[color:var(--color-background)] dark:bg-[color:var(--color-sidebar)]"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg w-fit max-w-[80%] ${
                      m.from === "bot"
                        ? "bg-[color:var(--color-muted)] dark:bg-[color:var(--color-muted-foreground)] text-[color:var(--color-foreground)] dark:text-[color:var(--color-primary-foreground)]"
                        : "bg-[color:var(--color-primary)] text-white ml-auto"
                    }`}
                  >
                    <div className="prose">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {m.text}
                      </ReactMarkdown>
                    </div>
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
                    onClick={() => handleMessageSend(s)}
                    className="text-sm bg-white text-[var(--sea-dark-700)] font-medium border border-gray-300 dark:border-[color:var(--color-border)] px-3 py-1.5 rounded hover:bg-[color:var(--color-primary-foreground)] dark:hover:bg-[color:var(--color-primary)] transition"
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
                  placeholder="Ask about NDPR, compliance, or data privacy..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleMessageSend()}
                />
                <button
                  onClick={() => handleMessageSend()}
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
