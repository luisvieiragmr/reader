import { errors } from "jose";

export class MissingMcpScope extends Error {}

/** Fixed labels only: never log tokens, decoded claims, or exception messages. */
export function authFailureReason(error: unknown): string {
  if (error instanceof MissingMcpScope) return "missing_profile_scope";
  if (error instanceof errors.JWTExpired) return "expired_token";
  if (error instanceof errors.JWTClaimValidationFailed) {
    switch (error.claim) {
      case "aud": return "invalid_audience";
      case "iss": return "invalid_issuer";
      case "sub": return "missing_subject";
      case "iat": return "missing_issued_at";
      case "exp": return "invalid_expiration";
      default: return "invalid_claim";
    }
  }
  if (error instanceof errors.JWSSignatureVerificationFailed) return "invalid_signature";
  if (error instanceof errors.JWKSNoMatchingKey) return "unknown_signing_key";
  if (error instanceof errors.JWKSTimeout) return "signing_keys_timeout";
  if (error instanceof errors.JWSInvalid || error instanceof errors.JWTInvalid) return "invalid_jwt_format";
  return "verification_failed";
}
