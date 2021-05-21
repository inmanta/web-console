import React from "react";
import { render, screen } from "@testing-library/react";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import {
  DynamicDataManagerResolver,
  InstantFetcher,
  Service,
  ServiceInstance,
} from "@/Test";
import {
  DataProviderImpl,
  InstanceLogsDataManager,
  InstanceLogsStateHelper,
} from "@/UI/Data";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import { StoreProvider } from "easy-peasy";

it("ServiceInstanceHistory renders", async () => {
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl(
    new DynamicDataManagerResolver([
      new InstanceLogsDataManager(
        new InstantFetcher<"InstanceLogs">({
          kind: "Success",
          data: { data: [] },
        }),
        new InstanceLogsStateHelper(store),
        Service.A.environment
      ),
    ])
  );

  render(
    <DependencyProvider dependencies={{ dataProvider }}>
      <StoreProvider store={store}>
        <ServiceInstanceHistory
          service={Service.A}
          instanceId={ServiceInstance.A.id}
        />
      </StoreProvider>
    </DependencyProvider>
  );

  expect(
    await screen.findByRole("generic", { name: "ServiceInstanceHistory-Empty" })
  ).toBeVisible();
});
