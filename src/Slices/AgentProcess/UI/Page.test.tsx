import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import {
  getStoreInstance,
  QueryResolverImpl,
  QueryManagerResolverImpl,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import * as AgentProcessMock from "@S/AgentProcess/Core/Mock";
import { Page } from "./Page";
expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
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
    await screen.findByRole("region", { name: "AgentProcessView-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("region", { name: "AgentProcessView-Failed" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Agent Process Page shows success view", async () => {
  const { component, apiHelper } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "AgentProcessView-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: AgentProcessMock.data }));

  expect(await screen.findByRole("heading")).toHaveTextContent(
    "Agent Process hostname1",
  );

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
