import { NextResponse } from "next/server";
import { fetchCaktoOrder } from "@/lib/cakto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { timingSafeEqualString } from "@/lib/timing-safe-equal";

// Events that should remove ads for the paying customer. Confirmed against
// Cakto's REST API before acting on them — Cakto's webhook authenticity
// check is a static `secret` string embedded in the request body (not an
// HMAC signature), so nothing that grants ad-free status is trusted from
// the payload alone.
const GRANT_EVENTS = new Set(["purchase_approved", "subscription_renewed"]);

// Events that should bring ads back. A forged webhook here can only ever
// hurt an attacker (it turns ads back on, not off), so these are safe to
// act on directly without the extra API round trip.
const REVOKE_EVENTS: Record<string, "past_due" | "canceled"> = {
  subscription_renewal_refused: "past_due",
  subscription_canceled: "canceled",
  refund: "canceled",
  chargeback: "canceled",
};

interface CaktoWebhookBody {
  event?: string;
  secret?: string;
  data?: {
    id?: string;
    status?: string;
    customer?: { email?: string };
    subscription?: { id?: string };
  };
}

export async function POST(request: Request) {
  // Generous limit — real Cakto traffic can burst (sales spikes), this is
  // only meant to blunt flooding/brute-forcing the webhook secret.
  const { allowed } = rateLimit(`webhook-cakto:${getClientIp(request)}`, 60, 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  let body: CaktoWebhookBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const expectedSecret = process.env.CAKTO_WEBHOOK_SECRET;
  if (!expectedSecret || !body.secret || !timingSafeEqualString(body.secret, expectedSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "server not configured" }, { status: 500 });
  }

  const event = body.event;
  const data = body.data ?? {};
  const email = data.customer?.email;
  if (!event || !email) {
    return NextResponse.json({ error: "missing event or customer email" }, { status: 400 });
  }

  const { data: userId, error: lookupError } = await admin.rpc("get_user_id_by_email", { lookup_email: email });
  if (lookupError || !userId) {
    // No matching ZYRON account for this email — nothing to update. Not an
    // error on Cakto's side, so still acknowledge the webhook.
    return NextResponse.json({ ok: true, matched: false });
  }

  if (GRANT_EVENTS.has(event)) {
    const orderId = data.id;
    const confirmedOrder = orderId ? await fetchCaktoOrder(orderId) : null;
    const confirmedStatus = confirmedOrder?.status?.toLowerCase();
    if (!confirmedOrder || (confirmedStatus !== "paid" && confirmedStatus !== "approved")) {
      return NextResponse.json({ error: "could not confirm payment with Cakto" }, { status: 400 });
    }

    const nextPeriodEnd = new Date();
    nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);

    const { error: updateError } = await admin
      .from("subscriptions")
      .update({
        status: "active",
        cakto_customer_email: email,
        cakto_subscription_id: data.subscription?.id ?? null,
        cakto_order_id: orderId ?? null,
        current_period_end: nextPeriodEnd.toISOString(),
        // A real renewal landing means any earlier cancel request never
        // reached the seller in time (or was reconsidered) — clear it so
        // the UI stops showing a stale "cancellation pending" state.
        cancel_requested_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, matched: true, status: "active" });
  }

  const revokedStatus = REVOKE_EVENTS[event];
  if (revokedStatus) {
    const { error: updateError } = await admin
      .from("subscriptions")
      .update({ status: revokedStatus, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, matched: true, status: revokedStatus });
  }

  // Any other event (initiate_checkout, pix_gerado, etc.) — acknowledged, no action needed.
  return NextResponse.json({ ok: true, matched: true, status: "ignored" });
}
