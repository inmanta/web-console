import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { Either } from "@/Core";
import {
  getStoreInstance,
  QueryManagerResolver,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { InstanceCellValue } from "./InstanceCellValue";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
        }}
      >
        <StoreProvider store={store}>
          <InstanceCellValue id="id123" serviceName="test_service" />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Given the InstanceCellValue When an instance has an identity Then it is shown instead of the id", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    apiHelper.resolve(Either.right({ data: ServiceInstance.a }));
  });
  expect(
    await screen.findByText(
      ServiceInstance.a.service_identity_attribute_value as string
    )
  ).toBeVisible();
});

test("Given the InstanceCellValue When an instance doesn't have an identity Then the id is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: {
          ...ServiceInstance.a,
          service_identity_attribute_value: undefined,
        },
      })
    );
  });
  expect(await screen.findByText("id123")).toBeVisible();
});

test("Given the InstanceCellValue When the instance request fails Then the id is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    apiHelper.resolve(
      Either.left({
        message: "Something happened",
      })
    );
  });
  expect(await screen.findByText("id123")).toBeVisible();
});
