import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { getStoreInstance } from "@/Data";
import {
  dependencies,
  MockEnvironmentHandler,
  Service,
  ServiceInstance,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { InstanceCellButton } from "./InstanceCellButton";

function setup(serviceName: string, id: string) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = getStoreInstance();

  const handleClick = jest.fn();
  const component = (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
        <DependencyProvider
          dependencies={{
            ...dependencies,
            environmentHandler: MockEnvironmentHandler(Service.a.environment),
          }}
        >
          <StoreProvider store={store}>
            <InstanceCellButton
              id={id}
              serviceName={serviceName}
              onClick={handleClick}
            />
          </StoreProvider>
        </DependencyProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

const server = setupServer(
  http.get(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_a",
    () => {
      return HttpResponse.json({ data: ServiceInstance.a });
    },
  ),
  http.get(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_b",
    () => {
      return HttpResponse.json({
        data: {
          ...ServiceInstance.b,
          service_identity_attribute_value: undefined,
        },
      });
    },
  ),
  http.get(
    "/lsm/v1/service_inventory/service_name_a/service_instance_id_c",
    () => {
      return HttpResponse.json(
        {
          message: "something happened",
        },
        {
          status: 500,
        },
      );
    },
  ),
);

beforeAll(() => {
  server.listen();
});

afterAll(() => {
  server.close();
});

test("Given the InstanceCellButton When an instance has an identity Then it is shown instead of the id", async () => {
  const { component } = setup("service_name_a", "service_instance_id_a");

  render(component);

  expect(
    await screen.findByText(
      ServiceInstance.a.service_identity_attribute_value as string,
    ),
  ).toBeVisible();
});

test("Given the InstanceCellButton When an instance doesn't have an identity Then the id is shown", async () => {
  const { component } = setup("service_name_a", "service_instance_id_b");

  render(component);

  expect(await screen.findByText("service_instance_id_b")).toBeVisible();
});

test("Given the InstanceCellButton When the instance request fails Then the id is shown", async () => {
  const { component } = setup("service_name_a", "service_instance_id_c");

  render(component);

  expect(await screen.findByText("service_instance_id_c")).toBeVisible();
});
