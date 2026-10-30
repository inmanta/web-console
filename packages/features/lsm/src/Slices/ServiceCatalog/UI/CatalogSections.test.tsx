import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { ServiceModel, words } from "@inmanta/web-console-core";
import { lsmFeature } from "@inmanta/web-console-feature-lsm";
import { MockedDependencyProvider, Service } from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { CatalogSections } from "./CatalogSections";
import {
  aviLoadBalancerCluster,
  aviVirtualIp,
  deployment,
  deploymentTree,
  dnsRecord,
  firewall,
  linuxVm,
  loadBalancer,
  router,
  vpn,
} from "./Mock";
import { ownerServiceFallbackIconName, serviceFallbackIconName } from "./types";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const search = "?env=aaa";

const Component = (serviceModels: ServiceModel[]) => {
  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/lsm/catalog" + search]}>
        <MockedDependencyProvider features={[lsmFeature]}>
          <CatalogSections serviceModels={serviceModels} />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
};

afterEach(() => {
  testClient.clear();
});

test("GIVEN CatalogSections WHEN no service has a group THEN one table without section headings is shown", async () => {
  render(Component([Service.a, Service.b]));

  const table = screen.getByRole("grid", { name: words("catalog.title") });

  expect(within(table).getByTestId(Service.a.name + "-item")).toBeInTheDocument();
  expect(within(table).getByTestId(Service.b.name + "-item")).toBeInTheDocument();
  expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: words("catalog.ownedServices.expandAll") })
  ).not.toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN CatalogSections WHEN services have groups THEN each group gets a heading with its counts", async () => {
  const networkServices = [router, vpn];

  render(Component([linuxVm, firewall, ...networkServices]));

  const headings = screen
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent);

  expect(headings).toEqual([
    router.entity_annotations?.web_group,
    firewall.entity_annotations?.web_group,
    words("catalog.section.ungrouped"),
  ]);
  expect(
    screen.getByText(
      words("catalog.section.count")(
        networkServices.length,
        Number(router.instance_summary?.total) + Number(vpn.instance_summary?.total)
      )
    )
  ).toBeVisible();

  const networkTable = screen.getByRole("grid", {
    name: router.entity_annotations?.web_group,
  });

  expect(within(networkTable).getByTestId(router.name + "-item")).toBeInTheDocument();
  expect(within(networkTable).getByTestId(vpn.name + "-item")).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN CatalogSections WHEN services own other services THEN they are nested under their owner and collapsed", async () => {
  render(Component([linuxVm, ...deploymentTree]));

  const table = screen.getByRole("treegrid", { name: words("catalog.title") });
  const getVisibleServiceNames = () =>
    within(table)
      .getAllByRole("row")
      .map((row) => row.id);

  expect(getVisibleServiceNames()).toEqual([deployment.name, linuxVm.name]);
  expect(
    within(screen.getByTestId(deployment.name + "-item")).getByText(
      words("catalog.ownedServices.count")(deployment.owned_entities.length)
    )
  ).toBeVisible();

  await userEvent.click(
    screen.getByRole("button", {
      name: words("catalog.ownedServices.expand")(String(deployment.entity_annotations?.web_title)),
    })
  );

  expect(getVisibleServiceNames()).toEqual([
    deployment.name,
    dnsRecord.name,
    aviLoadBalancerCluster.name,
    linuxVm.name,
  ]);
  expect(screen.getByTestId(dnsRecord.name + "-item")).toHaveAttribute("aria-level", "2");

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN CatalogSections WHEN Expand all and Collapse all are clicked THEN every level expands and collapses", async () => {
  render(Component(deploymentTree));

  await userEvent.click(
    screen.getByRole("button", { name: words("catalog.ownedServices.expandAll") })
  );

  expect(screen.getByTestId(aviVirtualIp.name + "-item")).toHaveAttribute("aria-level", "3");
  expect(screen.getAllByRole("row")).toHaveLength(deploymentTree.length);

  await userEvent.click(
    screen.getByRole("button", { name: words("catalog.ownedServices.collapseAll") })
  );

  expect(screen.getAllByRole("row").map((row) => row.id)).toEqual([deployment.name]);
});

