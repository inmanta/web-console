import { ServiceCatalog } from "@/UI/Pages/ServiceCatalog";

import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicQueryManagerResolver,
  Service,
  StaticScheduler,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  ServicesQueryManager,
  ServicesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const servicesFetcher = new DeferredFetcher<"Services">();

  const servicesHelper = new ServicesQueryManager(
    servicesFetcher,
    new ServicesStateHelper(store, Service.a.environment),
    scheduler,
    Service.a.environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([servicesHelper])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ queryResolver }}>
        <StoreProvider store={store}>
          <ServiceCatalog environment={Service.a.environment} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    servicesFetcher,
    scheduler,
  };
}

test.skip("GIVEN ServiceCatalog WHEN click on config tab THEN shows config tab", async () => {
  const { component, servicesFetcher } = setup();
  render(component);

  servicesFetcher.resolve(Either.right({ data: [Service.a] }));

  const details = await screen.findByRole("button", {
    name: `${Service.a.name} Details`,
  });
  userEvent.click(details);

  const configButton = screen.getByRole("button", { name: "Config" });
  userEvent.click(configButton);
});
