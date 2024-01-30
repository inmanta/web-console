import React from "react";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  KeycloakAuthHelper,
  QueryManagerResolverImpl,
  CommandManagerResolverImpl,
} from "@/Data";
import {
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
  EnvironmentDetails,
  EnvironmentSettings,
} from "@/Test";
import { UrlManagerImpl } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";

export function baseSetup(Page: React.ReactNode, halted: boolean = false) {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper, authHelper),
  );

  const routeManager = PrimaryRouteManager("");
  const urlManager = new UrlManagerImpl(dependencies.featureManager, "");

  store.dispatch.environment.setEnvironmentDetailsById({
    id: "env",
    value: RemoteData.success(EnvironmentDetails[halted ? "halted" : "a"]),
  });
  store.dispatch.environment.setSettingsData({
    environment: "env",
    value: RemoteData.success({
      settings: {},
      definition: EnvironmentSettings.definition,
    }),
  });
  dependencies.environmentModifier.setEnvironment("env");

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          routeManager,
          urlManager,
        }}
      >
        <StoreProvider store={store}>{Page}</StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}
