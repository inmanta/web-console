import { createStore } from "easy-peasy";
import { ServiceModel } from "@/Core";
import { servicesSlice } from "@/UI";

describe("ServicesSlice", () => {
  const serviceModels: ServiceModel[] = [
    {
      attributes: [],
      environment: "env-id",
      lifecycle: { initialState: "", states: [], transfers: [] },
      name: "test_service",
    },
    {
      attributes: [],
      environment: "env-id",
      lifecycle: { initialState: "", states: [], transfers: [] },
      name: "another_test_service",
    },
  ];
  const initialState = {
    allIds: ["test_service", "another_test_service"],
    byId: {
      another_test_service: serviceModels[1],
      test_service: serviceModels[0],
    },
  };

  it("Should add services to the store", () => {
    const store = createStore(servicesSlice);
    store.getActions().addServices(serviceModels);
    expect(store.getState().allIds).toEqual([
      "test_service",
      "another_test_service",
    ]);
  });

  it("Should update services if updated content is different", () => {
    const updatedContent = [
      {
        attributes: [],
        environment: "env-id",
        lifecycle: {
          initialState: "initial_state",
          states: [],
          transfers: [],
        },
        name: "test_service",
      },
    ];
    const store = createStore(servicesSlice, { initialState });
    store.getActions().updateServices(updatedContent);
    expect(store.getState().allIds).toEqual(["test_service"]);
    expect(Object.keys(store.getState().byId)).toEqual(["test_service"]);
  });

  it("Should not update services if updated content is the same", () => {
    const store = createStore(servicesSlice, {
      initialState,
      mockActions: true,
    });
    store.getActions().updateServices(serviceModels);

    expect(store.getMockedActions()).toEqual([
      { type: "@thunk.updateServices(start)", payload: serviceModels },
      { type: "@thunk.updateServices(success)", payload: serviceModels },
    ]);
  });
  it("Should remove service from the store", () => {
    const store = createStore(servicesSlice);
    store.getActions().addServices(serviceModels);
    expect(store.getState().allIds).toEqual([
      "test_service",
      "another_test_service",
    ]);
    store.getActions().removeSingleService("test_service");
    expect(store.getState().allIds).toEqual(["another_test_service"]);
  });
});
