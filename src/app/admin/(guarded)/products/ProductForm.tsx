"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";

export type Product = {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  slug: string;
  collection: "women" | "men" | "unisex";
  categoryId: string | null;
  category?: { name: string } | null;
  unit: string;
  spKes: number;
  spUsd: number;
  salePriceKes: number | null;
  salePriceUsd: number | null;
  bp: number;
  taxRate: number;
  quantity: number;
  reorderLevel: number;
  isActive: boolean;
  isTracked: boolean;
  isBestSeller: boolean;
  isOnOffer: boolean;
  isFeatured: boolean;
  fragranceNotes: string | null;
  timeSold: string | null;
  imageUrl: string | null;
  internalNotes: string | null;
  revenue?: { units: number; usd: number; kes: number }; 
};

export type ProductFormValues = Omit<
  Product,
  "id" | "timeSold" | "category"
>;

export function emptyProduct(): ProductFormValues {
  return {
    sku: "",
    barcode: null,
    name: "",
    description: null,
    slug: "",
    collection: "unisex",
    categoryId: null,
    unit: "ea",
    spKes: 0,
    spUsd: 0,
    salePriceKes: null,
    salePriceUsd: null,
    bp: 0,
    taxRate: 0,
    quantity: 0,
    reorderLevel: 0,
    isActive: true,
    isTracked: true,
    isBestSeller: false,
    isOnOffer: false,
    isFeatured: false,
    fragranceNotes: null,
    imageUrl: null,
    internalNotes: null,
  };
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Product | null;
  initial: ProductFormValues;
  onSaved: () => void;
};

function formatKes(v: number) {
  return `KSh ${v.toLocaleString("en-KE")}`;
}

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function notesToString(raw: string | null): string {
  if (!raw) return "";
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.join(", ");
  } catch {
    // not JSON — assume plain text
  }
  return raw;
}

function notesToJson(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const arr = trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (arr.length === 0) return null;
  return JSON.stringify(arr);
}

