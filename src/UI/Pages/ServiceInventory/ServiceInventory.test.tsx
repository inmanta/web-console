import React from "react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  StaticSubscriptionController,
  DeferredFetcher,
  Service,
  ServiceInstance,
  Resources,
} from "@/Test";
import { Either } from "@/Core";
import { ServicesContext } from "@/UI/ServicesContext";
import {
  DataProviderImpl,
  DataManagerImpl,
  ServiceInstancesHookHelper,
  ServiceInstancesStateHelper,
  ResourcesHookHelper,
  ResourcesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "./ServiceInventory";
import { MemoryRouter } from "react-router-dom";

function setup() {
  const store = getStoreInstance();

  const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
  const serviceInstancesSubscriptionController = new StaticSubscriptionController();
  const serviceInstancesHelper = new ServiceInstancesHookHelper(
    new DataManagerImpl<"ServiceInstances">(
      serviceInstancesFetcher,
      new ServiceInstancesStateHelper(store)
    ),
    serviceInstancesSubscriptionController
  );

  const resourcesFetcher = new DeferredFetcher<"Resources">();
  const resourcesSubscriptionController = new StaticSubscriptionController();
  const resourcesHelper = new ResourcesHookHelper(
    new DataManagerImpl<"Resources">(
      resourcesFetcher,
      new ResourcesStateHelper(store)
    ),
    resourcesSubscriptionController
  );

  const dataProvider = new DataProviderImpl([
    serviceInstancesHelper,
    resourcesHelper,
  ]);

  const component = (
    <MemoryRouter>
      <ServicesContext.Provider value={{ dataProvider }}>
        <StoreProvider store={store}>
          <ServiceInventory
            serviceName={Service.A.name}
            environmentId={Service.A.environment}
            service={Service.A}
          />
        </StoreProvider>
      </ServicesContext.Provider>
    </MemoryRouter>
  );

  return {
    component,
    serviceInstancesFetcher,
    resourcesFetcher,
    serviceInstancesSubscriptionController,
  };
}

test("ServiceInventory shows updated instances", async () => {
  const {
    component,
    serviceInstancesFetcher,
    serviceInstancesSubscriptionController,
  } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceInventory-Loading" })
  ).toBeInTheDocument();

  serviceInstancesFetcher.resolve(Either.right({ data: [], links: {} }));

  expect(
    await screen.findByRole("region", { name: "ServiceInventory-Empty" })
  ).toBeInTheDocument();

  serviceInstancesSubscriptionController.executeAll();

  serviceInstancesFetcher.resolve(
    Either.right({ data: [ServiceInstance.A], links: {} })
  );

  expect(
    await screen.findByRole("region", { name: "ServiceInventory-Success" })
  ).toBeInTheDocument();
});

test("ResourcesView fetches resources for new instance after instance update", async () => {
  const {
    component,
    serviceInstancesFetcher,
    resourcesFetcher,
    serviceInstancesSubscriptionController,
  } = setup();

  render(component);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({ data: [ServiceInstance.A], links: {} })
    );
  });

  expect(
    await screen.findByRole("region", { name: "ServiceInventory-Success" })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Details" }));
  fireEvent.click(await screen.findByRole("button", { name: "Resources" }));

  await act(async () => {
    await resourcesFetcher.resolve(Either.right({ data: Resources.A }));
  });

  expect(
    screen.getByRole("cell", { name: "resource_id_a_1" })
  ).toBeInTheDocument();

  serviceInstancesSubscriptionController.refresh(Service.A.name);

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({ data: [{ ...ServiceInstance.A, version: 4 }], links: {} })
    );
  });

  await act(async () => {
    await resourcesFetcher.resolve(Either.right({ data: Resources.B }));
  });

  expect(
    await screen.findByRole("cell", { name: "resource_id_b_1" })
  ).toBeInTheDocument();

  expect(resourcesFetcher.getInvocations().length).toEqual(2);
  expect(resourcesFetcher.getInvocations()[1][1]).toMatch(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a/resources?current_version=4"
  );
});
