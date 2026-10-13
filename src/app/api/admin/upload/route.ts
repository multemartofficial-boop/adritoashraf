import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/origin";
import { MEDIA_FOLDERS, uploadSiteImage, type MediaFolder } from "@/lib/storage";
import { UploadError } from "@/lib/storage/validate";

export const dynamic = "force-dynamic";

export const POST = adminRoute(async (request) => {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") ?? "media");

  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!MEDIA_FOLDERS.includes(folder as MediaFolder)) {
    return NextResponse.json({ error: "Invalid folder." }, { status: 400 });
  }

  try {
    const result = await uploadSiteImage(file, folder as MediaFolder);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof UploadError) return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
});
