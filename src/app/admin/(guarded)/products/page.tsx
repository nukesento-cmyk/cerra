"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ProductForm,
  emptyProduct,
  type Product,
  type ProductFormValues,
} from "./ProductForm";

function toFormValues(p: Product): ProductFormValues {
  return {
    sku: p.sku,
    barcode: p.barcode,
    name: p.name,
    description: p.description,
    slug: p.slug,
    collection: p.collection,
    categoryId: p.categoryId,
    unit: p.unit,
    spKes: p.spKes,
    spUsd: p.spUsd,
    salePriceKes: p.salePriceKes,
    salePriceUsd: p.salePriceUsd,
    bp: p.bp,
    taxRate: p.taxRate,
    quantity: p.quantity,
    reorderLevel: p.reorderLevel,
    isActive: p.isActive,
    isTracked: p.isTracked,
    isBestSeller: p.isBestSeller,
    isOnOffer: p.isOnOffer,
    isFeatured: p.isFeatured,
    fragranceNotes: p.fragranceNotes,
    imageUrl: p.imageUrl,
    internalNotes: p.internalNotes,
  };
}

function formatKes(v: number) {
  return `KSh ${v.toLocaleString("en-KE")}`;
}

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [initial, setInitial] = useState<ProductFormValues>(emptyProduct());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (collectionFilter) params.set("collection", collectionFilter);
      if (activeFilter) params.set("active", activeFilter);
      const res = await fetch(`/api/products?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [query, collectionFilter, activeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setInitial(emptyProduct());
    setDialogOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setInitial(toFormValues(p));
    setDialogOpen(true);
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}" (${p.sku})? This cannot be undone.`))
      return;
    const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      alert("Failed to delete");
      return;
    }
    await load();
  }

  const lowStockCount = useMemo(
    () =>
      items.filter((p) => p.isTracked && p.quantity <= p.reorderLevel).length,
    [items],
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-light mb-1">Products</h1>
          <p className="text-gray-400 text-sm">
            {loading
              ? "Loading…"
              : `${items.length} total${
                  lowStockCount ? ` · ${lowStockCount} low stock` : ""
                }`}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-amber-400 text-black hover:bg-amber-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add product
        </Button>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, SKU, barcode…"
            className="pl-9 bg-black/50 border-gray-700 text-white"
          />
        </div>
        <select
          value={collectionFilter}
          onChange={(e) => setCollectionFilter(e.target.value)}
          className="h-10 rounded-md bg-black/50 border border-gray-700 text-white px-3 focus:outline-none focus:border-amber-400"
        >
          <option value="">All collections</option>
          <option value="women">women</option>
          <option value="men">men</option>
          <option value="unisex">unisex</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="h-10 rounded-md bg-black/50 border border-gray-700 text-white px-3 focus:outline-none focus:border-amber-400"
        >
          <option value="">All</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>
      </div>

      {error && (
        <p className="text-red-400 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="border border-amber-400/20 rounded-lg p-12 text-center">
          <p className="text-gray-400 mb-4">
            {query || collectionFilter || activeFilter
              ? "No products match your filters."
              : "No products yet."}
          </p>
          {!query && !collectionFilter && !activeFilter && (
            <Button
              onClick={openCreate}
              variant="outline"
              className="border-amber-400/40 text-amber-400 hover:bg-amber-400/10"
            >
              Add the first one
            </Button>
          )}
        </div>
      ) : (
        <div className="border border-amber-400/20 rounded-lg overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-amber-400/20 hover:bg-transparent">
                <TableHead className="text-gray-300">Image</TableHead>
                <TableHead className="text-gray-300">SKU</TableHead>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Collection</TableHead>
                <TableHead className="text-gray-300">Category</TableHead>
                <TableHead className="text-gray-300 text-right">
                  Selling price
                </TableHead>
                <TableHead className="text-gray-300 text-right">Qty</TableHead>
                <TableHead className="text-gray-300 text-right">Flags</TableHead>
                <TableHead className="text-gray-300 text-right">
                  Status
                </TableHead>
                <TableHead className="text-gray-300 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => {
                const lowStock = p.isTracked && p.quantity <= p.reorderLevel;
                const hasSale =
                  p.isOnOffer &&
                  p.salePriceKes != null &&
                  p.salePriceUsd != null;
                return (
                  <TableRow
                    key={p.id}
                    className={`border-amber-400/10 hover:bg-white/5 ${
                      lowStock ? "bg-red-500/5" : ""
                    }`}
                  >
                    <TableCell>
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover border border-gray-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-800 border border-gray-700" />
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-400">
                      {p.sku}
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {p.name}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {p.collection}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {p.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {hasSale ? (
                        <div className="flex flex-col items-end">
                          <span className="text-amber-400">
                            {formatKes(p.salePriceKes!)}
                          </span>
                          <span className="text-gray-500 text-xs line-through">
                            {formatKes(p.spKes)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300">
                          {formatKes(p.spKes)}
                        </span>
                      )}
                      <div className="text-gray-500 text-xs">
                        {formatUsd(hasSale ? p.salePriceUsd! : p.spUsd)}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        lowStock ? "text-red-400 font-medium" : "text-gray-300"
                      }`}
                    >
                      {p.quantity}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {p.isBestSeller && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-400 mr-1">
                          Best
                        </span>
                      )}
                      {p.isOnOffer && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 mr-1">
                          Sale
                        </span>
                      )}
                      {p.isFeatured && (
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                          Featured
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          p.isActive
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {p.isActive ? "active" : "inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(p)}
                        className="text-gray-400 hover:text-amber-400 mr-3 transition-colors"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => remove(p)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        initial={initial}
        onSaved={load}
      />
    </main>
  );
}