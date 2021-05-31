import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  CommandResolverImpl,
  QueryResolverImpl,
  InstanceConfigCommandManager,
  InstanceConfigQueryManager,
  InstanceConfigStateHelper,
  ServiceKeyMaker,
  ServiceStateHelper,
} from "@/UI/Data";
import { DependencyProvider } from "@/UI/Dependency";
import { getStoreInstance } from "@/UI/Store";
import { ConfigTab } from "./ConfigTab";
import {
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  InstantFetcher,
  InstantPoster,
  Service,
  ServiceInstance,
} from "@/Test";
import { StoreProvider } from "easy-peasy";
import { RemoteData } from "@/Core";

function setup() {
  const storeInstance = getStoreInstance();
  const serviceKeyMaker = new ServiceKeyMaker();

  const instanceConfigStateHelper = new InstanceConfigStateHelper(
    storeInstance
  );

  const instanceIdentifier = {
    id: ServiceInstance.a.id,
    service_entity: Service.a.name,
    environment: Service.a.environment,
    version: ServiceInstance.a.version,
  };

  const instanceConfigHelper = new InstanceConfigQueryManager(
    new InstantFetcher<"InstanceConfig">({
      kind: "Success",
      data: { data: { auto_creating: false } },
    }),
    instanceConfigStateHelper,
    new ServiceStateHelper(
      storeInstance,
      serviceKeyMaker,
      instanceIdentifier.environment
    ),
    new InstantFetcher<"Service">({
      kind: "Success",
      data: { data: Service.a },
    }),
    instanceIdentifier.environment
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([instanceConfigHelper])
  );

  return {
    storeInstance,
    queryResolver,
    instanceConfigStateHelper,
    instanceIdentifier,
  };
}

test("ConfigTab can reset all settings", async () => {
  const {
    storeInstance,
    queryResolver,
    instanceConfigStateHelper,
    instanceIdentifier,
  } = setup();

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new InstanceConfigCommandManager(
        new InstantPoster<"InstanceConfig">(RemoteData.success({ data: {} })),
        instanceConfigStateHelper
      ),
    ])
  );

  render(
    <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
      <StoreProvider store={storeInstance}>
        <ConfigTab serviceInstanceIdentifier={instanceIdentifier} />
      </StoreProvider>
    </DependencyProvider>
  );

  const resetButton = await screen.findByRole("button", { name: "Reset" });
  expect(resetButton).toBeVisible();

  expect(
    screen.getByRole("checkbox", { name: "auto_creating-False" })
  ).toBeVisible();

  fireEvent.click(resetButton);

  expect(
    await screen.findByRole("checkbox", { name: "auto_creating-True" })
  ).toBeVisible();
});

test("ConfigTab can change 1 toggle", async () => {
  const {
    storeInstance,
    queryResolver,
    instanceConfigStateHelper,
    instanceIdentifier,
  } = setup();

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new InstanceConfigCommandManager(
        new InstantPoster<"InstanceConfig">(
          RemoteData.success({
            data: { auto_creating: false, auto_designed: false },
          })
        ),
        instanceConfigStateHelper
      ),
    ])
  );

  render(
    <DependencyProvider dependencies={{ queryResolver, commandResolver }}>
      <StoreProvider store={storeInstance}>
        <ConfigTab serviceInstanceIdentifier={instanceIdentifier} />
      </StoreProvider>
    </DependencyProvider>
  );

  const toggle = await screen.findByRole("checkbox", {
    name: "auto_designed-True",
  });

  expect(toggle).toBeVisible();

  fireEvent.click(toggle);

  expect(
    await screen.findByRole("checkbox", { name: "auto_creating-False" })
  ).toBeVisible();
});
