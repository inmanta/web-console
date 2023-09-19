import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import {
  Either,
  EnvironmentDetails,
  EnvironmentModifier,
  RemoteData,
  VersionedServiceInstanceIdentifier,
} from "@/Core";
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
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  InstantApiHelper,
  MockEnvironmentHandler,
  MockEnvironmentModifier,
  Service,
  ServiceInstance,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvironmentModifierImpl } from "@/UI/Dependency/EnvironmentModifier";
import { ConfigTab } from "./ConfigTab";

function setup(
  environmentModifier: EnvironmentModifier = new MockEnvironmentModifier(),
) {
  const storeInstance = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const serviceKeyMaker = new ServiceKeyMaker();
  storeInstance.dispatch.services.setSingle({
    environment: Service.a.environment,
    query: { kind: "GetService", name: Service.a.name },
    data: RemoteData.success(Service.a),
  });

  const instanceConfigStateHelper = InstanceConfigStateHelper(storeInstance);

  const instanceIdentifier: VersionedServiceInstanceIdentifier = {
    id: ServiceInstance.a.id,
    service_entity: Service.a.name,
    version: ServiceInstance.a.version,
  };

  const instanceConfigHelper = InstanceConfigQueryManager(
    new InstantApiHelper(() => ({
      kind: "Success",
      data: { data: { auto_creating: false } },
    })),
    instanceConfigStateHelper,
    new InstanceConfigFinalizer(
      ServiceStateHelper(storeInstance, serviceKeyMaker),
    ),
  );

  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([instanceConfigHelper]),
  );

  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      InstanceConfigCommandManager(apiHelper, instanceConfigStateHelper),
    ]),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentModifier,
          environmentHandler: MockEnvironmentHandler(Service.a.environment),
        }}
      >
        <StoreProvider store={storeInstance}>
          <ConfigTab serviceInstanceIdentifier={instanceIdentifier} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
    storeInstance,
    instanceConfigStateHelper,
  };
}

test("ConfigTab can reset all settings", async () => {
  const { component, apiHelper } = setup();
  render(component);

  const resetButton = await screen.findByRole("button", {
    name: words("config.reset"),
  });
  expect(resetButton).toBeVisible();

  expect(
    screen.getByRole("checkbox", { name: "auto_creating-False" }),
  ).toBeVisible();

  await act(async () => {
    await userEvent.click(resetButton, { skipHover: true });
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: {} }));
  });

  expect(
    await screen.findByRole("checkbox", { name: "auto_creating-True" }),
  ).toBeVisible();
});

test("ConfigTab can change 1 toggle", async () => {
  const { component, apiHelper } = setup();
  render(component);

  const toggle = await screen.findByRole("checkbox", {
    name: "auto_designed-True",
  });

  expect(toggle).toBeVisible();

  await act(async () => {
    await userEvent.click(toggle, { skipHover: true });
  });

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ data: { auto_creating: false, auto_designed: false } }),
    );
  });

  expect(
    screen.getByRole("checkbox", { name: "auto_creating-False" }),
  ).toBeVisible();

  expect(
    await screen.findByRole("checkbox", { name: "auto_designed-False" }),
  ).toBeVisible();
});

test("ConfigTab handles hooks with environment modifier correctly", async () => {
  const environmentModifier = EnvironmentModifierImpl();
  environmentModifier.setEnvironment(Service.a.environment);
  const { component, storeInstance } = setup(environmentModifier);
  storeInstance.dispatch.environment.setEnvironmentDetailsById({
    id: Service.a.environment,
    value: RemoteData.success({ halted: true } as EnvironmentDetails),
  });
  render(component);

  const toggle = await screen.findByRole("checkbox", {
    name: "auto_designed-True",
  });

  expect(toggle).toBeVisible();
  expect(toggle).toBeDisabled();
});
