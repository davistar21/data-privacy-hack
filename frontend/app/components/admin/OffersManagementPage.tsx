// src/pages/admin/OffersManagementPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useMarketplaceStore } from "../../stores/MarketPlaceStore";
import type { Organization, ReuseOffer } from "~/types";
import dayjs from "dayjs";
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      [...offers].sort((a, b) => {
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
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit Offer" : "Create Offer"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* <div className="space-y-2">
              <Label>Organization ID</Label>
              <Input
                placeholder="e.g. ecomshop"
                value={formState.orgId}
                onChange={(e) => onChange({ orgId: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Organization Name (display)</Label>
              <Input
                placeholder="EcomShop"
                value={formState.orgName}
                onChange={(e) => onChange({ orgName: e.target.value })}
              />
            </div> */}

            <div className="space-y-2 md:col-span-2">
              <Label>Benefit</Label>
              <Select
                value={formState.benefit}
                onValueChange={(v) => onChange({ benefit: v })}
              >
                <SelectTrigger>
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
                placeholder="Short explanation for users"
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
                <SelectTrigger>
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

      {/* Offers list */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loadingOffers ? (
          <div>Loading offers…</div>
        ) : sortedOffers.length === 0 ? (
          <div className="text-sm text-muted">No offers</div>
        ) : (
          sortedOffers.map((offer) => (
            <Card key={offer.id} className="shadow hover:shadow-lg transition">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{offer.orgName}</h2>
                    <div className="text-sm text-muted">{offer.orgId}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-xs text-muted">Expires</div>
                    <div className="font-medium">
                      {offer.expiresAt
                        ? dayjs(new Date(offer.expiresAt)).format("DD/MM/YYYY")
                        : "—"}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted">{offer.summary}</p>

                <div className="text-sm">
                  <strong>Benefit:</strong> {offer.benefit}
                </div>

                <div className="text-xs text-muted">
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
