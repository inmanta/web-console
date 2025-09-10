import { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Page as ResourceDiscoveryDetailsPage } from "./Page";

// Mock data for individual resource details
const mockResourceDetails = {
  discovered_resource_id: "vcenter::VirtualMachine[lab,name=acisim]",
  managed_resource_uri:
    "/api/v2/resource/cloudflare::dns_record::CnameRecord[https://api.cloudflare.com/client/v4/,name=artifacts.ssh.inmanta.com]",
  discovery_resource_uri:
    "/api/v2/resource/cloudflare::dns_record::CnameRecord[https://api.cloudflare.com/client/v4/,name=artifacts.ssh.inmanta.com]",
  values: {
    name: "acisim",
    path: "/bedc/vm/acisim",
    ports: [
      {
        port_type: "vim.vm.device.VirtualE1000",
        mac_address: "00:50:56:b8:3d:0a",
        pairing_key: "P|dvportgroup-240433",
        network_path: null,
      },
    ],
    cpu_num: 12,
    power_on: false,
    memory_mb: 32768,
    auto_start: false,
    hot_add_cpu: false,
    hot_add_memory: false,
    hot_remove_cpu: false,
    iso_cdrom_name: null,
    datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
    cpu_num_per_socket: 1,
    resource_pool_path: "/bedc/host/lab/Resources",
  },
};

const mockResourceDetailsNoManaged = {
  ...mockResourceDetails,
  managed_resource_uri: null,
};

const mockResourceDetailsNoDiscovery = {
  ...mockResourceDetails,
  discovery_resource_uri: null,
};

const mockResourceDetailsNoLinks = {
  ...mockResourceDetails,
  managed_resource_uri: null,
  discovery_resource_uri: null,
};

function setup(resourceId = "test-resource-id") {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Page>
            <ResourceDiscoveryDetailsPage resourceId={resourceId} />
          </Page>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return {
    component,
  };
}

describe("ResourceDiscoveryDetailsPage", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN ResourceDiscoveryDetails page THEN shows loading state initially", async () => {
    const resourceId = "loading-test-resource";
    server.use(
      http.get(`/api/v2/discovered/${resourceId}`, () => {
        return HttpResponse.json({ data: mockResourceDetails });
      })
    );

    const { component } = setup(resourceId);

    render(component);

    expect(screen.getByLabelText("DiscoveredResourceDetails-Loading")).toBeVisible();
  });

  test("GIVEN ResourceDiscoveryDetails page WHEN API returns error AND user clicks retry THEN refetches data", async () => {
    const resourceId = "retry-test-resource";
    let callCount = 0;
    server.use(
      http.get(`/api/v2/discovered/${resourceId}`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json({ error: "Network error" }, { status: 500 });
        }
        return HttpResponse.json({ data: mockResourceDetails });
      })
    );

    const { component } = setup(resourceId);

    render(component);

    expect(await screen.findByLabelText("DiscoveredResourceDetailsView-Error")).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByText(mockResourceDetails.discovered_resource_id)).toBeVisible();
  });

  test("GIVEN ResourceDiscoveryDetails page WHEN API returns no data THEN shows empty view", async () => {
    const resourceId = "empty-test-resource";
    server.use(
      http.get(`/api/v2/discovered/${resourceId}`, () => {
        return HttpResponse.json({ data: null });
      })
    );

    const { component } = setup(resourceId);

    render(component);

    expect(await screen.findByLabelText("DiscoveredResourceDetailsView-Empty")).toBeVisible();
    expect(screen.getByText(words("discoveredResourceDetails.empty"))).toBeVisible();
  });

  test("GIVEN ResourceDiscoveryDetails page WHEN API returns success with data THEN shows resource details with both links", async () => {
    const resourceId = "success-test-resource";
    server.use(
      http.get(`/api/v2/discovered/${resourceId}`, () => {
        return HttpResponse.json({ data: mockResourceDetails });
      })
    );

    const { component } = setup(resourceId);

    render(component);

    expect(await screen.findByText(mockResourceDetails.discovered_resource_id)).toBeVisible();

    // Check that both resource links are present
    expect(
      screen.getByRole("button", { name: words("discovered_resources.show_resource.managed") })
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: words("discovered_resources.show_resource.discovery") })
    ).toBeVisible();

    // Check that AttributesCard is rendered
    expect(screen.getByText("name")).toBeVisible(); // This should be in the attributes card
    expect(screen.getByText("acisim")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourceDiscoveryDetails page WHEN API returns success with only managed resource THEN shows resource details with only managed link", async () => {
    const resourceId = "managed-only-test-resource";
    server.use(
      http.get(`/api/v2/discovered/${resourceId}`, () => {
        return HttpResponse.json({ data: mockResourceDetailsNoDiscovery });
      })
    );

    const { component } = setup(resourceId);

    render(component);

    // Wait for the component to load and render
    await screen.findByText(mockResourceDetails.discovered_resource_id);

    // Check that only managed resource link is present
    expect(
      screen.getByRole("button", { name: words("discovered_resources.show_resource.managed") })
    ).toBeVisible();
    expect(
      screen.queryByRole("button", { name: words("discovered_resources.show_resource.discovery") })
    ).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourceDiscoveryDetails page WHEN API returns success with only discovery resource THEN shows resource details with only discovery link", async () => {
    const resourceId = "discovery-only-test-resource";
    server.use(
      http.get(`/api/v2/discovered/${resourceId}`, () => {
        return HttpResponse.json({ data: mockResourceDetailsNoManaged });
      })
    );

    const { component } = setup(resourceId);

    render(component);

    // Wait for the component to load and render
    await screen.findByText(mockResourceDetails.discovered_resource_id);

    // Check that only discovery resource link is present
    expect(
      screen.queryByRole("button", { name: words("discovered_resources.show_resource.managed") })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: words("discovered_resources.show_resource.discovery") })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourceDiscoveryDetails page WHEN API returns success with no resource links THEN shows resource details without any links", async () => {
    const resourceId = "no-links-test-resource";
    server.use(
      http.get(`/api/v2/discovered/${resourceId}`, () => {
        return HttpResponse.json({ data: mockResourceDetailsNoLinks });
      })
    );

    const { component } = setup(resourceId);

    render(component);

    // Wait for the component to load and render
    await screen.findByText(mockResourceDetails.discovered_resource_id);

    // Check that no resource links are present
    expect(
      screen.queryByRole("button", { name: words("discovered_resources.show_resource.managed") })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: words("discovered_resources.show_resource.discovery") })
    ).not.toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourceDiscoveryDetails page WHEN API returns success THEN page title is correct", async () => {
    const resourceId = "title-test-resource";
    server.use(
      http.get(`/api/v2/discovered/${resourceId}`, () => {
        return HttpResponse.json({ data: mockResourceDetails });
      })
    );

    const { component } = setup(resourceId);

    render(component);

    expect(await screen.findByText(words("discoveredResourceDetails.title"))).toBeVisible();
  });
});
