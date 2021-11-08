import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
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
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  getStoreInstance,
  ServiceInstanceStateHelper,
  ServiceInstanceQueryManager,
  TriggerInstanceUpdateCommandManager,
  AttributeResultConverterImpl,
  BaseApiHelper,
  CommandResolverImpl,
} from "@/Data";

import { EditInstancePage } from "./EditInstancePage";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ServiceInstanceQueryManager(
        apiHelper,
        new ServiceInstanceStateHelper(store),
        scheduler,
        "environment"
      ),
    ])
  );

  const commandManager = new TriggerInstanceUpdateCommandManager(
    new BaseApiHelper(),
    new AttributeResultConverterImpl(),
    Service.a.environment
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
  );

  const component = (
    <DependencyProvider
      dependencies={{
        ...dependencies,
        queryResolver,
        commandResolver,
        environmentModifier: new MockEnvironmentModifier(),
      }}
    >
      <MemoryRouter>
        <StoreProvider store={store}>
          <EditInstancePage
            serviceEntity={Service.a}
            instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
          />
        </StoreProvider>
      </MemoryRouter>
    </DependencyProvider>
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

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.nestedEditable }));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Success" })
  ).toBeInTheDocument();
  const bandwidthField = await screen.findByText("bandwidth");
  expect(bandwidthField).toBeVisible();
  userEvent.type(bandwidthField, "2");
  userEvent.click(await screen.findByText("Confirm"));
  expect(fetchMock.mock.calls).toHaveLength(1);
  const [, requestInit] = fetchMock.mock.calls[0];
  expect(requestInit?.body).toBeTruthy();
  expect(
    JSON.parse(requestInit?.body as string)["attributes"]["bandwidth"]
  ).toEqual("2");
});
