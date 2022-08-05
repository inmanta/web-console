import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  getStoreInstance,
  QueryManagerResolver,
  QueryResolverImpl,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { UrlManagerImpl } from "@/UI/Utils";
import * as Mock from "@S/CompileDetails/Core/Mock";
import { CompileDetails } from "./CompileDetails";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const urlManager = new UrlManagerImpl(dependencies.featureManager, "");

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, urlManager }}
      >
        <StoreProvider store={store}>
          <CompileDetails id="123" />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("CompileDetailsView shows failed view", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "CompileDetailsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "CompileDetailsView-Failed" })
  ).toBeInTheDocument();
});

test("CompileDetailsView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "CompileDetailsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: Mock.data }));

  expect(
    await screen.findByRole("generic", { name: "CompileDetailsView-Success" })
  ).toBeInTheDocument();
});
