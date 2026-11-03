import { expect, test } from "vitest";
import { errors } from "jose";
import { authFailureReason } from "./auth-diagnostics";
test("distinguishes audience and issuer without exposing token values", () => {
  for (const claim of ["aud", "iss"]) {
    const error = new errors.JWTClaimValidationFailed("secret-token-and-user", {}, claim, "check_failed");
    expect(authFailureReason(error)).toBe(claim === "aud" ? "invalid_audience" : "invalid_issuer");
  }
});
test("unknown exceptions and claim names are not logged", () => {
  expect(authFailureReason(new Error("secret-token"))).toBe("verification_failed");
  expect(authFailureReason(new errors.JWTClaimValidationFailed("secret", {}, "user-private-data", "check_failed"))).toBe("invalid_claim");
});
