import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
  getStoreInstance,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  InstanceLog,
  Service,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetInstanceLogsQueryManager(
        apiHelper,
        new GetInstanceLogsStateHelper(store),
        new StaticScheduler()
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <ServiceInstanceHistory
            service={Service.a}
            instanceId={ServiceInstance.a.id}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
  return { component, apiHelper };
}

it("ServiceInstanceHistory renders", async () => {
  const { apiHelper, component } = setup();

  render(component);
  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "ServiceInstanceHistory-Empty" })
  ).toBeVisible();
});

it("ServiceInstanceHistory shows dates correctly", async () => {
  const { apiHelper, component } = setup();

  render(component);
  apiHelper.resolve(
    Either.right({
      data: InstanceLog.listA,
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", {
      name: "ServiceInstanceHistory-Success",
    })
  ).toBeVisible();

  expect(
    screen.queryByRole("cell", { name: "Invalid date" })
  ).not.toBeInTheDocument();
});
