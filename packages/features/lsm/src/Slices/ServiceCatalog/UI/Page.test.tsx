import React, { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { ServiceModel, words } from "@inmanta/web-console-core";
import { lsmFeature } from "@inmanta/web-console-feature-lsm";
import {
  MockedDependencyProvider,
  Environment,
  Service,
  ModalProvider,
} from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import {
  aviVirtualIp,
  deployment,
  deploymentTree,
  dnsRecord,
  firewall,
  linuxVm,
  router,
  vpn,
} from "./Mock";
import { ServiceCatalogPage } from ".";

const [env1] = Environment.filterable.map((env) => env.id);

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <ModalProvider>
        <TestMemoryRouter initialEntries={["/lsm/catalog?env=" + env1]}>
          <MockedDependencyProvider features={[lsmFeature]}>
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
  const server = setupTestServer();

  beforeAll(() => server.listen());

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    testClient.clear();
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

  test("GIVEN ServiceCatalog WHEN services have groups THEN they are shown in group sections", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", () => {
        return HttpResponse.json({ data: [linuxVm, firewall, vpn, router] });
      })
    );

    const { component } = setup();

    render(component);

    const networkList = await screen.findByRole("list", {
      name: router.entity_annotations?.web_group,
    });

    expect(within(networkList).getByTestId(router.name + "-item")).toBeInTheDocument();
    expect(within(networkList).getByTestId(vpn.name + "-item")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ServiceCatalog WHEN services own other services THEN only the roots are listed until expanded", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", () => {
        return HttpResponse.json({ data: [linuxVm, ...deploymentTree] });
      })
    );

    const { component } = setup();

    render(component);

    const list = await screen.findByRole("list", { name: words("catalog.title") });

    expect(within(list).getByTestId(deployment.name + "-item")).toBeVisible();
    expect(within(list).getByTestId(dnsRecord.name + "-item")).not.toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: words("expandAll") }));

    const expandedList = screen.getByRole("list", { name: words("catalog.title") });

    deploymentTree.forEach((service) =>
      expect(within(expandedList).getByTestId(service.name + "-item")).toBeVisible()
    );

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    await userEvent.click(screen.getByRole("button", { name: words("collapseAll") }));

    const collapsedList = screen.getByRole("list", { name: words("catalog.title") });

    expect(within(collapsedList).getByTestId(deployment.name + "-item")).toBeVisible();
    expect(within(collapsedList).getByTestId(dnsRecord.name + "-item")).not.toBeVisible();
    expect(within(collapsedList).getByTestId(aviVirtualIp.name + "-item")).not.toBeVisible();
  });

  test("GIVEN ServiceCatalog WHEN the filter matches an owned service THEN only the path to it is shown, expanded", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", () => {
        return HttpResponse.json({ data: [linuxVm, ...deploymentTree] });
      })
    );

    const { component } = setup();

    render(component);

    await screen.findByTestId(linuxVm.name + "-item");

    await userEvent.type(
      screen.getByRole("textbox", { name: words("catalog.filter.placeholder") }),
      aviVirtualIp.name
    );

    const list = screen.getByRole("list", { name: words("catalog.title") });

    expect(within(list).getByTestId(deployment.name + "-item")).toBeVisible();
    expect(within(list).getByTestId(aviVirtualIp.name + "-item")).toBeVisible();
    expect(within(list).queryByTestId(dnsRecord.name + "-item")).not.toBeInTheDocument();
    expect(within(list).queryByTestId(linuxVm.name + "-item")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: words("collapseAll") }));

    const collapsedList = screen.getByRole("list", { name: words("catalog.title") });

    expect(within(collapsedList).getByTestId(deployment.name + "-item")).toBeVisible();
    expect(within(collapsedList).getByTestId(aviVirtualIp.name + "-item")).not.toBeVisible();
  });

  test("GIVEN ServiceCatalog WHEN a filter is set THEN the toolbar count goes from all services to the matches of all services", async () => {
    const serviceModels = [linuxVm, ...deploymentTree];

    server.use(
      http.get("/lsm/v1/service_catalog", () => {
        return HttpResponse.json({ data: serviceModels });
      })
    );

    const { component } = setup();

    render(component);

    await screen.findByTestId(linuxVm.name + "-item");

    expect(screen.getByText(words("catalog.serviceCount")(serviceModels.length))).toBeVisible();

    await userEvent.type(
      screen.getByRole("textbox", { name: words("catalog.filter.placeholder") }),
      aviVirtualIp.name
    );

    expect(
      screen.getByText(
        words("catalog.serviceCount.filtered")([aviVirtualIp].length, serviceModels.length)
      )
    ).toBeVisible();
  });

  test("GIVEN ServiceCatalog WHEN the filter matches no service THEN a no results view resets it", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", () => {
        return HttpResponse.json({ data: [linuxVm, vpn] });
      })
    );

    const { component } = setup();

    render(component);

    await screen.findByTestId(linuxVm.name + "-item");

    await userEvent.type(
      screen.getByRole("textbox", { name: words("catalog.filter.placeholder") }),
      "no service has this text"
    );

    expect(screen.getByText(words("empty.filtered.title"))).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", { name: words("resources.filters.active.resetFilters") })
    );

    expect(screen.getByTestId(linuxVm.name + "-item")).toBeVisible();
    expect(screen.getByTestId(vpn.name + "-item")).toBeVisible();
  });

  test("GIVEN ServiceCatalog WHEN no service owns another THEN there is no Expand all", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog", () => {
        return HttpResponse.json({ data: [linuxVm, vpn] });
      })
    );

    const { component } = setup();

    render(component);

    await screen.findByTestId(linuxVm.name + "-item");

    expect(screen.queryByRole("button", { name: words("expandAll") })).not.toBeInTheDocument();
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

  test.each`
    case                   | service                                                                  | serviceTitle
    ${"with web_title"}    | ${{ ...Service.a, entity_annotations: Service.EntityAnnotations.valid }} | ${Service.EntityAnnotations.valid.web_title}
    ${"without web_title"} | ${Service.a}                                                             | ${Service.a.name}
  `(
    "GIVEN ServiceCatalog WHEN deleting a service $case THEN the confirmation names it by $serviceTitle",
    async ({ service, serviceTitle }) => {
      server.use(
        http.get("/lsm/v1/service_catalog", () => {
          return HttpResponse.json({ data: [service] });
        })
      );

      const { component } = setup();

      render(component);

      await userEvent.click(await screen.findByLabelText("Actions-dropdown"));
      await userEvent.click(screen.getByLabelText(Service.a.name + "-deleteButton"));

      expect(
        await screen.findByText(words("catalog.delete.title")(serviceTitle), { exact: false })
      ).toBeVisible();
    }
  );

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
