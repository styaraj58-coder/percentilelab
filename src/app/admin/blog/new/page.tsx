import type { Metadata } from "next";

import { PostForm } from "../post-form";

export const metadata: Metadata = { title: "New post | Percentile Lab" };

export default function NewPostPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-brand-navy">New post</h1>
      <div className="mt-6">
        <PostForm />
      </div>
    </div>
  );
}
