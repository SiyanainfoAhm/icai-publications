"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function PublicationUploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    const res = await fetch("/api/admin/publications", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }
    router.push("/admin/publications");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-4">
      {error && <p className="text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-medium">
        Title
        <input name="title" required className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Slug
        <input name="slug" required className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Committee
        <input name="committee" className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Topic
        <input name="topic" className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Cover image URL
        <input name="cover_image_url" className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Release date
        <input name="release_date" type="date" className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Synopsis
        <textarea name="synopsis" rows={3} className="mt-1 w-full rounded border px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        HTML content
        <textarea
          name="content_html"
          rows={8}
          className="mt-1 w-full rounded border px-3 py-2 font-mono text-sm"
          placeholder="<article>...</article>"
        />
      </label>
      <label className="block text-sm font-medium">
        Status
        <select name="status" className="mt-1 w-full rounded border px-3 py-2">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="icai-btn-primary rounded px-4 py-2 text-sm font-semibold"
      >
        {loading ? "Saving…" : "Save publication"}
      </button>
    </form>
  );
}