test("GIVEN CatalogSections WHEN a service has entity annotations THEN its title, raw name and description are shown", async () => {
  render(Component([vpn]));

  const row = screen.getByTestId(vpn.name + "-item");

  expect(
    within(row).getByRole("link", { name: vpn.entity_annotations?.web_title })
  ).toHaveAttribute("href", `/lsm/catalog/${vpn.name}/inventory${search}`);
  expect(within(row).getByText(vpn.name)).toBeVisible();
  expect(within(row).getByText(String(vpn.entity_annotations?.web_description))).toBeVisible();
  expect(within(row).getByTestId(String(vpn.entity_annotations?.web_icon))).toBeInTheDocument();
});

test("GIVEN CatalogSections WHEN some services have a web_icon THEN the others get a fallback icon", async () => {
  const ownerFirewall: ServiceModel = { ...firewall, owned_entities: [linuxVm.name] };

  render(Component([vpn, ownerFirewall, linuxVm]));

  expect(
    within(screen.getByTestId(vpn.name + "-item")).getByTestId(
      String(vpn.entity_annotations?.web_icon)
    )
  ).toBeInTheDocument();
  expect(
    within(screen.getByTestId(firewall.name + "-item")).getByTestId(ownerServiceFallbackIconName)
  ).toBeInTheDocument();
  expect(
    within(screen.getByTestId(linuxVm.name + "-item")).getByTestId(serviceFallbackIconName)
  ).toBeInTheDocument();
});

test("GIVEN CatalogSections WHEN no service has a web_icon THEN no row shows an icon", async () => {
  render(Component([Service.a, Service.b]));

  expect(screen.queryByTestId(serviceFallbackIconName)).not.toBeInTheDocument();
  expect(screen.queryByTestId(ownerServiceFallbackIconName)).not.toBeInTheDocument();
});

test("GIVEN CatalogSections WHEN a service has no annotations THEN its name is shown once with its description", async () => {
  render(Component([Service.a]));

  const row = screen.getByTestId(Service.a.name + "-item");

  expect(within(row).getByRole("link", { name: Service.a.name })).toBeVisible();
  expect(within(row).getAllByText(Service.a.name)).toHaveLength(1);
  expect(within(row).getByText(String(Service.a.description))).toBeVisible();
});

test("GIVEN CatalogSections WHEN a service has no instances THEN 'No instances' is shown", async () => {
  render(Component([linuxVm, loadBalancer, vpn]));

  expect(
    within(screen.getByTestId(linuxVm.name + "-item")).getByText(words("catalog.instances.none"))
  ).toBeVisible();
  expect(
    within(screen.getByTestId(loadBalancer.name + "-item")).getByText(
      words("catalog.instances.none")
    )
  ).toBeVisible();
  expect(
    within(screen.getByTestId(vpn.name + "-item")).queryByText(words("catalog.instances.none"))
  ).not.toBeInTheDocument();
});

test("GIVEN CatalogSections WHEN service THEN service inventory has correct link", async () => {
  const { container } = render(Component([Service.a]));

  const row = screen.getByTestId(Service.a.name + "-item");

  expect(container.querySelector(`#${Service.a.name}`)).toBe(row);
  const link = within(row).getByRole("link", { name: words("catalog.button.inventory") });

  expect(link).toHaveAttribute("href", `/lsm/catalog/${Service.a.name}/inventory${search}`);
});

test("GIVEN CatalogSections WHEN service THEN service details has correct link", async () => {
  render(Component([Service.a]));

  await userEvent.click(screen.getByLabelText("Actions-dropdown"));

  const link = screen.getByRole("link", { name: words("showDetails") });

  expect(link).toHaveAttribute("href", `/lsm/catalog/${Service.a.name}/details${search}`);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
