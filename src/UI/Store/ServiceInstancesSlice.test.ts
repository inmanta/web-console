import { createStore } from "easy-peasy";
import { ServiceInstanceModel } from "@/Core";
import { serviceInstancesSlice } from "@/UI";

describe("Service instance store", () => {
  const instances: ServiceInstanceModel[] = [
    {
      active_attributes: {},
      callback: [],
      candidate_attributes: {},
      deleted: false,
      environment: "env-id",
      id: "instance",
      last_updated: "2019-10-16T07:43:16.748302",
      created_at: "2019-10-16T07:43:16.748302",
      rollback_attributes: {},
      service_entity: "test-service",
      state: "terminated",
      version: 1,
    },
    {
      active_attributes: {},
      callback: [],
      candidate_attributes: {},
      deleted: false,
      environment: "env-id",
      id: "anotherInstance",
      last_updated: "2019-10-16T08:43:16.748302",
      created_at: "2019-10-16T08:43:16.748302",
      rollback_attributes: {},
      service_entity: "test-service",
      state: "up",
      version: 1,
    },
  ];
  const initialState = {
    allIds: ["instance", "anotherInstance"],
    byId: {
      anotherInstance: instances[1],
      instance: instances[0],
    },
  };
  it("Should add instances", () => {
    const store = createStore(serviceInstancesSlice);
    store.getActions().addInstances(instances);
    expect(store.getState().allIds).toEqual(["instance", "anotherInstance"]);
  });
  it("Should update instances", () => {
    const store = createStore(serviceInstancesSlice, { initialState });
    store.getActions().updateInstances({
      instances: [
        {
          active_attributes: {},
          callback: [],
          candidate_attributes: {},
          deleted: false,
          environment: "env-id",
          id: "instance",
          last_updated: "2019-10-16T11:43:16.748302",
          created_at: "2019-10-16T11:43:16.748302",
          rollback_attributes: {},
          service_entity: "test-service",
          state: "up",
          version: 3,
        },
      ],
      serviceName: "test-service",
    });
    expect(store.getState().byId.instance.state).toEqual("up");
  });
  it("Should not update instances, if the content is the same", () => {
    const store = createStore(serviceInstancesSlice, {
      initialState,
      mockActions: true,
    });
    const payload = { serviceName: "test-service", instances };
    store.getActions().updateInstances(payload);
    expect(store.getMockedActions()).toEqual([
      { type: "@thunk.updateInstances(start)", payload },
      { type: "@thunk.updateInstances(success)", payload },
    ]);
  });
});
