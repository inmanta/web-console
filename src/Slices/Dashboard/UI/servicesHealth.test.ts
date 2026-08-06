import { InstanceSummary, ServiceModel } from "@/Core/Domain/ServiceModel";
import { words } from "@/UI/words";
import { aggregateServicesHealth } from "./servicesHealth";

function makeServiceModel(instanceSummary: InstanceSummary | null): ServiceModel {
  return {
    name: "service",
    environment: "env-1",
    lifecycle: { initial_state: "start", states: [], transfers: [] },
    attributes: [],
    config: {},
    instance_summary: instanceSummary,
    embedded_entities: [],
    inter_service_relations: [],
    owner: null,
    owned_entities: [],
  };
}

function makeSummary(overrides: Partial<InstanceSummary["by_label"]> = {}): InstanceSummary {
  return {
    by_state: {},
    by_label: { success: 0, warning: 0, danger: 0, info: 0, no_label: 0, ...overrides },
    total: Object.values({
      success: 0,
      warning: 0,
      danger: 0,
      info: 0,
      no_label: 0,
      ...overrides,
    }).reduce((sum, count) => sum + Number(count), 0),
  };
}

describe("aggregateServicesHealth", () => {
  it("is healthy and sums instance counts across all service models when nothing is in warning or danger", () => {
    const health = aggregateServicesHealth([
      makeServiceModel(makeSummary({ success: 3 })),
      makeServiceModel(makeSummary({ success: 2 })),
    ]);

    expect(health.status).toEqual("healthy");
    expect(health.statLines).toEqual(
      words("dashboard.environmentHealth.servicesSummary")(5, 5, 0, 0)
    );
  });

  it("is in attention when any service model reports a warning instance", () => {
    const health = aggregateServicesHealth([
      makeServiceModel(makeSummary({ success: 1, warning: 1 })),
    ]);

    expect(health.status).toEqual("attention");
    expect(health.statLines).toEqual(
      words("dashboard.environmentHealth.servicesSummary")(2, 1, 1, 0)
    );
  });

  it("is in danger when any service model reports a danger instance, even alongside warnings", () => {
    const health = aggregateServicesHealth([
      makeServiceModel(makeSummary({ success: 1, warning: 1, danger: 1 })),
    ]);

    expect(health.status).toEqual("danger");
    expect(health.statLines).toEqual(
      words("dashboard.environmentHealth.servicesSummary")(3, 1, 1, 1)
    );
  });

  it("treats a missing instance_summary as all-zero rather than throwing", () => {
    const health = aggregateServicesHealth([makeServiceModel(null)]);

    expect(health.status).toEqual("healthy");
    expect(health.statLines).toEqual(
      words("dashboard.environmentHealth.servicesSummary")(0, 0, 0, 0)
    );
  });
});
