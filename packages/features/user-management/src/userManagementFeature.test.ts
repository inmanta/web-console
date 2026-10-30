import { isLinkActionVisible } from "@inmanta/web-console-core";
import { AuthContextInterface, defaultAuthContext } from "@inmanta/web-console-core/Auth";
import { MockOrchestratorProvider } from "@inmanta/web-console-test-utils";
import { userManagementFeature } from ".";

/**
 * Whether the user menu shows the user management link for this login.
 */
const isShown = (auth: Partial<AuthContextInterface>): boolean =>
  (userManagementFeature.contributions?.["header.user.actions"] ?? []).some((action) =>
    isLinkActionVisible(action, new MockOrchestratorProvider(), { ...defaultAuthContext, ...auth })
  );

describe("userManagementFeature contributions", () => {
  it("adds the user management link to the user menu for a database session", () => {
    expect(isShown({ isDisabled: () => false, isDatabaseSession: () => true })).toBe(true);
  });

  it("leaves it out when users are managed elsewhere, or there is no login", () => {
    expect(isShown({ isDisabled: () => false, isDatabaseSession: () => false })).toBe(false);
    expect(isShown({ isDisabled: () => true, isDatabaseSession: () => true })).toBe(false);
  });
});
