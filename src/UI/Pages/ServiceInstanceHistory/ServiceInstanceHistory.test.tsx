import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  QueryResolverImpl,
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
  getStoreInstance,
} from "@/Data";
import {
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
        new StaticScheduler(),
        Service.a.environment
      ),
    ])
  );

  render(
    <DependencyProvider dependencies={{ queryResolver }}>
      <StoreProvider store={store}>
        <ServiceInstanceHistory
          service={Service.a}
          instanceId={ServiceInstance.a.id}
        />
      </StoreProvider>
    </DependencyProvider>
  );

  expect(
    await screen.findByRole("generic", { name: "ServiceInstanceHistory-Empty" })
  ).toBeVisible();
});
