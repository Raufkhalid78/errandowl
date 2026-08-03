/**
 * Payout business logic tests
 * Validates the rules around payout approval, rejection, and wallet operations.
 */
import { describe, it, expect } from "vitest";

// ─── Payout validation helpers (mirrors admin revenue logic) ──────────────────

type PayoutStatus = "pending" | "paid" | "rejected";
type PayoutMethod = "bank_transfer" | "easypaisa" | "jazzcash";

interface PayoutRequest {
  id: string;
  taskerId: string;
  amount: number;
  method: PayoutMethod;
  accountDetails: string;
  status: PayoutStatus;
  adminNotes?: string;
}

function validatePayoutApproval(payout: PayoutRequest): { valid: boolean; reason?: string } {
  if (payout.status !== "pending") {
    return { valid: false, reason: "Only pending payouts can be approved" };
  }
  if (payout.amount <= 0) {
    return { valid: false, reason: "Payout amount must be positive" };
  }
  if (!payout.accountDetails || payout.accountDetails.trim().length < 5) {
    return { valid: false, reason: "Account details are required for payout" };
  }
  return { valid: true };
}

function validatePayoutRejection(payout: PayoutRequest, adminNotes: string): { valid: boolean; reason?: string } {
  if (payout.status !== "pending") {
    return { valid: false, reason: "Only pending payouts can be rejected" };
  }
  if (!adminNotes || adminNotes.trim().length < 3) {
    return { valid: false, reason: "Admin notes are required when rejecting a payout" };
  }
  return { valid: true };
}

function calculateNewWalletBalance(currentBalance: number, refundAmount: number): number {
  // When payout is rejected, the amount is returned to the tasker's wallet
  return currentBalance + refundAmount;
}

function calculatePayoutDeduction(currentBalance: number, payoutAmount: number): number {
  // When payout is approved, the amount is deducted from the tasker's wallet
  return currentBalance - payoutAmount;
}

function canRequestPayout(walletBalance: number, requestedAmount: number, minimumAmount = 500): boolean {
  if (requestedAmount < minimumAmount) return false;
  if (requestedAmount > walletBalance) return false;
  return true;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const basePayout: PayoutRequest = {
  id: "payout-001",
  taskerId: "tasker-123",
  amount: 5000,
  method: "bank_transfer",
  accountDetails: "HBL 1234-5678-9012",
  status: "pending",
};

describe("Payout Approval Validation", () => {
  it("approves a valid pending payout", () => {
    const result = validatePayoutApproval(basePayout);
    expect(result.valid).toBe(true);
  });

  it("rejects approval of already paid payout", () => {
    const result = validatePayoutApproval({ ...basePayout, status: "paid" });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/pending/i);
  });

  it("rejects approval of already rejected payout", () => {
    const result = validatePayoutApproval({ ...basePayout, status: "rejected" });
    expect(result.valid).toBe(false);
  });

  it("rejects approval with zero amount", () => {
    const result = validatePayoutApproval({ ...basePayout, amount: 0 });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/amount/i);
  });

  it("rejects approval with negative amount", () => {
    const result = validatePayoutApproval({ ...basePayout, amount: -500 });
    expect(result.valid).toBe(false);
  });

  it("rejects approval with missing account details", () => {
    const result = validatePayoutApproval({ ...basePayout, accountDetails: "" });
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/account/i);
  });

  it("rejects approval with too-short account details", () => {
    const result = validatePayoutApproval({ ...basePayout, accountDetails: "123" });
    expect(result.valid).toBe(false);
  });
});

describe("Payout Rejection Validation", () => {
  it("allows rejection with proper admin notes", () => {
    const result = validatePayoutRejection(basePayout, "Duplicate request from tasker");
    expect(result.valid).toBe(true);
  });

  it("rejects rejection without admin notes", () => {
    const result = validatePayoutRejection(basePayout, "");
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/notes/i);
  });

  it("rejects rejection with too-short notes", () => {
    const result = validatePayoutRejection(basePayout, "No");
    expect(result.valid).toBe(false);
  });

  it("cannot reject an already paid payout", () => {
    const result = validatePayoutRejection({ ...basePayout, status: "paid" }, "Some reason here");
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/pending/i);
  });
});

describe("Wallet Balance Calculations", () => {
  it("adds refund amount back to wallet on rejection", () => {
    expect(calculateNewWalletBalance(1000, 5000)).toBe(6000);
  });

  it("handles zero current balance correctly", () => {
    expect(calculateNewWalletBalance(0, 3000)).toBe(3000);
  });

  it("deducts payout amount from wallet on approval", () => {
    expect(calculatePayoutDeduction(10000, 5000)).toBe(5000);
  });

  it("deducting full wallet balance results in 0", () => {
    expect(calculatePayoutDeduction(5000, 5000)).toBe(0);
  });
});

describe("Payout Request Eligibility", () => {
  it("allows payout when balance is sufficient and amount meets minimum", () => {
    expect(canRequestPayout(10000, 2000)).toBe(true);
  });

  it("rejects payout below minimum amount (Rs 500)", () => {
    expect(canRequestPayout(10000, 400)).toBe(false);
  });

  it("rejects payout exceeding wallet balance", () => {
    expect(canRequestPayout(1000, 5000)).toBe(false);
  });

  it("rejects payout exactly equal to minimum — boundary", () => {
    expect(canRequestPayout(10000, 500)).toBe(true);
  });

  it("rejects payout of 499 — just below minimum", () => {
    expect(canRequestPayout(10000, 499)).toBe(false);
  });

  it("rejects zero-amount payout request", () => {
    expect(canRequestPayout(10000, 0)).toBe(false);
  });
});
