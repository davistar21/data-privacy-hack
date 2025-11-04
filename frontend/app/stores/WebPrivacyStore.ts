import { create } from "zustand";
import { useConsentStore } from "./ConsentStore";
import type {
  CookieAuditEvent,
  GlobalPreference,
  OrgAuditEvent,
} from "../types";
import { useNotificationStore } from "./NotificationStore";
export type CookieCategory =
  | "essential"
  | "analytics"
  | "marketing"
  | "third_party";
export type CategoryStatus = "enabled" | "disabled" | "allow_once";
export type CookieSite = {
  id: string;
  name: string;
  domain: string;
  thirdParties: string[];
  reputation: number;
  categories: Record<CookieCategory, CategoryStatus>;
  riskScore?: number;
};

type WebPrivacyState = {
  cookieLogs: CookieAuditEvent[];
  appendCookieLog: (event: CookieAuditEvent) => void;
  websites: CookieSite[];
  globalPreference: GlobalPreference["globalPreference"];
  loadSites: () => void;
  setGlobalPreference: (pref: WebPrivacyState["globalPreference"]) => void;
  toggleCategory: (
    siteId: string,
    category: CookieCategory,
    next: CategoryStatus
  ) => Promise<{ success: boolean; requestId?: string }>;
  computeRiskScore: (site: CookieSite) => number;
  resetSessionAllowOnce: () => void;
};

