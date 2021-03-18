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
import { ServicesContext } from "@/UI/ServicesContext";
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
    <ServicesContext.Provider value={{ dataProvider }}>
      <StoreProvider store={store}>
        <ServiceInstanceHistory
          service={Service.A}
          instanceId={id}
          environment={environment}
        />
      </StoreProvider>
    </ServicesContext.Provider>
  );

  expect(
    await screen.findByRole("generic", { name: "ServiceInstanceHistory-Empty" })
  ).toBeVisible();
});
