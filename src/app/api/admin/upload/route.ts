import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getSupabaseAdmin, UPLOADS_BUCKET } from "@/lib/supabase-admin";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

const MAX_SIZE_BYTES: Record<string, number> = {
  "application/pdf": 20 * 1024 * 1024,
};
const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    return NextResponse.json(
      { error: "Only PNG, JPEG, WEBP, GIF, or PDF files are allowed" },
      { status: 400 }
    );
  }

  const maxSize = MAX_SIZE_BYTES[file.type] ?? DEFAULT_MAX_SIZE_BYTES;
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File must be smaller than ${Math.round(maxSize / (1024 * 1024))}MB` },
      { status: 400 }
    );
  }

  const filename = `${randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from(UPLOADS_BUCKET)
      .upload(filename, bytes, { contentType: file.type });

    if (error) {
      console.error("Supabase Storage upload failed:", error.message);
      return NextResponse.json(
        { error: "Failed to store the uploaded file" },
        { status: 500 }
      );
    }

    const { data: pub } = supabase.storage.from(UPLOADS_BUCKET).getPublicUrl(filename);
    return NextResponse.json({ url: pub.publicUrl });
  } catch (err) {
    console.error("Upload route misconfigured:", err);
    return NextResponse.json(
      { error: "File storage is not configured on the server" },
      { status: 500 }
    );
  }
}
