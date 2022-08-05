import React from "react";
import { act, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Config, EnvironmentDetails, RemoteData } from "@/Core";
import {
  BaseApiHelper,
  CommandResolverImpl,
  getStoreInstance,
  ServiceConfigCommandManager,
  ServiceConfigStateHelper,
} from "@/Data";
import {
  dependencies,
  DynamicCommandManagerResolver,
  Service,
  ServiceInstance,
} from "@/Test";
import { DependencyProvider, EnvironmentModifierImpl } from "@/UI/Dependency";
import { ConfigList } from "./ConfigList";

function setup() {
  const store = getStoreInstance();
  const baseApiHelper = new BaseApiHelper();
  const commandManager = new ServiceConfigCommandManager(
    baseApiHelper,
    new ServiceConfigStateHelper(store)
  );
  store.dispatch.environment.setEnvironmentDetailsById({
    id: Service.a.environment,
    value: RemoteData.success({ halted: false } as EnvironmentDetails),
  });
  const environmentModifier = new EnvironmentModifierImpl();
  environmentModifier.setEnvironment(Service.a.environment);
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([commandManager])
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
          <ConfigList serviceName={Service.a.name} config={config} />
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
    store.dispatch.environment.setEnvironmentDetailsById({
      id: ServiceInstance.a.environment,
      value: RemoteData.success({ halted: true } as EnvironmentDetails),
    });
  });
  rerender(component({ enabled: true }));
  expect(
    await screen.findByRole("checkbox", { name: "enabled-True" })
  ).toBeDisabled();
});
