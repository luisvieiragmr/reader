import { expect, test } from "vitest";
import { oauthScopes } from "./oauth-scopes";
test("supports both claim formats and follows Clerk's scp precedence", () => {
  expect(oauthScopes({ scp: ["profile"] })).toEqual(["profile"]);
  expect(oauthScopes({ scope: "openid profile" })).toEqual(["openid", "profile"]);
  expect(oauthScopes({ scp: ["email"], scope: "profile" })).toEqual(["email"]);
});
test("missing or malformed scopes do not grant access", () => {
  for (const claims of [{}, { scp: "profile" }, { scp: ["profile", 1] }, { scope: ["profile"] }, { scp: [], scope: "profile" }]) {
    expect(oauthScopes(claims)).toEqual([]);
  }
});
