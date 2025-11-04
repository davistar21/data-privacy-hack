// src/stores/marketplaceStore.ts
import { create } from "zustand";
import type { ReuseOffer, BenefitRecord } from "../types";
import { useConsentStore } from "./ConsentStore";
import { useNotificationStore } from "./NotificationStore";
import { persist } from "zustand/middleware";

type MarketplaceState = {
  offers: ReuseOffer[];
  benefits: BenefitRecord[];
  loadingOffers: boolean;

  // existing actions
  loadOffers: () => Promise<void>;
  acceptOffer: (
    offerId: string
  ) => Promise<{ success: boolean; requestId?: string }>;
  undoAccept: (requestId: string) => Promise<void>;
  clearOffers: () => void;
  benefitOptions: string[];
  fieldOptions: string[];
  // new CRUD actions
  addOffer: (offer: Omit<ReuseOffer, "id">) => Promise<ReuseOffer>;
  updateOffer: (offer: ReuseOffer) => Promise<ReuseOffer | null>;
  deleteOffer: (offerId: string) => Promise<boolean>;
};

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => {
      // initial seeded offers (kept small, admin can add more)
      // seeded benefit and field options
      const seededBenefits = [
        "₦5.00 voucher",
        "1% cashback",
        "Free delivery",
        "Premium feature access",
        "Gift card",
      ];

      const seededFields = [
        "email",
        "phone",
        "purchase_history",
        "transaction_history",
        "location",
        "preferences",
      ];

      const seeded: ReuseOffer[] = [
        {
          id: crypto.randomUUID(),
          orgId: "zenith",
          orgName: "Zenith Bank",
          fields: ["email", "transaction_history"],
          benefit: "₦5.00 voucher",
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          summary: "Share email + transaction metadata for a ₦5.00 voucher.",
        },
        {
          id: crypto.randomUUID(),
          orgId: "ecomshop",
          orgName: "EcomShop",
          fields: ["purchase_history"],
          benefit: "1% cashback",
          expiresAt: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
          summary: "Help us personalise offers and get 1% cashback.",
        },
      ];

      return {
        offers: seeded,
        benefits: [],
        loadingOffers: false,
        // add these 👇
        benefitOptions: seededBenefits,
        fieldOptions: seededFields,
        loadOffers: async () => {
          // in real app: fetch from API. Here we set seeded offers (idempotent).
          set({ loadingOffers: true });
          try {
            // simulate latency if necessary
            await new Promise((r) => setTimeout(r, 200));
            set({ offers: seeded, loadingOffers: false });
          } catch (err) {
            set({ loadingOffers: false });
            console.error(err);
          }
        },

        acceptOffer: async (offerId: string) => {
          const offer = (get().offers || []).find((o) => o.id === offerId);
          if (!offer) return { success: false };

          const consentStore = useConsentStore.getState();
          const uid = consentStore.userId;
          const requestId = crypto.randomUUID();
          const now = new Date().toISOString();

          // optimistic pending audit
          const pendingAudit = {
            id: requestId,
            requestId,
            type: "reuse_accepted",
            userId: uid,
            orgId: offer.orgId,
            message: `Offer accepted: ${offer.orgName} — ${offer.benefit}`,
            timestamp: now,
            status: "pending",
            fields: offer.fields,
            meta: { benefit: offer.benefit, offerId: offer.id },
          } as any;

          consentStore.addLocalLog(pendingAudit);

          // add benefit ledger entry
          const benefitRecord: BenefitRecord = {
            id: crypto.randomUUID(),
            requestId,
            reuseOfferId: offer.id,
            userId: uid,
            orgId: offer.orgId,
            benefit: offer.benefit,
            status: "pending",
            issuedAt: now,
            expiresAt: offer.expiresAt,
          };
          set((s) => ({ benefits: [benefitRecord, ...s.benefits] }));

          // notify user via notification store
          useNotificationStore.getState().addNotification({
            id: crypto.randomUUID(),
            type: "marketplace",
            message: `You accepted ${offer.orgName}'s reuse offer — ${offer.benefit}`,
            timestamp: now,
            read: false,
            meta: { offerId: offer.id, orgId: offer.orgId },
          } as any);

          // fake processing -> complete
          setTimeout(() => {
            const completedAudit = {
              id: crypto.randomUUID(),
              requestId,
              type: "reuse_accepted",
              userId: uid,
              orgId: offer.orgId,
              message: `Data reuse accepted and benefit issued: ${offer.benefit}`,
              timestamp: new Date().toISOString(),
              status: "completed",
              fields: offer.fields,
              meta: { benefit: offer.benefit, offerId: offer.id },
            } as any;
            useConsentStore.getState().addLocalLog(completedAudit);
            useNotificationStore.getState().addNotification({
              id: crypto.randomUUID(),
              type: "marketplace",
              message: `Your benefit from ${offer.orgName} has been issued: ${offer.benefit}`,
              timestamp: new Date().toISOString(),
              read: false,
              meta: { offerId: offer.id, orgId: offer.orgId },
            } as any);

            // update benefit ledger
            set((s) => ({
              benefits: s.benefits.map((b) =>
                b.requestId === requestId
                  ? {
                      ...b,
                      status: "issued",
                      issuedAt: new Date().toISOString(),
                    }
                  : b
              ),
            }));

            // notify org admin via org logs
            useConsentStore.getState().appendOrgLog(offer.orgId, {
              id: crypto.randomUUID(),
              type: "reuse_accepted",
              userId: uid,
              userName: undefined,
              orgId: offer.orgId,
              orgName: offer.orgName,
              message: `User accepted reuse offer. Benefit: ${offer.benefit}`,
              fields: offer.fields,
              timestamp: new Date().toISOString(),
              status: "completed",
              meta: { requestId, offerId: offer.id, benefit: offer.benefit },
            } as any);
          }, 3000);

          return { success: true, requestId };
        },

        undoAccept: async (requestId: string) => {
          const consentStore = useConsentStore.getState();
          const now = new Date().toISOString();

          const b = get().benefits.find((x) => x.requestId === requestId);
          if (!b) return;

          // add audit for reuse_revoked
          const undoAudit = {
            id: crypto.randomUUID(),
            requestId: `${requestId}-undo`,
            type: "reuse_revoked",
            userId: consentStore.userId,
            orgId: b.orgId,
            message: `User revoked previously accepted reuse (undo).`,
            timestamp: now,
            status: "completed",
          } as any;

          consentStore.addLocalLog(undoAudit);

          // update ledger
          set((s) => ({
            benefits: s.benefits.map((ben) =>
              ben.requestId === requestId ? { ...ben, status: "revoked" } : ben
            ),
          }));

          // push org-level event
          if (b.orgId) {
            consentStore.appendOrgLog(b.orgId, {
              id: crypto.randomUUID(),
              type: "reuse_revoked",
              userId: consentStore.userId,
              orgId: b.orgId,
              message: `User revoked reuse acceptance (undo).`,
              fields: [],
              timestamp: new Date().toISOString(),
              status: "completed",
              meta: { requestId },
            } as any);
          }
        },

        clearOffers: () => set({ offers: [] }),

        // --------------------------
        // CRUD implementations below
        // --------------------------
        addOffer: async (offerPayload) => {
          // build full offer
          const newOffer: ReuseOffer = {
            id: crypto.randomUUID(),
            orgId: offerPayload.orgId,
            orgName: offerPayload.orgName,
            fields: offerPayload.fields || [],
            benefit: offerPayload.benefit,
            summary: offerPayload.summary || "",
            expiresAt:
              offerPayload.expiresAt ||
              new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          };
          set((s) => ({ offers: [newOffer, ...s.offers] }));

          // notify org admins (append org log) and users via notification store
          useConsentStore.getState().appendOrgLog(newOffer.orgId, {
            id: crypto.randomUUID(),
            type: "audit",
            userId: undefined,
            orgId: newOffer.orgId,
            orgName: newOffer.orgName,
            message: `Offer created: ${newOffer.summary || newOffer.benefit}`,
            fields: newOffer.fields,
            timestamp: new Date().toISOString(),
            status: "completed",
          } as any);

          useNotificationStore.getState().addNotification({
            id: crypto.randomUUID(),
            type: "marketplace",
            message: `New data reuse offer from ${newOffer.orgName}: ${newOffer.benefit}`,
            timestamp: new Date().toISOString(),
            read: false,
            meta: { offerId: newOffer.id, orgId: newOffer.orgId },
          } as any);

          return newOffer;
        },

        updateOffer: async (offer) => {
          let found = false;
          set((s) => {
            const next = s.offers.map((o) => {
              if (o.id === offer.id) {
                found = true;
                return { ...o, ...offer };
              }
              return o;
            });
            return { offers: next };
          });

          if (!found) return null;

          // append org log about change
          useConsentStore.getState().appendOrgLog(offer.orgId, {
            id: crypto.randomUUID(),
            type: "audit",
            userId: undefined,
            orgId: offer.orgId,
            orgName: offer.orgName,
            message: `Offer updated: ${offer.summary || offer.benefit}`,
            fields: offer.fields,
            timestamp: new Date().toISOString(),
            status: "completed",
          } as any);

          return offer;
        },

        deleteOffer: async (offerId) => {
          const existing = (get().offers || []).find((o) => o.id === offerId);
          if (!existing) return false;

          set((s) => ({ offers: s.offers.filter((o) => o.id !== offerId) }));

          // append org log about deletion
          useConsentStore.getState().appendOrgLog(existing.orgId, {
            id: crypto.randomUUID(),
            type: "audit",
            userId: undefined,
            orgId: existing.orgId,
            orgName: existing.orgName,
            message: `Offer deleted: ${existing.summary || existing.benefit}`,
            fields: existing.fields,
            timestamp: new Date().toISOString(),
            status: "completed",
          } as any);

          return true;
        },
      };
    },
    {
      name: "marketplace-store",
      partialize: (s) => ({ offers: s.offers }),
    }
  )
);
