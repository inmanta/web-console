import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicQueryManagerResolver,
  StaticScheduler,
  CompileReportsData,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  getStoreInstance,
  CompileReportsQueryManager,
  CompileReportsStateHelper,
} from "@/Data";
import { UrlManagerImpl } from "@/UI/Utils";
import { CompileReports } from "./CompileReports";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredFetcher<"CompileReports">();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new CompileReportsQueryManager(
        apiHelper,
        new CompileReportsStateHelper(store, "environment"),
        scheduler,
        "environment"
      ),
    ])
  );
  const urlManager = new UrlManagerImpl("", "environment");

  const component = (
    <DependencyProvider dependencies={{ queryResolver, urlManager }}>
      <StoreProvider store={store}>
        <CompileReports />
      </StoreProvider>
    </DependencyProvider>
  );

  return { component, apiHelper, scheduler };
}

test("CompileReportsView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Empty" })
  ).toBeInTheDocument();
});

test("CompileReportsView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Failed" })
  ).toBeInTheDocument();
});

test("CompileReportsView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right(CompileReportsData.response));

  expect(
    await screen.findByRole("grid", { name: "CompileReportsView-Success" })
  ).toBeInTheDocument();
});

test("CompileReportsView shows updated table", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      links: { self: "" },
      metadata: { total: 0, before: 0, after: 0, page_size: 1000 },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "CompileReportsView-Empty" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(Either.right(CompileReportsData.response));

  expect(
    await screen.findByRole("grid", { name: "CompileReportsView-Success" })
  ).toBeInTheDocument();
});
