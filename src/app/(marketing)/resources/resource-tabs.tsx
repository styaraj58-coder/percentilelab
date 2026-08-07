"use client";

import { useState } from "react";

export type ResourceItem = {
  id: string;
  title: string;
  description: string | null;
  url: string;
};

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function VideoCard({ video }: { video: ResourceItem }) {
  const embedUrl = getYouTubeEmbedUrl(video.url);

  return (
    <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
      {embedUrl ? (
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex aspect-video w-full items-center justify-center bg-brand-navy/5 text-sm font-medium text-brand-navy hover:bg-brand-navy/10"
        >
          Watch video ↗
        </a>
      )}
      <div className="p-4">
        <p className="font-semibold text-brand-navy">{video.title}</p>
        {video.description && (
          <p className="mt-1 text-sm text-brand-ink/70">{video.description}</p>
        )}
      </div>
    </div>
  );
}

function MaterialCard({ material }: { material: ResourceItem }) {
  return (
    <a
      href={material.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-4 rounded-xl border border-black/5 bg-white p-5 shadow-sm transition-colors hover:border-brand-navy/20"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-gold/15 text-brand-gold">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div>
        <p className="font-semibold text-brand-navy">{material.title}</p>
        {material.description && (
          <p className="mt-1 text-sm text-brand-ink/70">
            {material.description}
          </p>
        )}
        <p className="mt-2 text-xs font-semibold text-brand-gold">
          View / Download PDF ↗
        </p>
      </div>
    </a>
  );
}

export function ResourceTabs({
  videos,
  materials,
}: {
  videos: ResourceItem[];
  materials: ResourceItem[];
}) {
  const [tab, setTab] = useState<"videos" | "materials">("videos");

  return (
    <div>
      <div
        role="tablist"
        aria-label="Resource type"
        className="flex gap-2 border-b border-black/10 pb-4"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "videos"}
          onClick={() => setTab("videos")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "videos"
              ? "bg-brand-navy text-white"
              : "bg-brand-cream text-brand-ink/70 hover:bg-brand-navy/10"
          }`}
        >
          Videos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "materials"}
          onClick={() => setTab("materials")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "materials"
              ? "bg-brand-navy text-white"
              : "bg-brand-cream text-brand-ink/70 hover:bg-brand-navy/10"
          }`}
        >
          Study Materials
        </button>
      </div>

      <div className="mt-8">
        {tab === "videos" ? (
          videos.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-brand-ink/50">
              No videos published yet — check back soon.
            </p>
          )
        ) : materials.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {materials.map((material) => (
              <MaterialCard key={material.id} material={material} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-brand-ink/50">
            No study materials published yet — check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
