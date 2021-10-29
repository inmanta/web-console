import React from "react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  CompileDetailsQueryManager,
  CompileDetailsStateHelper,
  getStoreInstance,
  PrimaryFeatureManager,
  QueryResolverImpl,
} from "@/Data";
import {
  CompileDetailsData,
  DeferredApiHelper,
  DynamicQueryManagerResolver,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { UrlManagerImpl } from "@/UI/Utils";
import { render, screen } from "@testing-library/react";
import { CompileDetails } from "./CompileDetails";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new CompileDetailsQueryManager(
        apiHelper,
        new CompileDetailsStateHelper(store),
        scheduler,
        "environment"
      ),
    ])
  );
  const urlManager = new UrlManagerImpl(
    new PrimaryFeatureManager(),
    "",
    "environment"
  );

  const component = (
    <DependencyProvider dependencies={{ queryResolver, urlManager }}>
      <StoreProvider store={store}>
        <CompileDetails id="123" />
      </StoreProvider>
    </DependencyProvider>
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

  apiHelper.resolve(Either.right({ data: CompileDetailsData.data }));

  expect(
    await screen.findByRole("generic", { name: "CompileDetailsView-Success" })
  ).toBeInTheDocument();
});
