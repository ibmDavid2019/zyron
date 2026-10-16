import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Toggles "Atividade pública" for a share. Runs as the logged-in user via the cookie-session client, so RLS (owner-only) enforces it — no admin client needed here. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const body: { shareToken?: string; isPublic?: boolean } = await request.json().catch(() => ({}));
  if (!body.shareToken || typeof body.isPublic !== "boolean") {
    return NextResponse.json({ error: "shareToken and isPublic are required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("shared_activities")
    .update({ is_public: body.isPublic, updated_at: new Date().toISOString() })
    .eq("share_token", body.shareToken)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
