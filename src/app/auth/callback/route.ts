import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { safeMemberPath } from "@/lib/validators/auth";

// Supabase Auth sends users here after email confirmation, magic links and
// password resets — both PKCE (`code`) and OTP (`token_hash`+`type`) flows.
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const next = url.searchParams.get("next");

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(new URL(safeMemberPath(next), url.origin));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as
        | "signup"
        | "email"
        | "recovery"
        | "magiclink"
        | "email_change"
        | "invite",
    });
    if (!error)
      return NextResponse.redirect(new URL(safeMemberPath(next), url.origin));
  }

  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent("That link has expired — please try again.")}`,
      url.origin,
    ),
  );
}
