import { NextResponse } from "next/server";
import { deleteCaktoProduct, fetchCaktoOffer, listCaktoProducts, updateCaktoOffer } from "@/lib/cakto";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { timingSafeEqualString } from "@/lib/timing-safe-equal";

/**
 * Lets an operator read or change the live Cakto offer's price/trial length
 * without dashboard access to the (business partner's) Cakto account —
 * Cakto's API has no concept of scoped/read-only credentials, so this is
 * guarded by its own narrow secret rather than exposing CAKTO_CLIENT_SECRET
 * directly to whoever needs to trigger a price change.
 */
function authorized(request: Request): boolean {
  const expected = process.env.CAKTO_OFFER_ADMIN_SECRET;
  const provided = request.headers.get("x-admin-secret");
  return Boolean(expected) && Boolean(provided) && timingSafeEqualString(provided!, expected!);
}

function checkRateLimit(request: Request): boolean {
  return rateLimit(`admin-cakto-offer:${getClientIp(request)}`, 20, 5 * 60 * 1000).allowed;
}

export async function GET(request: Request) {
  if (!checkRateLimit(request)) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  if (url.searchParams.get("resource") === "products") {
    const products = await listCaktoProducts();
    if (!products) return NextResponse.json({ error: "failed to fetch products" }, { status: 502 });
    return NextResponse.json(products);
  }

  const offerId = process.env.NEXT_PUBLIC_CAKTO_OFFER_ID;
  if (!offerId) return NextResponse.json({ error: "NEXT_PUBLIC_CAKTO_OFFER_ID not configured" }, { status: 500 });

  const offer = await fetchCaktoOffer(offerId);
  if (!offer) return NextResponse.json({ error: "failed to fetch offer" }, { status: 502 });
  return NextResponse.json(offer);
}

export async function PUT(request: Request) {
  if (!checkRateLimit(request)) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const offerId = process.env.NEXT_PUBLIC_CAKTO_OFFER_ID;
  if (!offerId) return NextResponse.json({ error: "NEXT_PUBLIC_CAKTO_OFFER_ID not configured" }, { status: 500 });

  const body = await request.json();
  const patch: { price?: number; trial_days?: number } = {};
  if (typeof body.price === "number") patch.price = body.price;
  if (typeof body.trial_days === "number") patch.trial_days = body.trial_days;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "provide price and/or trial_days" }, { status: 400 });
  }

  const result = await updateCaktoOffer(offerId, patch);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result.data);
}

export async function DELETE(request: Request) {
  if (!checkRateLimit(request)) return NextResponse.json({ error: "too many requests" }, { status: 429 });
  if (!authorized(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId query param required" }, { status: 400 });

  const result = await deleteCaktoProduct(productId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return new NextResponse(null, { status: 204 });
}
