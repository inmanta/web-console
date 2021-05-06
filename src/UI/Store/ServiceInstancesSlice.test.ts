import { RemoteData, ServiceInstanceModel } from "@/Core";
import { ServiceInstance } from "@/Test";
import { getStoreInstance } from "./Setup";

describe("ServiceInstancesSlice ", () => {
  const serviceInstancesFirstEnv: ServiceInstanceModel[] = [ServiceInstance.A];
  const serviceInstancesSecondEnv: ServiceInstanceModel[] = [
    { ...ServiceInstance.A, environment: "env-id" },
  ];

  it("differentiates correctly between services with the same name and different environment", () => {
    const store = getStoreInstance();
    store
      .getActions()
      .environments.selectEnvironmentById(
        serviceInstancesFirstEnv[0].environment
      );
    const firstQualifier = { name: serviceInstancesFirstEnv[0].service_entity };
    // Add instances for a service
    store.getActions().serviceInstances.setData({
      qualifier: firstQualifier,
      value: RemoteData.success({
        data: serviceInstancesFirstEnv,
        links: { self: "" },
        metadata: { page_size: 1, total: 1, before: 0, after: 0 },
      }),
      environment: serviceInstancesFirstEnv[0].environment,
    });

    expect(
      store
        .getState()
        .serviceInstances.instancesWithTargetStates(
          firstQualifier,
          serviceInstancesFirstEnv[0].environment
        )
    ).toEqual(
      RemoteData.success({
        data: [{ ...serviceInstancesFirstEnv[0], instanceSetStateTargets: [] }],
        links: { self: "" },
        metadata: { page_size: 1, total: 1, before: 0, after: 0 },
      })
    );

    // Check if instances for a service with the same name but different environment return loading state if they are not loaded yet
    const secondQualifier = {
      name: serviceInstancesSecondEnv[0].service_entity,
    };
    expect(
      store
        .getState()
        .serviceInstances.instancesWithTargetStates(
          secondQualifier,
          serviceInstancesSecondEnv[0].environment
        )
    ).toEqual(RemoteData.loading());
    // Load the instances in the second environment
    store.getActions().serviceInstances.setData({
      qualifier: secondQualifier,
      value: RemoteData.success({
        data: serviceInstancesSecondEnv,
        links: { self: "" },
        metadata: { page_size: 1, total: 1, before: 0, after: 0 },
      }),
      environment: serviceInstancesSecondEnv[0].environment,
    });
    // Make sure the query now returns the correct instance list and not loading state
    expect(
      store
        .getState()
        .serviceInstances.instancesWithTargetStates(
          secondQualifier,
          serviceInstancesSecondEnv[0].environment
        )
    ).toEqual(
      RemoteData.success({
        data: [
          { ...serviceInstancesSecondEnv[0], instanceSetStateTargets: [] },
        ],
        links: { self: "" },
        metadata: { page_size: 1, total: 1, before: 0, after: 0 },
      })
    );
  });
});
