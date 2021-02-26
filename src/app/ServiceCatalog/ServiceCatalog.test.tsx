import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { StaticSubscriptionController, DeferredFetcher, Service } from "@/Test";
import { Either } from "@/Core";
import { ServicesContext } from "@/UI/ServicesContext";
import {
  DataProviderImpl,
  ServicesHookHelper,
  ServicesDataManager,
  ServicesStateHelper,
  ServiceKeyMaker,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceCatalog } from "./ServiceCatalog";
import { MemoryRouter } from "react-router-dom";

function setup() {
  const store = getStoreInstance();

  const servicesFetcher = new DeferredFetcher<"Services">();
  const servicesSubscriptionController = new StaticSubscriptionController();
  const servicesHelper = new ServicesHookHelper(
    new ServicesDataManager(
      servicesFetcher,
      new ServicesStateHelper(store, new ServiceKeyMaker())
    ),
    servicesSubscriptionController
  );

  const dataProvider = new DataProviderImpl([servicesHelper]);

  const component = (
    <MemoryRouter>
      <ServicesContext.Provider value={{ dataProvider }}>
        <StoreProvider store={store}>
          <ServiceCatalog environmentId={Service.A.environment} />
        </StoreProvider>
      </ServicesContext.Provider>
    </MemoryRouter>
  );

  return {
    component,
    servicesFetcher,
    servicesSubscriptionController,
  };
}

test("ServiceCatalog shows updated services", async () => {
  const {
    component,
    servicesFetcher,
    servicesSubscriptionController,
  } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Loading" })
  ).toBeInTheDocument();

  servicesFetcher.resolve(Either.right([]));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();

  servicesSubscriptionController.executeAll();

  servicesFetcher.resolve(Either.right([Service.A]));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Success" })
  ).toBeInTheDocument();
});

test("ServiceCatalog shows updated empty", async () => {
  const {
    component,
    servicesFetcher,
    servicesSubscriptionController,
  } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Loading" })
  ).toBeInTheDocument();

  servicesFetcher.resolve(Either.right([Service.A]));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Success" })
  ).toBeInTheDocument();

  servicesSubscriptionController.executeAll();

  servicesFetcher.resolve(Either.right([]));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();
});
