import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { timingSafeEqualString } from "@/lib/timing-safe-equal";

/**
 * Read-only report of subscriptions with a pending cancellation request
 * (see supabase/migrations/0003_cancel_request.sql) that Cakto hasn't
 * actually canceled yet — Cakto's API has no cancel endpoint, so the seller
 * has to do it by hand in their dashboard, and needs a way to know who's
 * waiting. Guarded by its own narrow secret rather than the full
 * service_role key, so anything holding this token can only ever read this
 * one report, never write to the database.
 */
export async function GET(request: Request) {
  const { allowed } = rateLimit(`admin-pending-cancellations:${getClientIp(request)}`, 20, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const expected = process.env.ADMIN_REPORT_SECRET;
  const provided = request.headers.get("x-admin-secret");
  if (!expected || !provided || !timingSafeEqualString(provided, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  const { data, error } = await admin
    .from("subscriptions")
    .select("cakto_customer_email, cancel_requested_at, cakto_subscription_id, current_period_end")
    .not("cancel_requested_at", "is", null)
    .neq("status", "canceled")
    .order("cancel_requested_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pending: data ?? [] });
}
