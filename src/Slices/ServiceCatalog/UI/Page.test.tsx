import React, { act } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { Page } from "@patternfly/react-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { axe, toHaveNoViolations } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { RemoteData, ServiceModel } from "@/Core";
import { getStoreInstance } from "@/Data";
import { dependencies, Environment, Service } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider, EnvironmentHandlerImpl } from "@/UI/Dependency";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { ServiceCatalogPage } from ".";

const server = setupServer();

expect.extend(toHaveNoViolations);

const [env1] = Environment.filterable.map((env) => env.id);

function setup() {
  const client = new QueryClient();
  const store = getStoreInstance();

  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    dependencies.routeManager,
  );

  store.dispatch.environment.setEnvironments(
    RemoteData.success(Environment.filterable),
  );

  const component = (
    <QueryClientProvider client={client}>
      <ModalProvider>
        <MemoryRouter
          initialEntries={[
            { pathname: "/lsm/catalog", search: `?env=${env1}` },
          ]}
        >
          <DependencyProvider
            dependencies={{
              ...dependencies,
              environmentHandler,
            }}
          >
            <StoreProvider store={store}>
              <Page>
                <ServiceCatalogPage />
              </Page>
            </StoreProvider>
          </DependencyProvider>
        </MemoryRouter>
      </ModalProvider>
    </QueryClientProvider>
  );

  return {
    component,
  };
}
beforeAll(() => server.listen());

beforeEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

test("ServiceCatalog shows empty state", async () => {
  server.use(
    http.get("/lsm/v1/service_catalog", () => {
      return HttpResponse.json({ data: [] });
    }),
  );

  const { component } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Loading" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Empty" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("ServiceCatalog shows empty state", async () => {
  server.use(
    http.get("/lsm/v1/service_catalog", () => {
      return HttpResponse.json({ data: [Service.a] });
    }),
  );

  const { component } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "ServiceCatalog-Loading" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN ServiceCatalog WHEN service is deleted THEN UI is updated", async () => {
  const data = [Service.a];

  server.use(
    http.get("/lsm/v1/service_catalog", () => {
      return HttpResponse.json({ data });
    }),
    http.delete("/lsm/v1/service_catalog/service_name_a", () => {
      data.pop();

      return HttpResponse.json({ status: 204 });
    }),
  );

  const { component } = setup();

  render(component);

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Success" }),
  ).toBeInTheDocument();

  await userEvent.click(screen.getByLabelText("Actions-dropdown"));

  await userEvent.click(
    screen.getByLabelText(Service.a.name + "-deleteButton"),
  );

  await userEvent.click(screen.getByText(words("yes")));

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Empty" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN ServiceCatalog WHEN update fo catalog is triggered successfully THEN UI is updated", async () => {
  const data: ServiceModel[] = [];

  server.use(
    http.get("/lsm/v1/service_catalog", () => {
      return HttpResponse.json({ data });
    }),
    http.post("/lsm/v1/exporter/export_service_definition", () => {
      data.push(Service.a);

      return HttpResponse.json({ status: 200 });
    }),
  );

  const { component } = setup();

  render(component);

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Empty" }),
  ).toBeInTheDocument();

  await userEvent.click(screen.getByText("Update Service Catalog"));

  await userEvent.click(screen.getByText(words("yes")));

  expect(
    await screen.findByRole("generic", { name: "ServiceCatalog-Success" }),
  ).toBeInTheDocument();
});
