"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { uploadFile } from "@/lib/upload-file";

import { createResource, type ResourceType } from "./actions";

const inputClass =
  "mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy";

export function ResourceForm({ type }: { type: ResourceType }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setDescription("");
    setUrl("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const uploadedUrl = await uploadFile(file);
      setUrl(uploadedUrl);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createResource({ type, title, description, url });
        reset();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add resource");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-black/5 bg-white p-5"
    >
      <div>
        <label className="text-xs font-medium text-brand-ink/70">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder={
            type === "VIDEO" ? "e.g. Quant shortcuts for percentages" : "e.g. Verbal Ability formula sheet"
          }
          required
        />
      </div>

      <div className="mt-3">
        <label className="text-xs font-medium text-brand-ink/70">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} min-h-[70px]`}
          placeholder="A short note on what this covers"
        />
      </div>

      <div className="mt-3">
        {type === "VIDEO" ? (
          <>
            <label className="text-xs font-medium text-brand-ink/70">
              Video link
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={inputClass}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </>
        ) : (
          <>
            <label className="text-xs font-medium text-brand-ink/70">
              PDF file
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-md border border-dashed border-black/20 px-3 py-1.5 text-xs font-medium text-brand-navy hover:bg-black/5 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : fileName ? "Replace PDF" : "+ Choose PDF"}
              </button>
              {fileName && (
                <span className="text-xs text-brand-ink/60">{fileName}</span>
              )}
            </div>
          </>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={isPending || uploading || !url}
        className="mt-4 rounded-md bg-brand-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-navy-light disabled:opacity-50"
      >
        {isPending ? "Adding..." : type === "VIDEO" ? "Add video" : "Add study material"}
      </button>
    </form>
  );
}
