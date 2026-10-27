import {
  ExtensionPointRegistry,
  isLinkActionVisible,
  OrchestratorProvider,
} from "@inmanta/web-console-core";
import { MockOrchestratorProvider } from "@inmanta/web-console-test-utils";
import { composerFeature } from ".";

/**
 * Returns the ids of the links the composer contributes to an extension point that are visible
 * with the given license.
 */
const visibleIds = (point: keyof ExtensionPointRegistry, composerEnabled: boolean): string[] => {
  const orchestratorProvider: OrchestratorProvider = new MockOrchestratorProvider();
  orchestratorProvider.isComposerEnabled = () => composerEnabled;

  return (composerFeature.contributions?.[point] ?? [])
    .filter((action) => isLinkActionVisible(action, orchestratorProvider))
    .map(({ id }) => id);
};

describe("composerFeature contributions", () => {
  it("offers the composer on the inventory only when the license includes it", () => {
    expect(visibleIds("inventory.addInstance.actions", true)).toEqual([
      "add-instance-composer-button",
    ]);
    expect(visibleIds("inventory.row.actions", true)).toEqual(["edit-composer", "show-composer"]);

    expect(visibleIds("inventory.addInstance.actions", false)).toEqual([]);
    expect(visibleIds("inventory.row.actions", false)).toEqual([]);
  });

  it("offers the read-only view on the instance details when the license doesn't include it", () => {
    expect(visibleIds("instance.actions", true)).toEqual(["edit-composer"]);
    expect(visibleIds("instance.actions", false)).toEqual(["show-composer"]);
  });

  it("disables editing when the instance can't be updated", () => {
    const [editInComposer] = composerFeature.contributions?.["instance.actions"] ?? [];
    const context = { service: "service", instance: "instance" };

    expect(editInComposer.isDisabled?.({ ...context, editDisabled: true })).toBe(true);
    expect(editInComposer.isDisabled?.({ ...context, editDisabled: false })).toBe(false);
  });
});
