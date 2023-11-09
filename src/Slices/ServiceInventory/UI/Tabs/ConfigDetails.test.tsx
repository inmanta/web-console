import React from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Config, EnvironmentDetails, RemoteData } from "@/Core";
import {
  BaseApiHelper,
  CommandResolverImpl,
  getStoreInstance,
  InstanceConfigCommandManager,
  InstanceConfigStateHelper,
} from "@/Data";
import {
  dependencies,
  DynamicCommandManagerResolverImpl,
  ServiceInstance,
} from "@/Test";
import { DependencyProvider, EnvironmentModifierImpl } from "@/UI/Dependency";
import { ConfigDetails } from "./ConfigDetails";

function setup() {
  const store = getStoreInstance();
  const baseApiHelper = new BaseApiHelper();
  const commandManager = InstanceConfigCommandManager(
    baseApiHelper,
    InstanceConfigStateHelper(store),
  );
  store.dispatch.environment.setEnvironmentDetailsById({
    id: ServiceInstance.a.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });
  const environmentModifier = EnvironmentModifierImpl();
  environmentModifier.setEnvironment(ServiceInstance.a.environment);
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolverImpl([commandManager]),
  );
  return {
    component: (config: Config) => (
      <DependencyProvider
        dependencies={{
          ...dependencies,
          commandResolver,
          environmentModifier,
        }}
      >
        <StoreProvider store={store}>
          <ConfigDetails
            serviceInstanceIdentifier={{
              id: ServiceInstance.a.id,
              service_entity: ServiceInstance.a.service_entity,
              version: ServiceInstance.a.version,
            }}
            config={config}
            defaults={config}
          />
        </StoreProvider>
      </DependencyProvider>
    ),
    store,
  };
}

it("Config Details takes environment halted status in account", async () => {
  const { component, store } = setup();
  const { rerender } = render(component({}));
  await act(async () => {
    store.dispatch.environment.setEnvironmentDetailsById({
      id: ServiceInstance.a.environment,
      value: RemoteData.success({ halted: true } as EnvironmentDetails),
    });
  });
  rerender(component({ enabled: true }));
  expect(
    await screen.findByRole("checkbox", { name: "enabled-True" }),
  ).toBeDisabled();
});
