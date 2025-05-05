import React, { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { ServiceModel } from "@/Core";
import { MockedDependencyProvider, Environment, Service } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ServiceCatalogPage } from ".";

expect.extend(toHaveNoViolations);

const [env1] = Environment.filterable.map((env) => env.id);

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <ModalProvider>
        <TestMemoryRouter initialEntries={["/lsm/catalog?env=" + env1]}>
          <MockedDependencyProvider>
            <Page>
              <ServiceCatalogPage />
            </Page>
          </MockedDependencyProvider>
        </TestMemoryRouter>
      </ModalProvider>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

describe("ServiceCatalog", () => {
  const server = setupServer();

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
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", { name: "ServiceCatalog-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("generic", { name: "ServiceCatalog-Empty" })
    ).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("ServiceCatalog shows success state", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", () => {
        return HttpResponse.json({ data: [Service.a] });
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "ServiceCatalog-Success" })
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
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "ServiceCatalog-Success" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("Actions-dropdown"));

    await userEvent.click(screen.getByLabelText(Service.a.name + "-deleteButton"));

    await userEvent.click(screen.getByText(words("yes")));

    expect(
      await screen.findByRole("generic", { name: "ServiceCatalog-Empty" })
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
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "ServiceCatalog-Empty" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText("Update Service Catalog"));

    await userEvent.click(screen.getByText(words("yes")));

    expect(
      await screen.findByRole("generic", { name: "ServiceCatalog-Success" })
    ).toBeInTheDocument();
  });
});