export const useWebPrivacyStore = create<WebPrivacyState>((set, get) => {
  const seed: CookieSite[] = [
    {
      id: "site-1",
      name: "DailyNews NG",
      domain: "dailynews.ng",
      thirdParties: ["ads.example.net", "trk.analytics.io"],
      reputation: 45,
      categories: {
        essential: "enabled",
        analytics: "enabled",
        marketing: "enabled",
        third_party: "enabled",
      },
    },
    {
      id: "site-2",
      name: "ShopNaija",
      domain: "shopnaija.com",
      thirdParties: [
        "payments.partner",
        "ads.example.net",
        "recommend.shoplib",
      ],
      reputation: 70,
      categories: {
        essential: "enabled",
        analytics: "enabled",
        marketing: "disabled",
        third_party: "enabled",
      },
    },
    {
      id: "site-3",
      name: "LocalForum",
      domain: "localforum.ng",
      thirdParties: ["cdn.thirdparty", "analytics.party"],
      reputation: 30,
      categories: {
        essential: "enabled",
        analytics: "enabled",
        marketing: "enabled",
        third_party: "enabled",
      },
    },
  ];

  const computeRiskScore = (site: CookieSite) => {
    const tpScore = Math.min(50, site.thirdParties.length * 12);
    const reputationFactor = Math.max(0, 50 - Math.round(site.reputation / 2));
    const catPenalty =
      (site.categories.marketing === "enabled" ? 15 : 0) +
      (site.categories.third_party === "enabled" ? 20 : 0) +
      (site.categories.analytics === "enabled" ? 5 : 0);
    const score = Math.min(100, tpScore + reputationFactor + catPenalty);
    return score;
  };

  return {
    websites: seed.map((s) => ({ ...s, riskScore: computeRiskScore(s) })),
    globalPreference: "essential_only",
    cookieLogs: [],
    appendCookieLog: (event) =>
      set((s) => ({ cookieLogs: [event, ...s.cookieLogs] })),
    loadSites: async () => {
      set((s) => {
        const notify = useNotificationStore.getState();
        s.websites.forEach((site) => {
          if (site.riskScore && site.riskScore > 80) {
            notify.addNotification({
              id: crypto.randomUUID(),
              type: "data-alert",
              message: `High privacy risk detected on ${site.name} (${site.domain})`,
              timestamp: new Date().toISOString(),
              read: false,
              meta: { riskScore: site.riskScore, domain: site.domain },
            });
          }
        });

        return {
          websites: s.websites.map((w) => ({
            ...w,
            riskScore: computeRiskScore(w),
          })),
        };
      });
    },

    setGlobalPreference: (pref) => {
      set({ globalPreference: pref });

      set((state) => {
        const updated = state.websites.map((site) => {
          const newCategories = { ...site.categories };
          if (pref === "accept_all") {
            newCategories.analytics = "enabled";
            newCategories.marketing = "enabled";
            newCategories.third_party = "enabled";
          } else if (pref === "essential_only") {
            newCategories.analytics = "disabled";
            newCategories.marketing = "disabled";
            newCategories.third_party = "disabled";
          } else if (pref === "reject_all") {
            newCategories.analytics = "disabled";
            newCategories.marketing = "disabled";
            newCategories.third_party = "disabled";
          }
          return {
            ...site,
            categories: newCategories,
            riskScore: computeRiskScore({ ...site, categories: newCategories }),
          };
        });
        return { websites: updated };
      });
    },

    computeRiskScore: (site) => computeRiskScore(site),

    toggleCategory: async (siteId, category, next) => {
      const consentStore = useConsentStore.getState();
      const site = get().websites.find((s) => s.id === siteId);
      if (!site) return { success: false };

      if (category === "essential" && next === "disabled") {
        return { success: false };
      }

      const old = site.categories[category];

      set((state) => ({
        websites: state.websites.map((w) =>
          w.id === siteId
            ? {
                ...w,
                categories: { ...w.categories, [category]: next },
                riskScore: get().computeRiskScore({
                  ...w,
                  categories: { ...w.categories, [category]: next },
                }),
              }
            : w
        ),
      }));
      const eventType =
        next === "disabled"
          ? "cookie_revoked"
          : next === "allow_once"
            ? "cookie_allowed_once"
            : "cookie_enabled";

      const requestId = crypto.randomUUID();
      const now = new Date().toISOString();
      const categoryKey = `cookies.${category}`;
      const pending = {
        id: requestId,
        requestId,
        type: eventType,
        userId: consentStore.userId,
        orgId: site.domain,
        message:
          next === "disabled"
            ? `Revoked ${category} cookies for ${site.domain}`
            : next === "allow_once"
              ? `Allowed ${category} cookies once for ${site.domain}`
              : `Enabled ${category} cookies for ${site.domain}`,
        timestamp: now,
        status: "pending",
        fields: [categoryKey],
        meta: {
          siteId: site.id,
          domain: site.domain,
          category,
          oldStatus: old,
          newStatus: next,
        },
      } as any;

      consentStore.addLocalLog(pending);
      console.log("pending", pending);
      console.log(consentStore.auditLogs, "logs");

      setTimeout(
        () => {
          const success = Math.random() > 0.06;
          const finalStatus = success ? "completed" : "failed";
          const finalMessage =
            next === "disabled"
              ? `Cookie revoke processed: ${category} cookies disabled for ${site.domain}`
              : next === "allow_once"
                ? `Cookie allowed once: ${category} cookies allowed for ${site.domain}`
                : `Cookie enabled: ${category} cookies enabled for ${site.domain}`;

          const completed = {
            id: crypto.randomUUID(),
            requestId,
            type: eventType,
            userId: consentStore.userId,
            orgId: site.domain,
            message: finalMessage,
            timestamp: new Date().toISOString(),
            status: finalStatus,
            fields: [categoryKey],
            meta: {
              siteId: site.id,
              domain: site.domain,
              category,
              result: finalStatus,
            },
          } as any;

          consentStore.addLocalLog(completed);
          get().appendCookieLog({
            id: crypto.randomUUID(),
            type: eventType,
            userId: consentStore.userId,
            siteDomain: site.domain,
            siteName: site.name,
            message: completed.message,
            fields: [categoryKey],
            timestamp: completed.timestamp,
            status: finalStatus,
            meta: completed.meta,
          });
          // notify user of cookie change
          useNotificationStore.getState().addNotification({
            id: crypto.randomUUID(),
            type: "cookie",
            message: completed.message,
            timestamp: completed.timestamp,
            read: false,
            meta: { domain: site.domain, category },
          });
        },
        2200 + Math.floor(Math.random() * 2000)
      );

      return { success: true, requestId };
    },

    resetSessionAllowOnce: () => {
      set((s) => ({
        websites: s.websites.map((w) => {
          const categories = { ...w.categories };
          (Object.keys(categories) as CookieCategory[]).forEach((cat) => {
            if (categories[cat] === "allow_once") categories[cat] = "disabled";
          });
          return {
            ...w,
            categories,
            riskScore: get().computeRiskScore({ ...w, categories }),
          };
        }),
      }));
    },
  };
});
