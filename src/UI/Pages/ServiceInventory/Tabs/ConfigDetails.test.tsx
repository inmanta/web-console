import { Config, EnvironmentDetails, RemoteData } from "@/Core";
import {
  BaseApiHelper,
  CommandResolverImpl,
  getStoreInstance,
  InstanceConfigCommandManager,
  InstanceConfigPoster,
  InstanceConfigStateHelper,
} from "@/Data";
import { DynamicCommandManagerResolver, ServiceInstance } from "@/Test";
import { DependencyProvider, EnvironmentModifierImpl } from "@/UI/Dependency";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import React from "react";
import { ConfigDetails } from "./ConfigDetails";

function setup() {
  const store = getStoreInstance();
  const baseApiHelper = new BaseApiHelper();
  const commandManager = new InstanceConfigCommandManager(
    new InstanceConfigPoster(baseApiHelper, ServiceInstance.a.environment),
    new InstanceConfigStateHelper(store)
  );
  store.dispatch.environmentDetails.setData({
    id: ServiceInstance.a.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });
  const environmentModifier = new EnvironmentModifierImpl();
  environmentModifier.setEnvironment(ServiceInstance.a.environment);
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
  );
  return {
    component: (config: Config) => (
      <DependencyProvider
        dependencies={{
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
  act(() => {
    store.dispatch.environmentDetails.setData({
      id: ServiceInstance.a.environment,
      value: RemoteData.success({ halted: true } as EnvironmentDetails),
    });
  });
  rerender(component({ enabled: true }));
  expect(
    await screen.findByRole("checkbox", { name: "enabled-True" })
  ).toBeDisabled();
});
