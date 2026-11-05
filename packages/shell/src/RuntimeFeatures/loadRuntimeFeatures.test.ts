import {
  FeatureModule,
  OrchestratorProvider,
  RuntimeFeatureEntry,
} from "@inmanta/web-console-core";
import { RuntimeFeature } from "./RuntimeFeature";
import { loadRuntimeFeatures } from "./loadRuntimeFeatures";

const orchestratorProvider = {} as OrchestratorProvider;
const singletons = { react: {}, dependencyContext: {} };
const options = { version: "1.0.0", singletons, onSingletonMismatch: "throw" } as const;

const feature = (id: string, version = "1.0.0"): FeatureModule => ({ id, version, routes: [] });

const runtimeFeature = (id: string, entry: Partial<RuntimeFeatureEntry> = {}): RuntimeFeature => ({
  id,
  load: vi.fn(() => Promise.resolve({ feature: feature(id), singletons, ...entry })),
});

describe("loadRuntimeFeatures", () => {
  test("GIVEN runtime features THEN it returns them in the order they are listed", async () => {
    const result = await loadRuntimeFeatures(
      [runtimeFeature("a"), runtimeFeature("b")],
      orchestratorProvider,
      options
    );

    expect(result).toEqual({ features: [feature("a"), feature("b")], mismatches: [] });
  });

  test("GIVEN a feature that isn't enabled THEN it is never fetched", async () => {
    const isEnabled = vi.fn(() => false);
    const disabled = { ...runtimeFeature("a"), isEnabled };

    const result = await loadRuntimeFeatures([disabled], orchestratorProvider, options);

    expect(isEnabled).toHaveBeenCalledWith(orchestratorProvider);
    expect(disabled.load).not.toHaveBeenCalled();
    expect(result.features).toEqual([]);
  });

  test("GIVEN a feature that fails to load THEN the others still load and it is left out with a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const missing: RuntimeFeature = { id: "a", load: () => Promise.reject(new Error("404")) };

    const result = await loadRuntimeFeatures(
      [missing, runtimeFeature("b")],
      orchestratorProvider,
      options
    );

    expect(result.features).toEqual([feature("b")]);
    expect(warn).toHaveBeenCalledWith(
      "The a feature could not be loaded, the app starts without it.",
      new Error("404")
    );
  });

  test("GIVEN a module that isn't an entry THEN it is left out with a warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrongShape = {
      id: "a",
      load: () => Promise.resolve({ default: feature("a") }),
    } as unknown as RuntimeFeature;

    const result = await loadRuntimeFeatures([wrongShape], orchestratorProvider, options);

    expect(result.features).toEqual([]);
    expect(warn).toHaveBeenCalledWith(
      "The a feature isn't a runtime feature entry, the app starts without it."
    );
  });

  test("GIVEN a feature built for another version THEN it is left out as a mismatch", async () => {
    const result = await loadRuntimeFeatures(
      [runtimeFeature("a", { feature: feature("a", "0.9.0") })],
      orchestratorProvider,
      options
    );

    expect(result).toEqual({ features: [], mismatches: [{ id: "a", version: "0.9.0" }] });
  });

  test("GIVEN a feature built with its own singletons WHEN mismatches throw THEN loading fails and names them", async () => {
    const ownCopy = runtimeFeature("a", { singletons: { ...singletons, react: {} } });

    await expect(loadRuntimeFeatures([ownCopy], orchestratorProvider, options)).rejects.toThrow(
      "The a feature has its own copy of react instead of the app's. Share these modules with its build."
    );
  });

  test("GIVEN a feature built with its own singletons WHEN mismatches leave it out THEN the others load and it is reported", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const ownCopy = runtimeFeature("a", { singletons: { ...singletons, react: {} } });

    const result = await loadRuntimeFeatures([ownCopy, runtimeFeature("b")], orchestratorProvider, {
      ...options,
      onSingletonMismatch: "leaveOut",
    });

    expect(result.features).toEqual([feature("b")]);
    expect(error).toHaveBeenCalledWith(
      "The a feature has its own copy of react instead of the app's. Share these modules with its build. The app starts without it."
    );
  });
});