export function ProductForm({
  open,
  onOpenChange,
  editing,
  initial,
  onSaved,
}: Props) {
  const [form, setForm] = useState<ProductFormValues>(initial);
  const [notesInput, setNotesInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.items ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (open) {
      setForm(initial);
      setNotesInput(notesToString(initial.fragranceNotes));
      setError(null);
    }
  }, [open, initial]);

  function set<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const effectiveKes =
    form.isOnOffer && form.salePriceKes != null
      ? form.salePriceKes
      : form.spKes;
  const effectiveUsd =
    form.isOnOffer && form.salePriceUsd != null
      ? form.salePriceUsd
      : form.spUsd;
  const onSale =
    form.isOnOffer &&
    form.salePriceKes != null &&
    form.salePriceUsd != null &&
    (form.salePriceKes < form.spKes || form.salePriceUsd < form.spUsd);

  async function submit() {
    setError(null);

    if (!form.sku.trim()) return setError("SKU is required.");
    if (!form.name.trim()) return setError("Name is required.");
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      return setError("Slug must be lowercase, alphanumeric, and dashes only.");
    }
    if (form.spKes <= 0) return setError("Selling price (KES) must be > 0.");
    if (form.spUsd <= 0) return setError("Selling price (USD) must be > 0.");
    if (form.bp >= form.spKes) {
      return setError("Buying price should be less than the selling price.");
    }
    if (form.isOnOffer) {
      if (form.salePriceKes == null || form.salePriceUsd == null) {
        return setError("Provide both sale prices when On offer is checked.");
      }
      if (form.salePriceKes >= form.spKes) {
        return setError("Sale price (KES) must be less than the regular price.");
      }
      if (form.salePriceUsd >= form.spUsd) {
        return setError("Sale price (USD) must be less than the regular price.");
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        salePriceKes: form.isOnOffer ? form.salePriceKes : null,
        salePriceUsd: form.isOnOffer ? form.salePriceUsd : null,
        fragranceNotes: notesToJson(notesInput),
        // Ensure empty strings are null
        barcode: form.barcode?.trim() ? form.barcode : null,
        description: form.description?.trim() ? form.description : null,
        internalNotes: form.internalNotes?.trim() ? form.internalNotes : null,
        imageUrl: form.imageUrl?.trim() ? form.imageUrl : null,
      };

      const url = editing ? `/api/products/${editing.id}` : "/api/products";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 204) {
        onSaved();
        onOpenChange(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      onSaved();
      onOpenChange(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-amber-400/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">
            {editing ? `Edit ${editing.name}` : "New product"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {editing
              ? "Update the product details below."
              : "Fill in the details for the new product."}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-black/40 border border-amber-400/20 rounded-lg px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Selling price
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-light text-amber-400">
                {formatKes(effectiveKes)}
              </span>
              <span className="text-gray-400 text-sm">
                {formatUsd(effectiveUsd)}
              </span>
            </div>
          </div>
          {onSale && (
            <div className="text-right">
              <p className="text-gray-500 text-xs mb-1">Was</p>
              <p className="text-gray-500 text-sm line-through">
                {formatKes(form.spKes)}
              </p>
            </div>
          )}
        </div>

        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">SKU *</Label>
              <Input
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="CER-ML-001"
                className="bg-black/50 border-gray-700 text-white font-mono"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Barcode</Label>
              <Input
                value={form.barcode ?? ""}
                onChange={(e) => set("barcode", e.target.value || null)}
                placeholder="Optional"
                className="bg-black/50 border-gray-700 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="midnight-leather"
                className="bg-black/50 border-gray-700 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Description</Label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value || null)}
              rows={3}
              className="bg-black/50 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Collection *</Label>
              <select
                value={form.collection}
                onChange={(e) =>
                  set(
                    "collection",
                    e.target.value as ProductFormValues["collection"],
                  )
                }
                className="w-full h-10 rounded-md bg-black/50 border border-gray-700 text-white px-3 focus:outline-none focus:border-amber-400"
              >
                <option value="women">women</option>
                <option value="men">men</option>
                <option value="unisex">unisex</option>
              </select>
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Category</Label>
              <select
                value={form.categoryId ?? ""}
                onChange={(e) => set("categoryId", e.target.value || null)}
                className="w-full h-10 rounded-md bg-black/50 border border-gray-700 text-white px-3 focus:outline-none focus:border-amber-400"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Unit</Label>
              <Input
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="ea, ml, box"
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="border border-amber-400/20 rounded-lg p-4 space-y-4">
            <p className="text-gray-300 text-sm font-medium">Pricing</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">
                  Selling price (KES) *
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.spKes}
                  onChange={(e) => set("spKes", Number(e.target.value) || 0)}
                  placeholder="12500"
                  className="bg-black/50 border-gray-700 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">
                  {formatKes(form.spKes)}
                </p>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">
                  Selling price (USD cents) *
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.spUsd}
                  onChange={(e) => set("spUsd", Number(e.target.value) || 0)}
                  placeholder="9600"
                  className="bg-black/50 border-gray-700 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">
                  {formatUsd(form.spUsd)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">
                  Buying price (KES)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.bp}
                  onChange={(e) => set("bp", Number(e.target.value) || 0)}
                  placeholder="5000"
                  className="bg-black/50 border-gray-700 text-white"
                />
                <p className="text-gray-500 text-xs mt-1">
                  {formatKes(form.bp)}
                </p>
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">
                  Tax rate (%)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.taxRate}
                  onChange={(e) => set("taxRate", Number(e.target.value) || 0)}
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.isOnOffer}
                onChange={(e) => {
                  set("isOnOffer", e.target.checked);
                  if (!e.target.checked) {
                    set("salePriceKes", null);
                    set("salePriceUsd", null);
                  }
                }}
                className="accent-amber-400"
              />
              <span className="text-sm text-gray-300">
                On offer (discounted price)
              </span>
            </label>

            {form.isOnOffer && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <Label className="text-gray-300 mb-2 block">
                    Sale price (KES)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.salePriceKes ?? ""}
                    onChange={(e) =>
                      set(
                        "salePriceKes",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                      )
                    }
                    placeholder="10000"
                    className="bg-black/50 border-gray-700 text-white"
                  />
                  {form.salePriceKes != null && (
                    <p className="text-gray-500 text-xs mt-1">
                      {formatKes(form.salePriceKes)}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-gray-300 mb-2 block">
                    Sale price (USD cents)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.salePriceUsd ?? ""}
                    onChange={(e) =>
                      set(
                        "salePriceUsd",
                        e.target.value === ""
                          ? null
                          : Number(e.target.value),
                      )
                    }
                    placeholder="7700"
                    className="bg-black/50 border-gray-700 text-white"
                  />
                  {form.salePriceUsd != null && (
                    <p className="text-gray-500 text-xs mt-1">
                      {formatUsd(form.salePriceUsd)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">
                Quantity on hand
              </Label>
              <Input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => set("quantity", Number(e.target.value) || 0)}
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Reorder level</Label>
              <Input
                type="number"
                min={0}
                value={form.reorderLevel}
                onChange={(e) =>
                  set("reorderLevel", Number(e.target.value) || 0)
                }
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="border border-amber-400/20 rounded-lg p-4">
            <p className="text-gray-300 text-sm font-medium mb-3">
              Storefront flags
            </p>
            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="accent-amber-400"
                />
                <span className="text-sm text-gray-300">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isTracked}
                  onChange={(e) => set("isTracked", e.target.checked)}
                  className="accent-amber-400"
                />
                <span className="text-sm text-gray-300">Track stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isBestSeller}
                  onChange={(e) => set("isBestSeller", e.target.checked)}
                  className="accent-amber-400"
                />
                <span className="text-sm text-gray-300">Best seller</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => set("isFeatured", e.target.checked)}
                  className="accent-amber-400"
                />
                <span className="text-sm text-gray-300">Featured</span>
              </label>
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">
              Fragrance notes (comma-separated)
            </Label>
            <Input
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="bergamot, leather, oud"
              className="bg-black/50 border-gray-700 text-white"
            />
            <p className="text-gray-500 text-xs mt-1">
              Comma-separated. Stored as a JSON array.
            </p>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Image</Label>
            <Dropzone
              value={form.imageUrl}
              onChange={(u) => set("imageUrl", u)}
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Internal notes</Label>
            <Textarea
              value={form.internalNotes ?? ""}
              onChange={(e) => set("internalNotes", e.target.value || null)}
              rows={2}
              placeholder="Not shown to customers."
              className="bg-black/50 border-gray-700 text-white"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-gray-300 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting}
            className="bg-amber-400 text-black hover:bg-amber-300"
          >
            {submitting ? "Saving…" : editing ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}