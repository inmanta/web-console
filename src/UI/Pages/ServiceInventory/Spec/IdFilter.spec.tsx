import React from "react";
import { render, screen, act, within } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  StaticSubscriptionController,
  DeferredFetcher,
  Service,
  ServiceInstance,
  Pagination,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DataProviderImpl,
  DataManagerImpl,
  ServiceInstancesHookHelper,
  ServiceInstancesStateHelper,
} from "@/UI/Data";
import { getStoreInstance } from "@/UI/Store";
import { ServiceInventory } from "../ServiceInventory";
import { MemoryRouter } from "react-router-dom";
import userEvent, { specialChars } from "@testing-library/user-event";

test("GIVEN The Service Inventory WHEN the user filters on id ('a') THEN only 1 instance is shown", async () => {
  const store = getStoreInstance();
  const serviceInstancesFetcher = new DeferredFetcher<"ServiceInstances">();
  const serviceInstancesSubscriptionController = new StaticSubscriptionController();
  const serviceInstancesHelper = new ServiceInstancesHookHelper(
    new DataManagerImpl<"ServiceInstances">(
      serviceInstancesFetcher,
      new ServiceInstancesStateHelper(store)
    ),
    serviceInstancesSubscriptionController
  );

  const dataProvider = new DataProviderImpl([serviceInstancesHelper]);

  // Render the component
  render(
    <MemoryRouter>
      <DependencyProvider dependencies={{ dataProvider }}>
        <StoreProvider store={store}>
          <ServiceInventory
            serviceName={Service.A.name}
            environmentId={Service.A.environment}
            service={Service.A}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.A, ServiceInstance.B],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const filterBar = screen.getByRole("generic", { name: "FilterBar" });

  const picker = within(filterBar).getByRole("button", { name: "State" });
  userEvent.click(picker);

  const id = screen.getByRole("option", { name: "Id" });
  userEvent.click(id);

  const input = screen.getByRole("textbox", { name: "IdFilterInput" });
  userEvent.type(input, `${ServiceInstance.A.id}${specialChars.enter}`);

  expect(serviceInstancesFetcher.getInvocations()[1][1]).toEqual(
    `/lsm/v1/service_inventory/${Service.A.name}?include_deployment_progress=True&limit=20&filter.id=${ServiceInstance.A.id}&sort=created_at.desc`
  );

  await act(async () => {
    await serviceInstancesFetcher.resolve(
      Either.right({
        data: [ServiceInstance.A],
        links: Pagination.links,
        metadata: Pagination.metadata,
      })
    );
  });

  const rowsAfter = await screen.findAllByRole("row", {
    name: "InstanceRow-Intro",
  });
  expect(rowsAfter.length).toEqual(1);
});
