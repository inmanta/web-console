import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { StaticSubscriptionController, DeferredFetcher, Service } from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  DataManagerImpl,
  ServicesHookHelper,
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
    new DataManagerImpl<"Services">(
      servicesFetcher,
      new ServicesStateHelper(store, new ServiceKeyMaker())
    ),
    servicesSubscriptionController
  );

  const dataProvider = new DataProviderImpl([servicesHelper]);

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ dataProvider }}>
        <StoreProvider store={store}>
          <ServiceCatalog environment={Service.A.environment} />
        </StoreProvider>
      </DependencyProvider>
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

  servicesFetcher.resolve(Either.right({ data: [] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();

  servicesSubscriptionController.executeAll();

  servicesFetcher.resolve(Either.right({ data: [Service.A] }));

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

  servicesFetcher.resolve(Either.right({ data: [Service.A] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Success" })
  ).toBeInTheDocument();

  servicesSubscriptionController.executeAll();

  servicesFetcher.resolve(Either.right({ data: [] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();
});

test("ServiceCatalog removes service after deletion", async () => {
  const { component, servicesFetcher } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Loading" })
  ).toBeInTheDocument();

  servicesFetcher.resolve(Either.right({ data: [Service.A] }));

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Success" })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Delete" }));

  fetchMock.mockResponse(JSON.stringify({}));
  fireEvent.click(screen.getByRole("button", { name: "Yes" }));

  /**
   * I believe we need to use this hack because fetch is still being used.
   * Ideally we don't mock fetch, but we use a test class on which we can
   * await requests. I'm not sure if jest-fetch-mock offers a way to wait
   * for the mocks to finish. But if we had a way to wait for the requests
   * to finish, we wouldn't need this hack.
   */
  setTimeout(() => {
    servicesFetcher.resolve(Either.right({ data: [] }));
  }, 0);

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Empty" })
  ).toBeInTheDocument();
});
