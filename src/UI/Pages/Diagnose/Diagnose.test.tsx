import React from "react";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicQueryManagerResolver,
  Service,
  StaticScheduler,
  Diagnose,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  DiagnosticsQueryManager,
  DiagnosticsStateHelper,
  getStoreInstance,
} from "@/Data";
import { Diagnose as DiagnoseComponent } from "./Diagnose";
import { UrlManagerImpl } from "@/UI/Utils";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredFetcher<"GetDiagnostics">();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new DiagnosticsQueryManager(
        apiHelper,
        new DiagnosticsStateHelper(store),
        scheduler,
        "environment"
      ),
    ])
  );
  const urlManager = new UrlManagerImpl("", "environment");

  const component = (
    <DependencyProvider dependencies={{ queryResolver, urlManager }}>
      <StoreProvider store={store}>
        <DiagnoseComponent
          service={Service.a}
          instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
        />
      </StoreProvider>
    </DependencyProvider>
  );

  return { component, apiHelper, scheduler };
}

test("Diagnose View shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: { failures: [], rejections: [] } }));

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Empty" })
  ).toBeInTheDocument();
});

test("Diagnose View shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Failed" })
  ).toBeInTheDocument();
});

test("Diagnose View shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: Diagnose.failure }));

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Success" })
  ).toBeInTheDocument();
});

test("Diagnose View shows updated table", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: { rejections: [], failures: [] } }));

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Empty" })
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(Either.right({ data: Diagnose.failure }));

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Success" })
  ).toBeInTheDocument();
});
