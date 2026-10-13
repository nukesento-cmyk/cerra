"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";

type Collection = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  href: string;
};

type FormState = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  href: string;
};

const emptyForm: FormState = {
  slug: "",
  name: "",
  tagline: "",
  description: "",
  image: "",
  href: "/collections/",
};

export default function AdminCollectionsPage() {
  const [items, setItems] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/collections", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load collections");
      const data = await res.json();
      setItems(data.items);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(c: Collection) {
    setEditing(c);
    setForm({
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      image: c.image,
      href: c.href,
    });
    setFormError(null);
    setDialogOpen(true);
  }

  async function submit() {
    setFormError(null);

    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setFormError("Slug must be lowercase, alphanumeric, and dashes only.");
      return;
    }
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!form.tagline.trim()) return setFormError("Tagline is required.");
    if (!form.description.trim()) return setFormError("Description is required.");
    if (!form.image.trim()) return setFormError("Image is required.");
    if (!form.href.trim()) return setFormError("Href is required.");

    setSubmitting(true);
    try {
      const url = editing
        ? `/api/collections/${editing.slug}`
        : "/api/collections";
      const method = editing ? "PATCH" : "POST";
      const payload = editing
        ? {
            name: form.name.trim(),
            tagline: form.tagline.trim(),
            description: form.description.trim(),
            image: form.image.trim(),
            href: form.href.trim(),
          }
        : {
            slug: form.slug.trim(),
            name: form.name.trim(),
            tagline: form.tagline.trim(),
            description: form.description.trim(),
            image: form.image.trim(),
            href: form.href.trim(),
          };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Request failed");
        return;
      }
      setDialogOpen(false);
      await load();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(c: Collection) {
    if (
      !confirm(
        `Delete collection "${c.name}" (${c.slug})? This cannot be undone.`,
      )
    )
      return;
    const res = await fetch(`/api/collections/${c.slug}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 204) {
      alert("Failed to delete");
      return;
    }
    await load();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-light mb-1">Collections</h1>
          <p className="text-gray-400 text-sm">
            {loading ? "Loading…" : `${items.length} total`}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-amber-400 text-black hover:bg-amber-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add collection
        </Button>
      </header>

      {loadError && (
        <p className="text-red-400 mb-4" role="alert">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="border border-amber-400/20 rounded-lg p-12 text-center">
          <p className="text-gray-400 mb-4">No collections yet.</p>
          <Button
            onClick={openCreate}
            variant="outline"
            className="border-amber-400/40 text-amber-400 hover:bg-amber-400/10"
          >
            Add the first one
          </Button>
        </div>
      ) : (
        <div className="border border-amber-400/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-amber-400/20 hover:bg-transparent">
                <TableHead className="text-gray-300">Image</TableHead>
                <TableHead className="text-gray-300">Slug</TableHead>
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Tagline</TableHead>
                <TableHead className="text-gray-300 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow
                  key={c.slug}
                  className="border-amber-400/10 hover:bg-white/5"
                >
                  <TableCell>
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt=""
                        className="w-12 h-12 rounded object-cover border border-gray-700"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gray-800 border border-gray-700" />
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">
                    {c.slug}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {c.name}
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {c.tagline}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-gray-400 hover:text-amber-400 mr-3 transition-colors"
                      aria-label={`Edit ${c.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(c)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      aria-label={`Delete ${c.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-amber-400/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light">
              {editing ? `Edit ${editing.name}` : "New collection"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editing
                ? "Update the collection details below."
                : "Fill in the details for the new collection."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="women"
                  disabled={!!editing}
                  className="bg-black/50 border-gray-700 text-white font-mono disabled:opacity-50"
                />
                {editing && (
                  <p className="text-gray-500 text-xs mt-1">
                    Slug cannot be changed after creation.
                  </p>
                )}
              </div>
              <div>
                <Label className="text-gray-300 mb-2 block">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Women"
                  className="bg-black/50 border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Tagline *</Label>
              <Input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="For her."
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={3}
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Href *</Label>
              <Input
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="/collections/women"
                className="bg-black/50 border-gray-700 text-white font-mono text-sm"
              />
            </div>

            <div>
              <Label className="text-gray-300 mb-2 block">Image *</Label>
              <Dropzone
                value={form.image || null}
                onChange={(u) => setForm({ ...form, image: u ?? "" })}
              />
            </div>

            {formError && (
              <p className="text-red-400 text-sm" role="alert">
                {formError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
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
    </main>
  );
}