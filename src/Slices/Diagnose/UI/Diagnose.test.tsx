import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import { QueryResolverImpl, getStoreInstance } from "@/Data";
import {
  DynamicQueryManagerResolverImpl,
  Service,
  StaticScheduler,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import {
  DiagnosticsQueryManager,
  DiagnosticsStateHelper,
} from "@S/Diagnose/Data";
import * as Diagnose from "@S/Diagnose/Data/Mock";
import { Diagnose as DiagnoseComponent } from "./Diagnose";

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
    new DynamicQueryManagerResolverImpl([
      DiagnosticsQueryManager(
        apiHelper,
        DiagnosticsStateHelper(store),
        scheduler,
      ),
    ]),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
          <DiagnoseComponent
            serviceName={Service.a.name}
            instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
            instanceIdentity={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Diagnose View shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "Diagnostics-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: { failures: [], rejections: [] } }));

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Empty" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("Diagnose View shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "Diagnostics-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("region", { name: "Diagnostics-Failed" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("Diagnose View shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "Diagnostics-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: Diagnose.failure }));

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});

test("Diagnose View shows updated table", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("region", { name: "Diagnostics-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: { rejections: [], failures: [] } }));

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Empty" }),
  ).toBeInTheDocument();

  scheduler.executeAll();

  apiHelper.resolve(Either.right({ data: Diagnose.failure }));

  expect(
    await screen.findByRole("generic", { name: "Diagnostics-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });
});
