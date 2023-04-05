import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  KeycloakAuthHelper,
} from "@/Data";
import { UpdateInstanceAttributeCommandManager } from "@/Data/Managers/UpdateInstanceAttribute";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  DynamicQueryManagerResolver,
  Service,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import {
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
} from "@S/ServiceInstanceHistory/Data";
import * as InstanceLog from "@S/ServiceInstanceHistory/Data/Mock";
import { ServiceInstanceHistory } from "./ServiceInstanceHistory";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      GetInstanceLogsQueryManager(
        apiHelper,
        GetInstanceLogsStateHelper(store),
        new StaticScheduler()
      ),
    ])
  );
  const updateAttribute = UpdateInstanceAttributeCommandManager(
    new KeycloakAuthHelper(),
    apiHelper
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([updateAttribute])
  );
  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager
  );
  store.dispatch.environment.setEnvironments(
    RemoteData.success([
      {
        id: "aaa",
        name: "env-a",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
        settings: {
          enable_lsm_expert_mode: true,
        },
      },
    ])
  );
  const component = (
    <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentHandler,
        }}
      >
        <StoreProvider store={store}>
          <ServiceInstanceHistory
            service={Service.a}
            instanceId={ServiceInstance.a.id}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );
  return { component, apiHelper };
}

it("ServiceInstanceHistory renders", async () => {
  const { apiHelper, component } = setup();

  render(component);
  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "ServiceInstanceHistory-Empty" })
  ).toBeVisible();
});

it("ServiceInstanceHistory shows dates correctly", async () => {
  const { apiHelper, component } = setup();

  render(component);
  apiHelper.resolve(
    Either.right({
      data: InstanceLog.listA,
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", {
      name: "ServiceInstanceHistory-Success",
    })
  ).toBeVisible();

  expect(
    screen.queryByRole("cell", { name: "Invalid date" })
  ).not.toBeInTheDocument();
});
