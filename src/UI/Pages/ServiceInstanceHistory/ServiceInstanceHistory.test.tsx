import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  QueryResolverImpl,
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
  getStoreInstance,
} from "@/Data";
import {
  dependencies,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  Service,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

it("ServiceInstanceHistory renders", async () => {
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetInstanceLogsQueryManager(
        new InstantApiHelper({
          kind: "Success",
          data: { data: [] },
        }),
        new GetInstanceLogsStateHelper(store),
        new StaticScheduler()
      ),
    ])
  );

  render(
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

  expect(
    await screen.findByRole("generic", { name: "ServiceInstanceHistory-Empty" })
  ).toBeVisible();
});
