import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const TOKEN_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// A 1080x1920 PNG export normally runs a few MB — 15MB per file is generous
// headroom while still rejecting an obviously-abusive single upload.
const MAX_FILE_BYTES = 15 * 1024 * 1024;
// Cumulative cap per user per UTC day, summed from activity_media's
// output_size_bytes (see supabase/migrations/0006_share_upload_quota.sql) —
// protects the public activity-shares bucket from unbounded storage/bandwidth
// cost racked up by one account re-exporting/uploading repeatedly.
const DAILY_QUOTA_BYTES = 1024 * 1024 * 1024;

function generateShareToken(length = 10): string {
  let token = "";
  for (let i = 0; i < length; i++) {
    token += TOKEN_ALPHABET[Math.floor(Math.random() * TOKEN_ALPHABET.length)];
  }
  return token;
}

/**
 * Receives the final composited PNG a user exported in the share editor,
 * uploads it to the public `activity-shares` bucket, and creates/reuses the
 * `shared_activities` row (+ its `activity_media` row) for that activity.
 * Requires a real logged-in session (checked via the cookie-based server
 * client) — the actual privileged writes then go through the service-role
 * admin client, scoped to the id of the user we just verified rather than
 * trusting the request body for identity.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const clientActivityId = formData.get("clientActivityId");
  const layout = formData.get("layout");
  const snapshotRaw = formData.get("snapshot");
  const overlaySpecRaw = formData.get("overlaySpec");

  if (!(file instanceof Blob) || typeof clientActivityId !== "string" || typeof snapshotRaw !== "string") {
    return NextResponse.json({ error: "missing file, clientActivityId, or snapshot" }, { status: 400 });
  }

  let snapshot: unknown;
  let overlaySpec: unknown = {};
  try {
    snapshot = JSON.parse(snapshotRaw);
    if (typeof overlaySpecRaw === "string") overlaySpec = JSON.parse(overlaySpecRaw);
  } catch {
    return NextResponse.json({ error: "invalid snapshot/overlaySpec JSON" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: `file too large (max ${Math.round(MAX_FILE_BYTES / (1024 * 1024))}MB)` }, { status: 413 });
  }

  const startOfDayUtc = new Date();
  startOfDayUtc.setUTCHours(0, 0, 0, 0);
  const { data: todayUploads } = await admin
    .from("activity_media")
    .select("output_size_bytes")
    .eq("user_id", user.id)
    .gte("updated_at", startOfDayUtc.toISOString());
  const usedTodayBytes = (todayUploads ?? []).reduce((sum, row) => sum + (row.output_size_bytes ?? 0), 0);
  if (usedTodayBytes + file.size > DAILY_QUOTA_BYTES) {
    return NextResponse.json({ error: "daily sharing upload limit reached (1GB/day) — try again tomorrow" }, { status: 429 });
  }

  // Reuse an existing share row for this activity (same user + client id)
  // instead of minting a new token every time the editor is reopened.
  const { data: existing } = await admin
    .from("shared_activities")
    .select("id, share_token")
    .eq("user_id", user.id)
    .eq("client_activity_id", clientActivityId)
    .maybeSingle();

  let sharedActivityId: string;
  let shareToken: string;

  if (existing) {
    sharedActivityId = existing.id;
    shareToken = existing.share_token;
    await admin
      .from("shared_activities")
      .update({ snapshot, updated_at: new Date().toISOString() })
      .eq("id", sharedActivityId);
  } else {
    let insertError: { message: string } | null = null;
    let inserted: { id: string; share_token: string } | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      shareToken = generateShareToken();
      const { data, error } = await admin
        .from("shared_activities")
        .insert({ user_id: user.id, client_activity_id: clientActivityId, share_token: shareToken, snapshot })
        .select("id, share_token")
        .single();
      if (!error && data) {
        inserted = data;
        insertError = null;
        break;
      }
      insertError = error;
    }
    if (!inserted) {
      return NextResponse.json({ error: insertError?.message ?? "could not create share" }, { status: 500 });
    }
    sharedActivityId = inserted.id;
    shareToken = inserted.share_token;
  }

  const outputPath = `${shareToken}/output.png`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from("activity-shares")
    .upload(outputPath, bytes, { contentType: "image/png", upsert: true });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage.from("activity-shares").getPublicUrl(outputPath);

  const { data: existingMedia } = await admin
    .from("activity_media")
    .select("id")
    .eq("shared_activity_id", sharedActivityId)
    .eq("kind", "photo")
    .maybeSingle();

  const mediaRow = {
    shared_activity_id: sharedActivityId,
    user_id: user.id,
    kind: "photo" as const,
    layout: typeof layout === "string" ? layout : "minimal",
    overlay_spec: overlaySpec,
    output_storage_path: outputPath,
    output_mime: "image/png",
    output_size_bytes: bytes.byteLength,
    status: "ready" as const,
    updated_at: new Date().toISOString(),
  };

  if (existingMedia) {
    await admin.from("activity_media").update(mediaRow).eq("id", existingMedia.id);
  } else {
    await admin.from("activity_media").insert(mediaRow);
  }

  return NextResponse.json({
    shareToken,
    publicUrl: `https://zyron-fitness.vercel.app/s/${shareToken}`,
    imageUrl: publicUrlData.publicUrl,
  });
}
