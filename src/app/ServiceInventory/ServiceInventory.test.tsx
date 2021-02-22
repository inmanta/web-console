import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  StaticSubscriptionController,
  DeferredFetcher,
  Service,
  instance,
} from "@/Test";
import { Either } from "@/Core";
import { ServicesContext } from "@/UI/ServicesContext";
import {
  DataProviderImpl,
  ServiceInstancesHookHelper,
  ServiceInstancesDataManager,
  ServiceInstancesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "./ServiceInventory";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredFetcher<"ServiceInstances">();
  const subscriptionController = new StaticSubscriptionController();
  const dataProvider = new DataProviderImpl([
    new ServiceInstancesHookHelper(
      new ServiceInstancesDataManager(
        apiHelper,
        new ServiceInstancesStateHelper(store)
      ),
      subscriptionController
    ),
  ]);

  const component = (
    <ServicesContext.Provider value={{ dataProvider }}>
      <StoreProvider store={store}>
        <ServiceInventory
          serviceName={Service.single.name}
          environmentId={Service.single.environment}
          service={Service.single}
        />
      </StoreProvider>
    </ServicesContext.Provider>
  );

  return { component, apiHelper, subscriptionController };
}

test("ServiceInventory shows updated instances", async () => {
  const { component, apiHelper, subscriptionController } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceInventory-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right([]));

  expect(
    await screen.findByRole("region", { name: "ServiceInventory-Empty" })
  ).toBeInTheDocument();

  subscriptionController.executeAll();

  apiHelper.resolve(Either.right([instance]));

  expect(
    await screen.findByRole("region", { name: "ServiceInventory-Success" })
  ).toBeInTheDocument();
});
