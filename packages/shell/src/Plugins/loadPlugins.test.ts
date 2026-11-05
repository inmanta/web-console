import { FeatureModule, OrchestratorProvider, PluginModule } from "@inmanta/web-console-core";
import { AppPlugin } from "./AppPlugin";
import { loadPlugins } from "./loadPlugins";

const orchestratorProvider = {} as OrchestratorProvider;
const sharedInstances = { react: {}, dependencyContext: {} };

const feature = (id: string, version = "1.0.0"): FeatureModule => ({ id, version, routes: [] });

const plugin = (id: string, module: Partial<PluginModule> = {}): AppPlugin => ({
  id,
  load: vi.fn(() => Promise.resolve({ feature: feature(id), sharedInstances, ...module })),
});

describe("loadPlugins", () => {
  test("GIVEN plugins THEN it returns their features in the order of the plugins", async () => {
    const result = await loadPlugins([plugin("a"), plugin("b")], orchestratorProvider, {
      version: "1.0.0",
    });

    expect(result).toEqual({ features: [feature("a"), feature("b")], mismatches: [] });
  });

  test("GIVEN a plugin that isn't enabled THEN it is never fetched", async () => {
    const isEnabled = vi.fn(() => false);
    const disabled = { ...plugin("a"), isEnabled };

    const result = await loadPlugins([disabled], orchestratorProvider, { version: "1.0.0" });

    expect(isEnabled).toHaveBeenCalledWith(orchestratorProvider);
    expect(disabled.load).not.toHaveBeenCalled();
    expect(result.features).toEqual([]);
  });

  test("GIVEN a plugin that fails to load THEN the others still load and it is left out with a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const missing: AppPlugin = { id: "a", load: () => Promise.reject(new Error("404")) };

    const result = await loadPlugins([missing, plugin("b")], orchestratorProvider, {
      version: "1.0.0",
    });

    expect(result.features).toEqual([feature("b")]);
    expect(warn).toHaveBeenCalledWith(
      "The a plugin could not be loaded, the app starts without it.",
      new Error("404")
    );
  });

  test("GIVEN a plugin built for another version THEN it is left out as a mismatch", async () => {
    const result = await loadPlugins(
      [plugin("a", { feature: feature("a", "0.9.0") })],
      orchestratorProvider,
      { version: "1.0.0" }
    );

    expect(result).toEqual({ features: [], mismatches: [{ id: "a", version: "0.9.0" }] });
  });

  test("GIVEN the app's shared instances WHEN a plugin has the same ones THEN it loads", async () => {
    const result = await loadPlugins([plugin("a")], orchestratorProvider, {
      version: "1.0.0",
      sharedInstances,
    });

    expect(result.features).toEqual([feature("a")]);
  });

  test("GIVEN the app's shared instances WHEN a plugin has its own copy THEN loading fails and names it", async () => {
    const ownCopy = plugin("a", { sharedInstances: { ...sharedInstances, react: {} } });

    await expect(
      loadPlugins([ownCopy], orchestratorProvider, { version: "1.0.0", sharedInstances })
    ).rejects.toThrow(
      "The a plugin has its own copy of react instead of the app's. Share these modules with the plugin."
    );
  });
});
