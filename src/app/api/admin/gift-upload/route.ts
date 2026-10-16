import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/origin";
import { storage } from "@/lib/storage";
import {
  ATTACHMENT_TYPES,
  validateUpload,
  UploadError,
} from "@/lib/storage/validate";

/** Uploads a gift file (PDF or image) to the private bucket under gifts/. */
export const POST = adminRoute(async (request) => {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "No file." }, { status: 400 });

  try {
    const validated = await validateUpload(file, ATTACHMENT_TYPES);
    const path = `gifts/${crypto.randomUUID()}${validated.ext}`;
    await storage().put("private", path, validated.bytes, validated.mime);
    return NextResponse.json({ path });
  } catch (err) {
    if (err instanceof UploadError)
      return NextResponse.json({ error: err.message }, { status: 400 });
    throw err;
  }
});
