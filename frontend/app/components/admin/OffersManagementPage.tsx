// src/pages/admin/OffersManagementPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useMarketplaceStore } from "../../stores/MarketPlaceStore";
import type { Organization, ReuseOffer } from "~/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
// import { Textarea } from "../../components/ui/textarea"; // if you have it; fallback to Input
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { orgs } from "../../../constants/org";
import { useParams } from "react-router";
import { Separator } from "../ui/separator";

export default function OffersManagementPage() {
  const {
    offers,
    loadOffers,
    clearOffers,
    addOffer,
    updateOffer,
    deleteOffer,
    loadingOffers,
  } = useMarketplaceStore();

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);
  const { orgId } = useParams();
  const [editing, setEditing] = useState<ReuseOffer | null>(null);
  const [formState, setFormState] = useState({
    orgId: "",
    orgName: "",
    benefit: "",
    summary: "",
    fieldsText: "",
    expiresAt: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // when editing changes, populate form
    if (editing) {
      setFormState({
        orgId: editing.orgId,
        orgName: editing.orgName || "",
        benefit: editing.benefit,
        summary: editing.summary || "",
        fieldsText: (editing.fields || []).join(", "),
        expiresAt: editing.expiresAt ? editing.expiresAt.slice(0, 10) : "",
      });
    } else {
      setFormState({
        orgId: "",
        orgName: "",
        benefit: "",
        summary: "",
        fieldsText: "",
        expiresAt: "",
      });
    }
  }, [editing]);

  const onChange = (patch: Partial<typeof formState>) =>
    setFormState((s) => ({ ...s, ...patch }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const orgName = orgs.find((org) => org.id == orgId)?.name;
      const fields = formState.fieldsText
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
      const payload = {
        orgId: orgId!,
        orgName,
        benefit: formState.benefit,
        summary: formState.summary,
        fields,
        expiresAt:
          formState.expiresAt && formState.expiresAt.length
            ? new Date(formState.expiresAt).toISOString()
            : new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      };

      if (editing) {
        // update
        await updateOffer({
          ...(editing as ReuseOffer),
          ...payload,
        });
      } else {
        // create
        await addOffer(payload);
      }
      // reset form
      setEditing(null);
      setFormState({
        orgId: "",
        orgName: "",
        benefit: "",
        summary: "",
        fieldsText: "",
        expiresAt: "",
      });
    } catch (err) {
      console.error(err);
      // optional: show toast
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (o: ReuseOffer) => {
    setEditing(o);
    // form will populate via effect
    window.scrollTo({ top: 600, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm(
      "Delete this offer? This action cannot be undone."
    );
    if (!ok) return;
    try {
      await deleteOffer(id);
    } catch (err) {
      console.error(err);
    }
  };

  const sortedOffers = useMemo(
    () =>
      [...offers]
        .filter((offer) => offer.orgId === orgId)
        .sort((a, b) => {
          // upcoming expiry first, then newest
          const aDate = new Date(a.expiresAt!).getTime();
          const bDate = new Date(b.expiresAt!).getTime();
          return aDate - bDate;
        }),
    [offers]
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Offers Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => clearOffers()}>
            Clear Offers
          </Button>
        </div>
      </div>

      {/* Add / Edit Form */}
      <Card className="border-teal-600 border-1">
        <CardHeader>
          <CardTitle>{editing ? "Edit Offer" : "Create Offer"}</CardTitle>
          <Separator className="bg-foreground/50 !h-0.5 rounded-full" />
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2 md:col-span-2">
              <Label>Benefit</Label>
              <Select
                value={formState.benefit}
                onValueChange={(v) => onChange({ benefit: v })}
              >
                <SelectTrigger className="border-teal-600 border-2">
                  <SelectValue placeholder="Select a benefit" />
                </SelectTrigger>
                <SelectContent>
                  {useMarketplaceStore.getState().benefitOptions.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Summary</Label>
              <textarea
                className="border-teal-600 border-2 w-full min-h-[110px] p-2 rounded-xl"
                placeholder="Describe this offer..."
                value={formState.summary}
                onChange={(e) => onChange({ summary: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Fields</Label>
              <Select
                value={formState.fieldsText}
                onValueChange={(v) => onChange({ fieldsText: v })}
              >
                <SelectTrigger className="border-teal-600 border-2">
                  <SelectValue placeholder="Select a data field" />
                </SelectTrigger>
                <SelectContent>
                  {useMarketplaceStore.getState().fieldOptions.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                (For multiple fields, you can still type comma-separated
                manually)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Expires At</Label>
              <Input
                className="border-teal-600 border-2"
                type="date"
                value={formState.expiresAt}
                onChange={(e) => onChange({ expiresAt: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex gap-2 justify-end">
              {editing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setFormState({
                      orgId: "",
                      orgName: "",
                      benefit: "",
                      summary: "",
                      fieldsText: "",
                      expiresAt: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editing ? "Save offer" : "Create offer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <h3 className="font-semibold text-xl text-accent-foreground">
        Published Offers
      </h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loadingOffers ? (
          <div>Loading offers…</div>
        ) : sortedOffers.length === 0 ? (
          <div className="text-sm text-gray-500">No offers</div>
        ) : (
          sortedOffers.map((offer) => (
            <Card key={offer.id} className="shadow hover:shadow-lg transition ">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{offer.orgName}</h2>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-xs text-gray-500">Expires</div>
                    <div className="font-medium">
                      {offer.expiresAt
                        ? new Date(offer.expiresAt).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500">{offer.summary}</p>

                <div className="text-sm">
                  <strong>Benefit:</strong> {offer.benefit}
                </div>

                <div className="text-xs text-gray-500">
                  <strong>Fields:</strong> {offer.fields?.join(", ") || "—"}
                </div>

                <div className="pt-2 flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(offer)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(offer.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
