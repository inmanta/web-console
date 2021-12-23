import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  ServiceInstanceStateHelper,
  ServiceInstanceQueryManager,
  TriggerInstanceUpdateCommandManager,
  CommandResolverImpl,
} from "@/Data";
import {
  DynamicQueryManagerResolver,
  Service,
  StaticScheduler,
  ServiceInstance,
  MockEnvironmentModifier,
  DynamicCommandManagerResolver,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EditInstancePage } from "./EditInstancePage";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ServiceInstanceQueryManager(
        apiHelper,
        new ServiceInstanceStateHelper(store),
        scheduler
      ),
    ])
  );

  const commandManager = new TriggerInstanceUpdateCommandManager(apiHelper);
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentModifier: new MockEnvironmentModifier(),
        }}
      >
        <StoreProvider store={store}>
          <EditInstancePage
            serviceEntity={Service.a}
            instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Edit Instance View shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Failed" })
  ).toBeInTheDocument();
});

test("EditInstance View shows success form", async () => {
  const { component, apiHelper } = setup();
  render(component);
  const { service_entity, id, version } = ServiceInstance.nestedEditable;

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.nestedEditable }));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Success" })
  ).toBeInTheDocument();

  const bandwidthField = screen.getByText("bandwidth");
  expect(bandwidthField).toBeVisible();

  userEvent.type(bandwidthField, "2");
  userEvent.click(screen.getByText("Confirm"));

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "PATCH",
    url: `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`,
    body: {
      attributes: {
        bandwidth: "2",
        circuits: [{}],
      },
    },
    environment: "env",
  });
});
