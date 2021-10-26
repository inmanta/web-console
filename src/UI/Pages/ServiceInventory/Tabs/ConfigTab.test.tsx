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
  InstanceConfigFinalizer,
  getStoreInstance,
} from "@/Data";
import { DependencyProvider } from "@/UI/Dependency";
import { ConfigTab } from "./ConfigTab";
import {
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  InstantFetcher,
  InstantPoster,
  MockEnvironmentModifier,
  Service,
  ServiceInstance,
} from "@/Test";
import { StoreProvider } from "easy-peasy";
import {
  EnvironmentDetails,
  RemoteData,
  VersionedServiceInstanceIdentifier,
} from "@/Core";
import { EnvironmentModifierImpl } from "@/UI/Dependency/EnvironmentModifier";

function setup() {
  const storeInstance = getStoreInstance();
  const serviceKeyMaker = new ServiceKeyMaker();
  storeInstance.dispatch.services.setSingle({
    environment: Service.a.environment,
    query: { kind: "GetService", name: Service.a.name },
    data: RemoteData.success(Service.a),
  });

  const instanceConfigStateHelper = new InstanceConfigStateHelper(
    storeInstance
  );

  const instanceIdentifier: VersionedServiceInstanceIdentifier = {
    id: ServiceInstance.a.id,
    service_entity: Service.a.name,
    version: ServiceInstance.a.version,
  };

  const instanceConfigHelper = new InstanceConfigQueryManager(
    new InstantFetcher<"GetInstanceConfig">({
      kind: "Success",
      data: { data: { auto_creating: false } },
    }),
    instanceConfigStateHelper,
    new InstanceConfigFinalizer(
      new ServiceStateHelper(
        storeInstance,
        serviceKeyMaker,
        Service.a.environment
      )
    ),
    Service.a.environment
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
        new InstantPoster<"UpdateInstanceConfig">(
          RemoteData.success({ data: {} })
        ),
        instanceConfigStateHelper
      ),
    ])
  );

  render(
    <DependencyProvider
      dependencies={{
        queryResolver,
        commandResolver,
        environmentModifier: new MockEnvironmentModifier(),
      }}
    >
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
        new InstantPoster<"UpdateInstanceConfig">(
          RemoteData.success({
            data: { auto_creating: false, auto_designed: false },
          })
        ),
        instanceConfigStateHelper
      ),
    ])
  );

  render(
    <DependencyProvider
      dependencies={{
        queryResolver,
        commandResolver,
        environmentModifier: new MockEnvironmentModifier(),
      }}
    >
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
    screen.getByRole("checkbox", { name: "auto_creating-False" })
  ).toBeVisible();

  expect(
    await screen.findByRole("checkbox", { name: "auto_designed-False" })
  ).toBeVisible();
});

test("ConfigTab handles hooks with environment modifier correctly", async () => {
  const {
    storeInstance,
    queryResolver,
    instanceConfigStateHelper,
    instanceIdentifier,
  } = setup();

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new InstanceConfigCommandManager(
        new InstantPoster<"UpdateInstanceConfig">(
          RemoteData.success({
            data: { auto_creating: false, auto_designed: false },
          })
        ),
        instanceConfigStateHelper
      ),
    ])
  );
  storeInstance.dispatch.environmentDetails.setData({
    id: Service.a.environment,
    value: RemoteData.success({ halted: true } as EnvironmentDetails),
  });
  const environmentModifier = new EnvironmentModifierImpl();
  environmentModifier.setEnvironment(Service.a.environment);

  render(
    <DependencyProvider
      dependencies={{
        queryResolver,
        commandResolver,
        environmentModifier,
      }}
    >
      <StoreProvider store={storeInstance}>
        <ConfigTab serviceInstanceIdentifier={instanceIdentifier} />
      </StoreProvider>
    </DependencyProvider>
  );

  const toggle = await screen.findByRole("checkbox", {
    name: "auto_designed-True",
  });

  expect(toggle).toBeVisible();
  expect(toggle).toBeDisabled();
});
