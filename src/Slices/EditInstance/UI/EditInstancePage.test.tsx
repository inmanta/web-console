import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { cloneDeep } from "lodash";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  ServiceInstanceStateHelper,
  ServiceInstanceQueryManager,
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
import { TriggerInstanceUpdateCommandManager } from "@S/EditInstance/Data";
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

test("Edit Instance View shows failed state", async () => {
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
  const { service_entity, id, version } = ServiceInstance.a;

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.a }));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Success" })
  ).toBeInTheDocument();

  const bandwidthField = screen.getByText("bandwidth");
  expect(bandwidthField).toBeVisible();

  await userEvent.type(bandwidthField, "2");
  await userEvent.click(screen.getByText("Confirm"));

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "PATCH",
    url: `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`,
    body: {
      attributes: {
        bandwidth: "2",
      },
    },
    environment: "env",
  });
});

test("Given the EditInstance View When changing an embedded entity Then the correct request is fired", async () => {
  const { component, apiHelper } = setup();
  render(component);
  const { service_entity, id, version } = ServiceInstance.a;

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.a }));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Success" })
  ).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "circuits" }));
  await userEvent.click(screen.getByRole("button", { name: "1" }));
  const serviceIdField = screen.getByRole("spinbutton", { name: "service_id" });
  await userEvent.type(serviceIdField, "{backspace}7");

  const bandwidthField = screen.getByText("bandwidth");
  expect(bandwidthField).toBeVisible();

  await userEvent.type(bandwidthField, "2");
  await userEvent.click(screen.getByText("Confirm"));

  expect(apiHelper.pendingRequests).toHaveLength(1);
  if (!ServiceInstance.a.active_attributes) {
    throw Error("Active attributes for this instance should be defined");
  }
  const expectedCircuits: Record<string, unknown>[] = cloneDeep(
    ServiceInstance.a.active_attributes["circuits"] as Record<string, unknown>[]
  );
  expectedCircuits[0]["service_id"] = 9489784967;
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "PATCH",
    url: `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`,
    body: {
      attributes: {
        bandwidth: "2",
        circuits: expectedCircuits,
      },
    },
    environment: "env",
  });
});
