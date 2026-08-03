/**
 * Booking state machine tests
 * Validates the allowed transitions between booking statuses
 * and the business rules around cancellations, completions etc.
 */
import { describe, it, expect } from "vitest";

// ─── Booking status state machine ─────────────────────────────────────────────
// Mirrors the business logic that should be enforced in booking mutations.

type BookingStatus =
  | "pending"
  | "accepted"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending:     ["accepted", "cancelled"],
  accepted:    ["confirmed", "cancelled"],
  confirmed:   ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed:   [], // terminal state
  cancelled:   [], // terminal state
};

function isValidTransition(from: BookingStatus, to: BookingStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

function isTerminalStatus(status: BookingStatus): boolean {
  return status === "completed" || status === "cancelled";
}

// ─── Payment status logic ─────────────────────────────────────────────────────

type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

function canRefund(paymentStatus: PaymentStatus, bookingStatus: BookingStatus): boolean {
  // Refunds are only allowed when payment was made and booking is cancelled or completed with dispute
  return paymentStatus === "paid" && bookingStatus === "cancelled";
}

function canCancelBooking(bookingStatus: BookingStatus, paymentStatus: PaymentStatus): boolean {
  // Cannot cancel if already in terminal state or if payment is already paid and not refundable
  if (isTerminalStatus(bookingStatus)) return false;
  // Allow cancel if unpaid
  if (paymentStatus === "unpaid") return true;
  // Allow cancel even if paid (will trigger refund flow)
  if (paymentStatus === "paid") return true;
  return false;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Booking Status State Machine", () => {
  describe("valid transitions", () => {
    it("pending → accepted", () => expect(isValidTransition("pending", "accepted")).toBe(true));
    it("pending → cancelled", () => expect(isValidTransition("pending", "cancelled")).toBe(true));
    it("accepted → confirmed", () => expect(isValidTransition("accepted", "confirmed")).toBe(true));
    it("accepted → cancelled", () => expect(isValidTransition("accepted", "cancelled")).toBe(true));
    it("confirmed → in_progress", () => expect(isValidTransition("confirmed", "in_progress")).toBe(true));
    it("confirmed → cancelled", () => expect(isValidTransition("confirmed", "cancelled")).toBe(true));
    it("in_progress → completed", () => expect(isValidTransition("in_progress", "completed")).toBe(true));
    it("in_progress → cancelled", () => expect(isValidTransition("in_progress", "cancelled")).toBe(true));
  });

  describe("invalid transitions", () => {
    it("pending → completed (skip steps)", () => expect(isValidTransition("pending", "completed")).toBe(false));
    it("pending → in_progress (skip steps)", () => expect(isValidTransition("pending", "in_progress")).toBe(false));
    it("completed → cancelled (terminal)", () => expect(isValidTransition("completed", "cancelled")).toBe(false));
    it("completed → pending (reverse)", () => expect(isValidTransition("completed", "pending")).toBe(false));
    it("cancelled → accepted (reverse)", () => expect(isValidTransition("cancelled", "accepted")).toBe(false));
    it("in_progress → pending (reverse)", () => expect(isValidTransition("in_progress", "pending")).toBe(false));
    it("accepted → pending (reverse)", () => expect(isValidTransition("accepted", "pending")).toBe(false));
  });

  describe("terminal states", () => {
    it("completed is terminal", () => expect(isTerminalStatus("completed")).toBe(true));
    it("cancelled is terminal", () => expect(isTerminalStatus("cancelled")).toBe(true));
    it("pending is not terminal", () => expect(isTerminalStatus("pending")).toBe(false));
    it("in_progress is not terminal", () => expect(isTerminalStatus("in_progress")).toBe(false));
  });
});

describe("Refund Logic", () => {
  it("allows refund for paid + cancelled booking", () => {
    expect(canRefund("paid", "cancelled")).toBe(true);
  });

  it("does not allow refund for unpaid booking", () => {
    expect(canRefund("unpaid", "cancelled")).toBe(false);
  });

  it("does not allow refund for paid + completed booking (no dispute)", () => {
    expect(canRefund("paid", "completed")).toBe(false);
  });

  it("does not allow refund for failed payment", () => {
    expect(canRefund("failed", "cancelled")).toBe(false);
  });
});

describe("Cancellation Rules", () => {
  it("allows cancellation of pending + unpaid booking", () => {
    expect(canCancelBooking("pending", "unpaid")).toBe(true);
  });

  it("allows cancellation of confirmed + paid booking (triggers refund)", () => {
    expect(canCancelBooking("confirmed", "paid")).toBe(true);
  });

  it("prevents cancellation of completed booking", () => {
    expect(canCancelBooking("completed", "paid")).toBe(false);
  });

  it("prevents cancellation of already cancelled booking", () => {
    expect(canCancelBooking("cancelled", "unpaid")).toBe(false);
  });
});
