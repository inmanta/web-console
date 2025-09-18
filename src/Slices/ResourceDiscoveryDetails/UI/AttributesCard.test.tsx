import { act } from "react";
import { Page } from "@patternfly/react-core";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { DiscoveredResource } from "@/Data/Queries";
import { AttributesCard } from "./AttributesCard";

const mockResource: DiscoveredResource = {
  discovered_resource_id: "vcenter::VirtualMachine[lab,name=acisim]",
  managed_resource_uri: "/api/v2/resource/test-resource",
  discovery_resource_uri: "/api/v2/resource/test-resource",
  resource_type: "VirtualMachine",
  resource_id_value: "acisim",
  agent: "lab",
  values: {
    name: "acisim",
    path: "/bedc/vm/acisim",
    cpu_num: 12,
    power_on: false,
    memory_mb: 32768,
    auto_start: false,
    ports: [
      {
        port_type: "vim.vm.device.VirtualE1000",
        mac_address: "00:50:56:b8:3d:0a",
        pairing_key: "P|dvportgroup-240433",
        network_path: null,
      },
    ],
    datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
    cpu_num_per_socket: 1,
    resource_pool_path: "/bedc/host/lab/Resources",
  },
};

const mockResourceWithJsonValue: DiscoveredResource = {
  ...mockResource,
  values: {
    ...mockResource.values,
    config: {
      network: {
        interfaces: ["eth0", "eth1"],
        ip: "192.168.1.100",
      },
      services: ["nginx", "mysql"],
    },
  },
};

const mockResourceWithXmlValue: DiscoveredResource = {
  ...mockResource,
  values: {
    ...mockResource.values,
    xml_config:
      '<?xml version="1.0"?><config><server><name>test</name><port>8080</port></server></config>',
  },
};

function setup(resource: DiscoveredResource) {
  const component = (
    <Page>
      <AttributesCard resource={resource} />
    </Page>
  );

  return { component };
}

describe("AttributesCard", () => {
  test("GIVEN AttributesCard component WHEN rendered with resource data THEN displays all attributes", () => {
    const { component } = setup(mockResource);

    render(component);

    // Check that basic attributes are displayed
    expect(screen.getByText("name")).toBeVisible();
    expect(screen.getByText("acisim")).toBeVisible();
    expect(screen.getByText("path")).toBeVisible();
    expect(screen.getByText("/bedc/vm/acisim")).toBeVisible();
    expect(screen.getByText("cpu_num")).toBeVisible();
    expect(screen.getByText("12")).toBeVisible();
    expect(screen.getByText("power_on")).toBeVisible();
    expect(screen.getAllByText("false")).toHaveLength(2); // power_on and auto_start are both false
    expect(screen.getByText("memory_mb")).toBeVisible();
    expect(screen.getByText("32768")).toBeVisible();
  });

  test("GIVEN AttributesCard component WHEN rendered with array values THEN displays array content", () => {
    const { component } = setup(mockResource);

    render(component);

    // Check that array attributes are displayed
    expect(screen.getByText("ports")).toBeVisible();
    expect(screen.getByText("datastore_paths")).toBeVisible();
  });

  test("GIVEN AttributesCard component WHEN rendered with nested object values THEN displays nested content", () => {
    const { component } = setup(mockResourceWithJsonValue);

    render(component);

    // Check that nested object attributes are displayed
    expect(screen.getByText("config")).toBeVisible();

    // The JSON content is rendered in a code editor, so we need to look for it within the code editor
    // Find the code editor that contains the config JSON (not the array ones)
    const codeEditors = screen.getAllByTestId("code-editor-content");
    const configCodeEditor = codeEditors.find(
      (editor) =>
        editor.textContent?.includes("network") && editor.textContent?.includes("interfaces")
    );

    expect(configCodeEditor).toBeDefined();
    expect(configCodeEditor).toHaveTextContent("network");
    expect(configCodeEditor).toHaveTextContent("interfaces");
    expect(configCodeEditor).toHaveTextContent("services");
    expect(configCodeEditor).toHaveTextContent("eth0");
    expect(configCodeEditor).toHaveTextContent("nginx");
  });

  test("GIVEN AttributesCard component WHEN rendered with XML values THEN displays XML content", () => {
    const { component } = setup(mockResourceWithXmlValue);

    render(component);

    // Check that XML attributes are displayed
    expect(screen.getByText("xml_config")).toBeVisible();

    // The XML content is rendered in a code editor, so we need to look for it within the code editor
    // Find the code editor that contains the XML content
    const codeEditors = screen.getAllByTestId("code-editor-content");
    const xmlCodeEditor = codeEditors.find((editor) =>
      editor.textContent?.includes('<?xml version="1.0"?>')
    );

    expect(xmlCodeEditor).toBeDefined();
    expect(xmlCodeEditor).toHaveTextContent('<?xml version="1.0"?>');
    expect(xmlCodeEditor).toHaveTextContent("<config>");
    expect(xmlCodeEditor).toHaveTextContent("<server>");
  });

  test("GIVEN AttributesCard component WHEN rendered THEN is accessible", async () => {
    const { component } = setup(mockResource);

    render(component);

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN AttributesCard component WHEN rendered with empty values THEN displays empty state", () => {
    const emptyResource: DiscoveredResource = {
      ...mockResource,
      values: {},
    };

    const { component } = setup(emptyResource);

    render(component);

    // The card should still be rendered even with empty values
    // Look for the card by its class
    const card = document.querySelector(".pf-v6-c-card");
    expect(card).toBeVisible();

    // The description list should be empty but still present
    // When empty, the dl element doesn't have a list role, so we look for it directly
    const descriptionList = document.querySelector("dl.pf-v6-c-description-list");
    expect(descriptionList).toBeVisible();
  });

  test("GIVEN AttributesCard component WHEN rendered with null values THEN handles null values gracefully", () => {
    const resourceWithNulls: DiscoveredResource = {
      ...mockResource,
      values: {
        name: "test",
        null_value: null,
        undefined_value: undefined,
        empty_string: "",
      },
    };

    const { component } = setup(resourceWithNulls);

    render(component);

    expect(screen.getByText("name")).toBeVisible();
    expect(screen.getByText("test")).toBeVisible();
    expect(screen.getByText("null_value")).toBeVisible();
    expect(screen.getByText("null")).toBeVisible();
  });
});
