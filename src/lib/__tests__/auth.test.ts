/**
 * Auth & middleware route protection logic tests
 * Tests the route classification and access-control rules
 * used by the middleware and server actions.
 */
import { describe, it, expect } from "vitest";

// ─── Route protection rules (mirroring middleware/auth logic) ─────────────────

type UserRole = "client" | "tasker" | "admin" | null;

interface RouteAccessResult {
  allowed: boolean;
  redirectTo?: string;
}

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const ADMIN_ONLY_PREFIXES = ["/admin"];
const PUBLIC_ONLY_PREFIXES = ["/login", "/register"]; // Redirect authenticated users away

function checkRouteAccess(
  pathname: string,
  userRole: UserRole,
  isAuthenticated: boolean
): RouteAccessResult {
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdminOnly = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicOnly = PUBLIC_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  // Authenticated user trying to access login/register
  if (isAuthenticated && isPublicOnly) {
    return { allowed: false, redirectTo: "/dashboard" };
  }

  // Protected route requires authentication
  if (isProtected && !isAuthenticated) {
    return { allowed: false, redirectTo: "/login" };
  }

  // Admin-only route requires admin role
  if (isAdminOnly && userRole !== "admin") {
    return { allowed: false, redirectTo: "/dashboard" };
  }

  return { allowed: true };
}

// ─── Email validation (used in auth forms) ────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Password validation ──────────────────────────────────────────────────────

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain an uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain a number");
  return { valid: errors.length === 0, errors };
}

// ─── Session token helpers ────────────────────────────────────────────────────

function isTokenExpired(expiresAt: number, nowMs = Date.now()): boolean {
  return nowMs >= expiresAt * 1000; // Supabase uses Unix seconds
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Route Access Control", () => {
  describe("public routes — unauthenticated", () => {
    it("allows unauthenticated access to homepage", () => {
      const result = checkRouteAccess("/", null, false);
      expect(result.allowed).toBe(true);
    });

    it("allows unauthenticated access to /search", () => {
      const result = checkRouteAccess("/search", null, false);
      expect(result.allowed).toBe(true);
    });

    it("allows unauthenticated access to /tasker/[id]", () => {
      const result = checkRouteAccess("/tasker/some-id", null, false);
      expect(result.allowed).toBe(true);
    });

    it("allows unauthenticated access to /login", () => {
      const result = checkRouteAccess("/login", null, false);
      expect(result.allowed).toBe(true);
    });
  });

  describe("protected routes — unauthenticated users", () => {
    it("blocks /dashboard and redirects to /login", () => {
      const result = checkRouteAccess("/dashboard", null, false);
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe("/login");
    });

    it("blocks /dashboard/bookings and redirects to /login", () => {
      const result = checkRouteAccess("/dashboard/bookings", null, false);
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe("/login");
    });

    it("blocks /admin and redirects to /login", () => {
      const result = checkRouteAccess("/admin", null, false);
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe("/login");
    });
  });

  describe("admin routes — non-admin roles", () => {
    it("blocks client from /admin", () => {
      const result = checkRouteAccess("/admin", "client", true);
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe("/dashboard");
    });

    it("blocks tasker from /admin/revenue", () => {
      const result = checkRouteAccess("/admin/revenue", "tasker", true);
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe("/dashboard");
    });

    it("allows admin access to /admin/bookings", () => {
      const result = checkRouteAccess("/admin/bookings", "admin", true);
      expect(result.allowed).toBe(true);
    });

    it("allows admin access to /admin/disputes", () => {
      const result = checkRouteAccess("/admin/disputes", "admin", true);
      expect(result.allowed).toBe(true);
    });
  });

  describe("authenticated users on public-only routes", () => {
    it("redirects authenticated user away from /login", () => {
      const result = checkRouteAccess("/login", "client", true);
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe("/dashboard");
    });

    it("redirects authenticated user away from /register", () => {
      const result = checkRouteAccess("/register", "tasker", true);
      expect(result.allowed).toBe(false);
      expect(result.redirectTo).toBe("/dashboard");
    });
  });
});

describe("Email Validation", () => {
  it.each([
    "user@example.com",
    "user.name+tag@domain.co.pk",
    "admin@errandowl.com.pk",
  ])("accepts valid email: %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each([
    "",
    "notanemail",
    "missing@tld",
    "@nodomain.com",
    "spaces @domain.com",
  ])("rejects invalid email: %s", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe("Password Validation", () => {
  it("accepts a strong password", () => {
    const result = validatePassword("StrongPass1");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = validatePassword("Ab1");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters");
  });

  it("rejects password without uppercase letter", () => {
    const result = validatePassword("lowercase1");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain an uppercase letter");
  });

  it("rejects password without a number", () => {
    const result = validatePassword("NoNumbers!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain a number");
  });

  it("returns multiple errors for weak password", () => {
    const result = validatePassword("weak");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe("Session Token Expiry", () => {
  const nowSeconds = Math.floor(Date.now() / 1000);

  it("returns false for a non-expired token", () => {
    const futureExpiry = nowSeconds + 3600; // 1 hour from now
    expect(isTokenExpired(futureExpiry)).toBe(false);
  });

  it("returns true for an expired token", () => {
    const pastExpiry = nowSeconds - 3600; // 1 hour ago
    expect(isTokenExpired(pastExpiry)).toBe(true);
  });

  it("returns true for a token expiring exactly now", () => {
    expect(isTokenExpired(nowSeconds, nowSeconds * 1000)).toBe(true);
  });
});
