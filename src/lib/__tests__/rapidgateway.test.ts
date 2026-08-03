/**
 * Webhook signature & business logic tests
 * Tests the pure functions extracted from the RapidGateway webhook handler.
 * No network calls — all Supabase interactions are mocked.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

// ─── Pure helper extracted for testing (mirrors route.ts) ───────────────────

function verifyRapidGatewaySignature(
  rawBody: string,
  receivedSignature: string,
  secretKey: string
): boolean {
  if (!receivedSignature || !secretKey) return false;

  const computedHmac = crypto
    .createHmac("sha256", secretKey)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHmac.toLowerCase()),
      Buffer.from(receivedSignature.toLowerCase())
    );
  } catch {
    return computedHmac.toLowerCase() === receivedSignature.toLowerCase();
  }
}

function makeSignature(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

// ─── Business logic helpers (mirroring webhook route logic) ──────────────────

function isPaymentSuccess(status: string): boolean {
  const s = status.toUpperCase();
  return (
    s === "SUCCEEDED" ||
    s === "PAID" ||
    s === "SUCCESS" ||
    s === "PAYMENT.SUCCEEDED"
  );
}

function isTopUpOrderId(orderId: string): boolean {
  return orderId.startsWith("TOPUP_");
}

function extractProfileIdFromTopUp(orderId: string): string {
  // Format: TOPUP_{uuid}_{timestamp}
  const parts = orderId.split("_");
  return parts[1];
}

function amountMatches(expected: number, received: number): boolean {
  if (expected <= 0) return true; // skip check if no expected amount
  return Math.abs(received - expected) <= 0.01;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("verifyRapidGatewaySignature", () => {
  const secret = "whsec_test_secret_key_123";

  it("returns true for a valid signature", () => {
    const body = JSON.stringify({ order_id: "BOOKING-1", amount: "500", status: "SUCCEEDED" });
    const sig = makeSignature(body, secret);
    expect(verifyRapidGatewaySignature(body, sig, secret)).toBe(true);
  });

  it("returns false when body is tampered", () => {
    const body = JSON.stringify({ order_id: "BOOKING-1", amount: "500", status: "SUCCEEDED" });
    const sig = makeSignature(body, secret);
    const tampered = JSON.stringify({ order_id: "BOOKING-1", amount: "1", status: "SUCCEEDED" });
    expect(verifyRapidGatewaySignature(tampered, sig, secret)).toBe(false);
  });

  it("returns false when wrong secret used to generate signature", () => {
    const body = JSON.stringify({ order_id: "BOOKING-1", amount: "500", status: "SUCCEEDED" });
    const sig = makeSignature(body, "wrong_secret");
    expect(verifyRapidGatewaySignature(body, sig, secret)).toBe(false);
  });

  it("returns false for empty signature", () => {
    const body = JSON.stringify({ status: "SUCCEEDED" });
    expect(verifyRapidGatewaySignature(body, "", secret)).toBe(false);
  });

  it("returns false for empty secret key", () => {
    const body = JSON.stringify({ status: "SUCCEEDED" });
    const sig = makeSignature(body, secret);
    expect(verifyRapidGatewaySignature(body, sig, "")).toBe(false);
  });

  it("is case-insensitive for hex signatures", () => {
    const body = JSON.stringify({ status: "PAID" });
    const sig = makeSignature(body, secret).toUpperCase();
    expect(verifyRapidGatewaySignature(body, sig, secret)).toBe(true);
  });
});

describe("isPaymentSuccess", () => {
  it.each(["SUCCEEDED", "PAID", "SUCCESS", "PAYMENT.SUCCEEDED"])(
    "returns true for '%s'",
    (status) => expect(isPaymentSuccess(status)).toBe(true)
  );

  it.each(["succeeded", "paid", "success"])(
    "returns true for lowercase '%s'",
    (status) => expect(isPaymentSuccess(status)).toBe(true)
  );

  it.each(["FAILED", "PENDING", "CANCELLED", "REFUNDED", ""])(
    "returns false for '%s'",
    (status) => expect(isPaymentSuccess(status)).toBe(false)
  );
});

describe("isTopUpOrderId", () => {
  it("returns true for TOPUP_ prefixed IDs", () => {
    expect(isTopUpOrderId("TOPUP_abc123_1234567890")).toBe(true);
  });

  it("returns false for regular booking IDs", () => {
    expect(isTopUpOrderId("BOOKING-999")).toBe(false);
    expect(isTopUpOrderId("")).toBe(false);
    expect(isTopUpOrderId("booking-topup")).toBe(false);
  });
});

describe("extractProfileIdFromTopUp", () => {
  it("extracts UUID from TOPUP_uuid_timestamp format", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    const orderId = `TOPUP_${uuid}_1722700000000`;
    expect(extractProfileIdFromTopUp(orderId)).toBe(uuid);
  });
});

describe("amountMatches", () => {
  it("returns true when amounts match exactly", () => {
    expect(amountMatches(1500, 1500)).toBe(true);
  });

  it("returns true within 0.01 tolerance (floating point)", () => {
    expect(amountMatches(1500, 1500.005)).toBe(true);
  });

  it("returns false when amounts differ significantly", () => {
    expect(amountMatches(1500, 1.0)).toBe(false);
    expect(amountMatches(1500, 0)).toBe(false);
  });

  it("skips check when expected amount is 0", () => {
    expect(amountMatches(0, 9999)).toBe(true);
  });
});
