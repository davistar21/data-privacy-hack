import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  from: "user" | "bot";
  text: string;
  timestamp: string;
}

interface AdminChatbotState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

export const useAdminChatbotStore = create<AdminChatbotState>()(
  persist(
    (set) => ({
      messages: [
        {
          from: "bot",
          text: "🧭 Hi! I'm Nina, your NDPR compliance assistant. Ready to help you with governance and reports.",
          timestamp: new Date().toISOString(),
        },
      ],

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      clearChat: () =>
        set({
          messages: [
            {
              from: "bot",
              text: "How can I assist you with compliance reporting or data governance today?",
              timestamp: new Date().toISOString(),
            },
          ],
        }),
    }),
    {
      name: "ndpr-chat-history-admin",
      partialize: (state): Partial<AdminChatbotState> => ({
        messages: state.messages,
      }),
    }
  )
);
