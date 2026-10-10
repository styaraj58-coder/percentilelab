"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { uploadFile } from "@/lib/upload-file";

import { createPost, updatePost, type PostInput } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

export function PostForm({
  postId,
  initial,
}: {
  postId?: string;
  initial?: PostInput;
}) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "Satya Raj");
  const [published, setPublished] = useState(initial?.published ?? true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleCover(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      setCoverImageUrl(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function handleBodyImage(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadFile(file);
      const snippet = `![${file.name.replace(/\.[^.]+$/, "")}](${url})`;
      const el = contentRef.current;
      const start = el?.selectionStart ?? content.length;
      const end = el?.selectionEnd ?? content.length;
      const before = content.slice(0, start);
      const after = content.slice(end);
      const prefix = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
      const suffix = after && !after.startsWith("\n\n") ? (after.startsWith("\n") ? "\n" : "\n\n") : "";
      setContent(`${before}${prefix}${snippet}${suffix}${after}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (bodyInputRef.current) bodyInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input: PostInput = { title, excerpt, content, coverImageUrl, authorName, published };
    startTransition(async () => {
      try {
        if (postId) await updatePost(postId, input);
        else await createPost(input);
        router.push("/admin/blog");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save post");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-black/5 bg-white p-6"
    >
      <div>
        <label className="text-xs font-medium text-brand-ink/70">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="e.g. How to plan your last 30 days before MAH-CET"
          required
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-brand-ink/70">Author</label>
        <input
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className={inputClass}
          placeholder="Satya Raj"
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-brand-ink/70">
          Short summary (shown on the blog list, optional)
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className={`${inputClass} min-h-[70px]`}
          maxLength={300}
          placeholder="One or two sentences that make people want to read it"
        />
      </div>

      <div className="mt-4">
        <label className="text-xs font-medium text-brand-ink/70">
          Cover image (optional)
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleCover(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-dashed border-black/20 px-3 py-1.5 text-xs font-medium text-brand-navy hover:bg-black/5 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : coverImageUrl ? "Replace image" : "+ Choose image"}
          </button>
          {coverImageUrl && (
            <button
              type="button"
              onClick={() => setCoverImageUrl("")}
              className="text-xs text-red-700 hover:underline"
            >
              Remove
            </button>
          )}
        </div>
        {coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImageUrl}
            alt="Cover preview"
            className="mt-3 aspect-[16/9] w-full max-w-sm rounded-lg border border-black/10 object-cover"
          />
        )}
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-medium text-brand-ink/70">Article</label>
          <div>
            <input
              ref={bodyInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleBodyImage(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => bodyInputRef.current?.click()}
              disabled={uploading}
              className="rounded-md border border-dashed border-black/20 px-3 py-1 text-xs font-medium text-brand-navy hover:bg-black/5 disabled:opacity-50"
            >
              + Insert image at cursor
            </button>
          </div>
        </div>
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${inputClass} min-h-[360px] font-mono leading-relaxed`}
          placeholder={"Write your article here. Leave a blank line between paragraphs."}
          required
        />
        <p className="mt-2 text-xs leading-relaxed text-brand-ink/50">
          Formatting: <code>## Heading</code>, <code>### Subheading</code>,{" "}
          <code>- bullet</code> (one per line), <code>**bold**</code>,{" "}
          <code>*italic*</code>, <code>[link text](https://...)</code>, or{" "}
          <code>[link text](/courses)</code> for a page on this site. Blank
          line = new paragraph.
        </p>
      </div>

      <label className="mt-5 flex items-center gap-2 text-sm text-brand-ink/80">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 accent-brand-navy"
        />
        Published (uncheck to save as a draft)
      </label>

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      <div className="mt-5 flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending || uploading}
          className="rounded-md bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-50"
        >
          {isPending ? "Saving..." : postId ? "Save changes" : "Create post"}
        </button>
        <Link
          href="/admin/blog"
          className="text-sm text-brand-ink/60 hover:text-brand-navy hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
