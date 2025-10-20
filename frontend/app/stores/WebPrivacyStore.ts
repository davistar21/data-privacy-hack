import { create } from "zustand";

export type CookiePreference = "accept_all" | "essential_only" | "reject_all";

interface WebsiteConsent {
  id: string;
  name: string;
  domain: string;
  status: CookiePreference;
}

interface WebPrivacyState {
  globalPreference: CookiePreference;
  websites: WebsiteConsent[];
  setGlobalPreference: (pref: CookiePreference) => void;
  toggleWebsiteStatus: (id: string, newStatus: CookiePreference) => void;
}

export const useWebPrivacyStore = create<WebPrivacyState>((set) => ({
  globalPreference: "essential_only",
  websites: [
    {
      id: "1",
      name: "Nairaland",
      domain: "nairaland.com",
      status: "accept_all",
    },
    { id: "2", name: "GTBank", domain: "gtbank.com", status: "essential_only" },
    {
      id: "3",
      name: "Pulse Nigeria",
      domain: "pulse.ng",
      status: "reject_all",
    },
  ],
  setGlobalPreference: (pref) =>
    set((state) => ({
      globalPreference: pref,
      websites: state.websites.map((w) => ({ ...w, status: pref })),
    })),
  toggleWebsiteStatus: (id, newStatus) =>
    set((state) => ({
      websites: state.websites.map((w) =>
        w.id === id ? { ...w, status: newStatus } : w
      ),
    })),
}));
