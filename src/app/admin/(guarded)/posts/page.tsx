"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  PostDialog,
  emptyPost,
  type AdminPost,
  type PostFormValues,
} from "./PostDialog";

function toForm(p: AdminPost): PostFormValues {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    coverImage: p.coverImage,
    published: p.published,
  };
}

export default function AdminPostsPage() {
  const [items, setItems] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPost | null>(null);
  const [initial, setInitial] = useState<PostFormValues>(emptyPost());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load posts");
      const data = await res.json();
      setItems(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setInitial(emptyPost());
    setDialogOpen(true);
  }

  function openEdit(p: AdminPost) {
    setEditing(p);
    setInitial(toForm(p));
    setDialogOpen(true);
  }

  async function remove(p: AdminPost) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/posts/${p.id}`, { method: "DELETE" });
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
          <h1 className="text-4xl font-light mb-1">Blog</h1>
          <p className="text-gray-400 text-sm">
            {loading ? "Loading…" : `${items.length} total`}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-amber-400 text-black hover:bg-amber-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          New post
        </Button>
      </header>

      {error && (
        <p className="text-red-400 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : items.length === 0 ? (
        <div className="border border-amber-400/20 rounded-lg p-12 text-center">
          <p className="text-gray-400 mb-4">No posts yet.</p>
          <Button
            onClick={openCreate}
            variant="outline"
            className="border-amber-400/40 text-amber-400 hover:bg-amber-400/10"
          >
            Write the first one
          </Button>
        </div>
      ) : (
        <div className="border border-amber-400/20 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-amber-400/20 hover:bg-transparent">
                <TableHead className="text-gray-300">Title</TableHead>
                <TableHead className="text-gray-300">Slug</TableHead>
                <TableHead className="text-gray-300 text-right">Status</TableHead>
                <TableHead className="text-gray-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow
                  key={p.id}
                  className="border-amber-400/10 hover:bg-white/5"
                >
                  <TableCell className="font-medium text-white">
                    {p.title}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-400">
                    {p.slug}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.published ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400">
                        <Eye className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-gray-400 hover:text-amber-400 mr-3 transition-colors"
                      aria-label={`Edit ${p.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(p)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                      aria-label={`Delete ${p.title}`}
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

      <PostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        initial={initial}
        onSaved={load}
      />
    </main>
  );
}