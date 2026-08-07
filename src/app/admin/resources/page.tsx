import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";

import { ResourceForm } from "./resource-form";
import { DeleteResourceButton } from "./resource-row-actions";

export const metadata: Metadata = { title: "Resources | Percentile Lab" };

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
  });

  const videos = resources.filter((r) => r.type === "VIDEO");
  const materials = resources.filter((r) => r.type === "PDF");

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-navy">Study Resources</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Videos and PDFs published here show up on the public Resources page.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-semibold text-brand-navy">Videos</h2>
          <div className="mt-4">
            <ResourceForm type="VIDEO" />
          </div>
          <ul className="mt-6 space-y-3">
            {videos.length === 0 && (
              <p className="text-sm text-brand-ink/50">No videos added yet.</p>
            )}
            {videos.map((video) => (
              <li
                key={video.id}
                className="rounded-xl border border-black/5 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-brand-navy">{video.title}</p>
                    {video.description && (
                      <p className="mt-1 text-sm text-brand-ink/60">
                        {video.description}
                      </p>
                    )}
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-xs text-brand-ink/40 hover:text-brand-navy hover:underline"
                    >
                      {video.url}
                    </a>
                  </div>
                  <DeleteResourceButton resourceId={video.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brand-navy">
            Study Materials
          </h2>
          <div className="mt-4">
            <ResourceForm type="PDF" />
          </div>
          <ul className="mt-6 space-y-3">
            {materials.length === 0 && (
              <p className="text-sm text-brand-ink/50">
                No study materials added yet.
              </p>
            )}
            {materials.map((material) => (
              <li
                key={material.id}
                className="rounded-xl border border-black/5 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-brand-navy">
                      {material.title}
                    </p>
                    {material.description && (
                      <p className="mt-1 text-sm text-brand-ink/60">
                        {material.description}
                      </p>
                    )}
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs text-brand-ink/40 hover:text-brand-navy hover:underline"
                    >
                      View PDF
                    </a>
                  </div>
                  <DeleteResourceButton resourceId={material.id} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
