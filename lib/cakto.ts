const CAKTO_API_BASE = "https://api.cakto.com.br";

interface CachedToken {
  value: string;
  expiresAt: number;
}

// Reused across requests while a serverless function instance stays warm —
// just an optimization, not a correctness requirement (a cold start simply
// re-fetches a token).
let cachedToken: CachedToken | null = null;

/**
 * Cakto's REST API uses OAuth2 client-credentials, not a static API key —
 * there's no refresh-token endpoint per their docs, so an expired token is
 * just re-requested from scratch.
 */
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.CAKTO_CLIENT_ID;
  const clientSecret = process.env.CAKTO_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
    return cachedToken.value;
  }

  const response = await fetch(`${CAKTO_API_BASE}/public_api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
  });
  if (!response.ok) return null;

  const data: { access_token: string; expires_in: number } = await response.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

async function caktoGet<T>(path: string): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const response = await fetch(`${CAKTO_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return null;
  return response.json();
}

async function caktoPut<T>(path: string, body: Record<string, unknown>): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, status: 401, error: "Unable to obtain Cakto access token" };

  const response = await fetch(`${CAKTO_API_BASE}${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) return { ok: false, status: response.status, error: text };
  return { ok: true, data: text ? JSON.parse(text) : (null as T) };
}

async function caktoDelete(path: string): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const token = await getAccessToken();
  if (!token) return { ok: false, status: 401, error: "Unable to obtain Cakto access token" };

  const response = await fetch(`${CAKTO_API_BASE}${path}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) return { ok: false, status: response.status, error: await response.text() };
  return { ok: true };
}

export interface CaktoOrder {
  id: string;
  status: string;
  customer?: { email?: string };
}

export interface CaktoSubscription {
  id: string;
  status: string;
  next_payment_date?: string;
}

/**
 * Confirms an order's real status directly with Cakto, rather than trusting
 * a webhook payload alone — Cakto's webhook authenticity check is a static
 * `secret` string embedded in the request body, not a cryptographic
 * signature, so anything that grants ad-free access re-confirms against the
 * API first. See app/api/webhooks/cakto/route.ts.
 */
export function fetchCaktoOrder(orderId: string): Promise<CaktoOrder | null> {
  return caktoGet<CaktoOrder>(`/public_api/orders/${orderId}/`);
}

export function fetchCaktoSubscription(subscriptionId: string): Promise<CaktoSubscription | null> {
  return caktoGet<CaktoSubscription>(`/public_api/subscriptions/${subscriptionId}/`);
}

export interface CaktoOffer {
  id: string;
  name: string;
  price: number;
  trial_days: number;
  status: string;
  type: string;
}

export function fetchCaktoOffer(offerId: string): Promise<CaktoOffer | null> {
  return caktoGet<CaktoOffer>(`/public_api/offers/${offerId}/`);
}

export interface CaktoProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  status: string;
  category: { id: string; name: string } | null;
}

export function listCaktoProducts(): Promise<{ results: CaktoProduct[] } | null> {
  return caktoGet<{ results: CaktoProduct[] }>(`/public_api/products/`);
}

/** Irreversible — orders/transactions tied to the product stay in history, but the product itself is gone for good. */
export function deleteCaktoProduct(productId: string) {
  return caktoDelete(`/public_api/products/${productId}/`);
}

/** Partial update — only send the fields being changed. */
export function updateCaktoOffer(offerId: string, patch: Partial<Pick<CaktoOffer, "price" | "trial_days">>) {
  return caktoPut<CaktoOffer>(`/public_api/offers/${offerId}/`, patch);
}
