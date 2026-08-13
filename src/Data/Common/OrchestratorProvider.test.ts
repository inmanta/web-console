import { act, renderHook } from "@testing-library/react";
import { ServerStatus as ServerStatusFixtures } from "@/Test";
import { OrchestratorProvider } from "./OrchestratorProvider";

describe("OrchestratorProvider", () => {
  test("GIVEN features have not been set yet WHEN reading feature flags THEN safe defaults are returned instead of throwing", () => {
    const { result } = renderHook(() => OrchestratorProvider());

    expect(() => result.current.isLsmEnabled()).not.toThrow();
    expect(result.current.isLsmEnabled()).toBe(false);
    expect(result.current.isSupportEnabled()).toBe(false);
    expect(result.current.isResourceDiscoveryEnabled()).toBe(false);
    expect(result.current.isOrderViewEnabled()).toBe(false);
    expect(result.current.isComposerEnabled()).toBe(false);
    expect(result.current.isLicencedFeatureEnabled("lsm.order")).toBe(false);
    expect(result.current.getServerVersion()).toBe("");
    expect(result.current.getServerMajorVersion()).toBe("");
    expect(result.current.getEdition()).toBe("");
    expect(result.current.getLicenseInformation()).toBeUndefined();
  });

  test("GIVEN features have been set WHEN reading feature flags THEN the actual values are returned", () => {
    const { result } = renderHook(() => OrchestratorProvider());

    act(() => {
      result.current.setAllFeatures(ServerStatusFixtures.withAllFeatures);
    });

    expect(result.current.isLsmEnabled()).toBe(true);
    expect(result.current.isOrderViewEnabled()).toBe(true);
    expect(result.current.getEdition()).toBe(ServerStatusFixtures.withAllFeatures.edition);
    expect(result.current.getLicenseInformation()).toEqual({
      projects: 1,
      environments: 2,
      service_entities: 1,
      resource_types: 12,
      resources: 185,
      licensee: "training0.inmanta.com",
      cert_valid_until: "2020-10-07T10:01:00.000000",
      entitlement_valid_until: "2021-10-07T20:06:38.000000",
    });
  });
});
