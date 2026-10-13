"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

export type PostFormValues = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  published: boolean;
};

export function emptyPost(): PostFormValues {
  return {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    coverImage: null,
    published: false,
  };
}

export function PostDialog({
  open,
  onOpenChange,
  editing,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: AdminPost | null;
  initial: PostFormValues;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PostFormValues>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof PostFormValues>(
    key: K,
    value: PostFormValues[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setError(null);
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setError("Slug must be lowercase, alphanumeric, and dashes only.");
      return;
    }
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.excerpt.trim()) return setError("Excerpt is required.");
    if (!form.content.trim()) return setError("Content is required.");

    setSubmitting(true);
    try {
      const url = editing ? `/api/posts/${editing.id}` : "/api/posts";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
            {editing ? `Edit "${editing.title}"` : "New post"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {editing ? "Update the post below." : "Write something worth reading."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="bg-black/50 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2 block">Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="the-art-of-layering"
                className="bg-black/50 border-gray-700 text-white font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Excerpt *</Label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              placeholder="One or two sentences that appear in the list."
              className="bg-black/50 border-gray-700 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Content *</Label>
            <Textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              rows={12}
              placeholder="Markdown or plain text. Line breaks are preserved."
              className="bg-black/50 border-gray-700 text-white font-mono text-sm"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Cover image</Label>
            <Dropzone
              value={form.coverImage}
              onChange={(u) => set("coverImage", u)}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="accent-amber-400"
            />
            <span className="text-sm text-gray-300">
              Publish now (unchecked = save as draft)
            </span>
          </label>

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