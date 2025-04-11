import React from "react";
import { MemoryRouter } from "react-router-dom";
import { StoreProvider } from "easy-peasy";
import { RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
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
import { QueryClientProvider } from "@tanstack/react-query";
import { testClient } from "./react-query-setup";

export function baseSetup(
  Page: React.ReactNode,
  halted: boolean = false,
  initialEntries: string[] = []
) {
  const apiHelper = new DeferredApiHelper();

  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler)
  );
  const commandResolver = new CommandResolverImpl(new CommandManagerResolverImpl(store, apiHelper));

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
    <QueryClientProvider client={testClient}>
      <MemoryRouter initialEntries={initialEntries}>
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
    </QueryClientProvider>
  );

  return { component, apiHelper, scheduler };
}
