import { describe, it, expect } from "vitest";
import crypto from "crypto";

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

  return computedHmac.toLowerCase() === receivedSignature.toLowerCase();
}

describe("Rapid Gateway HMAC-SHA256 Signature Verification", () => {
  const secretKey = "whsec_test_secret_key_123";

  it("should compute and verify valid HMAC-SHA256 webhook signature", () => {
    const rawBody = JSON.stringify({
      order_id: "BOOKING-999",
      amount: "2500.00",
      status: "SUCCEEDED",
    });

    const validSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("hex");

    const isValid = verifyRapidGatewaySignature(rawBody, validSignature, secretKey);
    expect(isValid).toBe(true);
  });

  it("should reject tampered raw request body", () => {
    const rawBody = JSON.stringify({
      order_id: "BOOKING-999",
      amount: "2500.00",
      status: "SUCCEEDED",
    });

    const validSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawBody)
      .digest("hex");

    const tamperedBody = JSON.stringify({
      order_id: "BOOKING-999",
      amount: "1.00", // Tampered amount
      status: "SUCCEEDED",
    });

    const isValid = verifyRapidGatewaySignature(tamperedBody, validSignature, secretKey);
    expect(isValid).toBe(false);
  });

  it("should reject signature generated with wrong secret key", () => {
    const rawBody = JSON.stringify({
      order_id: "BOOKING-999",
      amount: "2500.00",
      status: "SUCCEEDED",
    });

    const invalidSignature = crypto
      .createHmac("sha256", "wrong_secret_key")
      .update(rawBody)
      .digest("hex");

    const isValid = verifyRapidGatewaySignature(rawBody, invalidSignature, secretKey);
    expect(isValid).toBe(false);
  });
});
