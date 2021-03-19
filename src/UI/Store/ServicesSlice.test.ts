import { createStore } from "easy-peasy";
import { RemoteData, ServiceModel } from "@/Core";
import { servicesSlice } from "./ServicesSlice";

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

  it("SetList adds services to the store", () => {
    const store = createStore(servicesSlice);
    store.getActions().setList({
      qualifier: { environment: "env-id" },
      data: RemoteData.success(serviceModels),
    });

    expect(store.getState().listByEnv).toEqual({
      "env-id": RemoteData.success(serviceModels),
    });

    expect(store.getState().byNameAndEnv).toEqual({
      "env-id__?__test_service": RemoteData.success(serviceModels[0]),
      "env-id__?__another_test_service": RemoteData.success(serviceModels[1]),
    });
  });

  it("SetList removes services from the store", () => {
    const store = createStore(servicesSlice);
    store.getActions().setList({
      qualifier: { environment: "env-id" },
      data: RemoteData.success(serviceModels),
    });

    store.getActions().setList({
      qualifier: { environment: "env-id" },
      data: RemoteData.success([serviceModels[0]]),
    });

    expect(store.getState().listByEnv).toEqual({
      "env-id": RemoteData.success([serviceModels[0]]),
    });

    expect(store.getState().byNameAndEnv).toEqual({
      "env-id__?__test_service": RemoteData.success(serviceModels[0]),
    });
  });
});
