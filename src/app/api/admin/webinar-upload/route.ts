import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/origin";
import { storage } from "@/lib/storage";
import {
  ATTACHMENT_TYPES,
  UploadError,
  validateUpload,
} from "@/lib/storage/validate";
import { idSchema } from "@/lib/validators/content";

export const dynamic = "force-dynamic";

// Uploads a webinar resource (PDF/image) to the PRIVATE bucket under
// webinars/<webinar_id>/ — members get short-lived signed URLs, never a public path.
export const POST = adminRoute(async (request) => {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const webinarId = String(form?.get("webinar_id") ?? "");

  if (!(file instanceof File))
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  const parsed = idSchema.safeParse(webinarId);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid webinar." }, { status: 400 });

  try {
    const v = await validateUpload(file, ATTACHMENT_TYPES);
    const path = `webinars/${parsed.data}/${crypto.randomUUID()}.${v.ext}`;
    await storage().put("private", path, v.bytes, v.mime);
    return NextResponse.json(
      { path, size: v.size, mime: v.mime },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof UploadError)
      return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
});
