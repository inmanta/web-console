import React from "react";
import { render, screen } from "@testing-library/react";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";
import {
  InstantFetcher,
  Service,
  ServiceInstance,
  StaticSubscriptionController,
} from "@/Test";
import {
  DataManagerImpl,
  DataProviderImpl,
  InstanceLogsHookHelper,
  InstanceLogsStateHelper,
} from "@/UI/Data";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import { StoreProvider } from "easy-peasy";

it("ServiceInstanceHistory renders", async () => {
  const { id, environment } = ServiceInstance.A;
  const store = getStoreInstance();
  const dataProvider = new DataProviderImpl([
    new InstanceLogsHookHelper(
      new DataManagerImpl<"InstanceLogs">(
        new InstantFetcher<"InstanceLogs">({
          kind: "Success",
          data: { data: [] },
        }),
        new InstanceLogsStateHelper(store)
      ),
      new StaticSubscriptionController()
    ),
  ]);

  render(
    <DependencyProvider dependencies={{ dataProvider }}>
      <StoreProvider store={store}>
        <ServiceInstanceHistory
          service={Service.A}
          instanceId={id}
          environment={environment}
        />
      </StoreProvider>
    </DependencyProvider>
  );

  expect(
    await screen.findByRole("generic", { name: "ServiceInstanceHistory-Empty" })
  ).toBeVisible();
});
