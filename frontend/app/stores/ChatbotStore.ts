import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  from: "user" | "bot";
  text: string;
  timestamp: string;
}

interface UserChatbotState {
  messages: ChatMessage[];
  isOpen: boolean; // New state to track the chatbot's open/closed status
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  setOpen: (open: boolean) => void; // Action to set the open state
}

export const useUserChatbotStore = create<UserChatbotState>()(
  persist(
    (set) => ({
      messages: [
        {
          from: "bot",
          text: "👋 Hi! I'm Nina, your NDPR assistant. How can I help you today?",
          timestamp: new Date().toISOString(),
        },
      ],
      isOpen: false, // Default state is closed

      // Action to add a message to the chat history
      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      // Action to clear the chat history
      clearChat: () =>
        set({
          messages: [
            {
              from: "bot",
              text: "👋 How can I assist you today with NDPR or privacy compliance?",
              timestamp: new Date().toISOString(),
            },
          ],
        }),

      // Action to toggle the chatbot's open/closed state
      setOpen: (open: boolean) => set({ isOpen: open }),
    }),
    {
      name: "ndpr-chat-history-user",
      partialize: (state): Partial<UserChatbotState> => ({
        messages: state.messages,
        isOpen: state.isOpen, // Persist the open state as well
      }),
    }
  )
);
