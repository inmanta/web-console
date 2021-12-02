import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  AgentProcessStateHelper,
  GetAgentProcessQueryManager,
  getStoreInstance,
  QueryResolverImpl,
} from "@/Data";
import {
  AgentProcessData,
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolver,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { UrlManagerImpl } from "@/UI/Utils";
import { Page } from "./Page";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new GetAgentProcessQueryManager(
        apiHelper,
        new AgentProcessStateHelper(store)
      ),
    ])
  );
  const urlManager = new UrlManagerImpl(
    dependencies.featureManager,
    "",
    "environment"
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, urlManager }}
      >
        <StoreProvider store={store}>
          <Page />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Agent Process Page shows failed view", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "AgentProcessView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "AgentProcessView-Failed" })
  ).toBeInTheDocument();
});

test("Agent Process Page shows success view", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "AgentProcessView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: AgentProcessData.data }));

  expect(
    await screen.findByRole("generic", { name: "AgentProcessView-Success" })
  ).toBeInTheDocument();
});
