import React from "react";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceModel, words } from "@inmanta/web-console-core";
import { Inventories } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { ComposerTestProvider } from "../Mock/ComposerTestProvider";
import {
  childService,
  inventoryInstance,
  parentService,
  standaloneService,
} from "../Mock/serviceModels";
import { instanceShapes, toCanvasState } from "../Mock/shapes";
import { defineReactFlowTestObjects } from "../testSetup";
import { Canvas } from "./Canvas";
import { LeftSidebar } from "./LeftSidebar";

defineReactFlowTestObjects();

const parentInstance = inventoryInstance(parentService, "parent-1", {
  name: "edge-1",
  region: "eu",
  settings: { vlan: "100" },
});
const childInstance = inventoryInstance(childService, "child-1", {
  name: "leaf-1",
  parent_entity: "parent-1",
});
const serviceInventories: Inventories = {
  "parent-service": [parentInstance],
  "child-service": [childInstance],
};

interface SetupOptions {
  shapes?: ServiceEntityShape[];
  editable?: boolean;
  serviceCatalog?: ServiceModel[];

  /** The test inventory by default; null for none yet. */
  serviceInventories?: Inventories | null;
  inventoriesError?: string;
  isFetchingInventories?: boolean;
  refetchInventories?: () => void;
}

const palette = ({ shapes = [], serviceInventories: inventories, ...options }: SetupOptions) => (
  <ComposerTestProvider
    shapes={toCanvasState(...shapes)}
    serviceInventories={inventories === undefined ? serviceInventories : inventories}
    {...options}
  >
    <LeftSidebar />
    <Canvas />
  </ComposerTestProvider>
);

/**
 * Renders the palette with the canvas; `rerender` renders it again with other options.
 */
const setup = (options: SetupOptions = {}) => {
  const result = render(palette(options));

  return { ...result, rerender: (next: SetupOptions) => result.rerender(palette(next)) };
};

const openInventory = () =>
  userEvent.click(screen.getByRole("tab", { name: words("instanceComposer.stencil.inventory") }));

describe("LeftSidebar", () => {
  it("shows the selected tab in a tab panel the tabs control", async () => {
    setup();

    const newTab = screen.getByRole("tab", { name: words("instanceComposer.stencil.new") });
    const panel = screen.getByRole("tabpanel");

    expect(newTab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAccessibleName(words("instanceComposer.stencil.new"));

    await openInventory();

    expect(screen.getByRole("tabpanel")).toHaveAccessibleName(
      words("instanceComposer.stencil.inventory")
    );
  });

  it("lists every service and the embedded entities it can create, grouped per service", () => {
    setup();

    expect(
      screen.getByRole("tab", { name: words("instanceComposer.stencil.new") })
    ).toHaveAttribute("aria-selected", "true");

    const parentGroup = screen.getByTestId("palette-group-parent-service");
    const settings = within(parentGroup).getByTestId("palette-item-settings");

    expect(within(parentGroup).getByTestId("palette-item-parent-service")).toHaveTextContent(
      `parent-service${words("instanceComposer.label.core")}`
    );
    expect(settings).toHaveTextContent(`settings${words("instanceComposer.label.embedded")}`);
    expect(screen.getByTestId("palette-group-child-service")).toBeVisible();
  });

  it("groups the services by their web_group annotation, the ungrouped ones last", () => {
    const annotated = (
      model: ServiceModel,
      web_group: string,
      web_order: number
    ): ServiceModel => ({
      ...model,
      entity_annotations: { web_group, web_order },
    });

    setup({
      serviceCatalog: [
        annotated({ ...standaloneService, name: "extra-service" }, "Admin", 9),
        annotated(childService, "Network", 2),
        annotated(parentService, "Network", 1),
        standaloneService,
      ],
    });

    const network = screen.getByTestId("palette-group-Network");
    const rows = within(network)
      .getAllByTestId(/^palette-item-/)
      .map((row) => row.getAttribute("data-testid"));

    // Within the group the services follow their web_order, each with its embedded entities
    expect(rows).toEqual([
      "palette-item-parent-service",
      "palette-item-settings",
      "palette-item-child-service",
    ]);

    const admin = screen.getByTestId("palette-group-Admin");
    const other = screen.getByTestId("palette-group-other-services");

    expect(within(other).getByTestId("palette-item-standalone-service")).toBeInTheDocument();
    expect(screen.getByText(words("instanceComposer.palette.otherServices"))).toBeVisible();
    // The groups follow their services' lowest web_order, and the ungrouped services come last
    expect(network.compareDocumentPosition(admin)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(admin.compareDocumentPosition(other)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("names and sorts the services by their web_title like the catalog, and finds them by their technical name too", async () => {
    // By title, the parent service comes first; by technical name and in the inventory, the child
    setup({
      serviceCatalog: [
        { ...childService, entity_annotations: { web_title: "Zone link" } },
        { ...parentService, entity_annotations: { web_title: "Access router" } },
      ],
      serviceInventories: {
        "child-service": [childInstance],
        "parent-service": [parentInstance],
      },
    });

    const parentGroup = screen.getByTestId("palette-group-parent-service");
    const childGroup = screen.getByTestId("palette-group-child-service");

    expect(within(parentGroup).getByRole("button", { expanded: true })).toHaveTextContent(
      "Access router"
    );
    expect(parentGroup.compareDocumentPosition(childGroup)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(within(parentGroup).getByTestId("palette-item-parent-service")).toHaveTextContent(
      `Access router${words("instanceComposer.label.withName")(
        words("instanceComposer.label.core"),
        "parent-service"
      )}`
    );

    await userEvent.type(
      screen.getByRole("textbox", { name: words("instanceComposer.palette.searchEntities") }),
      "parent-serv"
    );

    expect(screen.getByTestId("palette-item-parent-service")).toBeVisible();
    expect(screen.queryByTestId("palette-item-child-service")).not.toBeInTheDocument();

    await openInventory();

    const inventoryGroups = screen
      .getAllByTestId(/^palette-group-/)
      .map((group) => within(group).getByRole("button", { expanded: true }).textContent);

    expect(inventoryGroups).toEqual(["Access router1", "Zone link1"]);
  });

  it("shows the lifecycle state of an inventory instance", async () => {
    setup();
    await openInventory();

    const row = screen.getByTestId("palette-item-edge-1");

    expect(within(row).getByText("up")).toBeVisible();
    expect(row.querySelector(".pf-m-success")).toBeInTheDocument();
  });

  it("groups the inventory by web_group like the catalog, with each instance's service", async () => {
    setup({
      serviceCatalog: [
        { ...childService, entity_annotations: { web_group: "Network", web_title: "Leaf" } },
        { ...parentService, entity_annotations: { web_group: "Network", web_title: "Edge" } },
        standaloneService,
      ],
    });
    await openInventory();

    const network = screen.getByTestId("palette-group-Network");

    // Both services' instances in one group, each naming its service; no group per service
    expect(within(network).getByTestId("palette-item-edge-1")).toHaveTextContent("edge-1Edge");
    expect(within(network).getByTestId("palette-item-leaf-1")).toHaveTextContent("leaf-1Leaf");
    expect(screen.queryByTestId("palette-group-parent-service")).not.toBeInTheDocument();

    await userEvent.type(
      screen.getByRole("textbox", { name: words("instanceComposer.palette.searchInstances") }),
      "child-serv"
    );

    expect(screen.getByTestId("palette-item-leaf-1")).toBeVisible();
    expect(screen.queryByTestId("palette-item-edge-1")).not.toBeInTheDocument();
  });

  it("filters the rows with the search, and says when nothing matches", async () => {
    setup();

    const search = screen.getByRole("textbox", {
      name: words("instanceComposer.palette.searchEntities"),
    });

    await userEvent.type(search, "sett");

    expect(screen.getByTestId("palette-item-settings")).toBeVisible();
    expect(screen.queryByTestId("palette-item-child-service")).not.toBeInTheDocument();
    expect(screen.getByText(words("instanceComposer.palette.results")(1))).toBeVisible();

    await userEvent.clear(search);
    await userEvent.type(search, "zzz");

    expect(
      screen.getByRole("heading", {
        name: words("instanceComposer.palette.noResults.title")("zzz"),
      })
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.palette.clearSearch") })
    );

    expect(search).toHaveValue("");
    expect(screen.getByTestId("palette-item-child-service")).toBeVisible();
  });

  it("collapses a group", async () => {
    setup();

    const toggle = within(screen.getByTestId("palette-group-parent-service")).getByRole("button", {
      name: /parent-service/,
      expanded: true,
    });

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("palette-item-settings")).not.toBeInTheDocument();
  });

  it("adds a new service with the embedded entities it requires with its + button", async () => {
    setup();

    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.palette.add")("parent-service") })
    );

    expect(await screen.findByTestId("entity-parent-service")).toBeVisible();
    expect(screen.getByTestId("entity-settings")).toBeVisible();
  });

  it("adds an inventory instance with its cluster, and greys out what is on the canvas", async () => {
    setup();
    await openInventory();

    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.palette.add")("leaf-1") })
    );

    // The instance, the instance it relates to, and that one's embedded entity
    expect(await screen.findByTestId("entity-child-service")).toBeVisible();
    expect(screen.getByTestId("entity-parent-service")).toBeVisible();
    expect(screen.getByTestId("entity-settings")).toBeVisible();

    ["leaf-1", "edge-1"].forEach((name) => {
      const row = screen.getByTestId(`palette-item-${name}`);

      expect(row).toHaveAttribute("aria-disabled", "true");
      expect(row).toHaveTextContent(words("instanceComposer.palette.onCanvas"));
      expect(within(row).queryByRole("button")).not.toBeInTheDocument();
    });
  });

  it("only greys out the inventory instances on the canvas", async () => {
    setup({ shapes: instanceShapes(parentInstance, parentService) });
    await openInventory();

    expect(screen.getByTestId("palette-item-edge-1")).toHaveTextContent(
      words("instanceComposer.palette.onCanvas")
    );

    const offered = screen.getByTestId("palette-item-leaf-1");

    expect(offered).not.toHaveAttribute("aria-disabled");
    expect(offered).not.toHaveTextContent(words("instanceComposer.palette.onCanvas"));
  });

  it("says when the inventory has no instances", async () => {
    render(
      <ComposerTestProvider>
        <LeftSidebar />
        <Canvas />
      </ComposerTestProvider>
    );
    await openInventory();

    expect(
      screen.getByRole("heading", { name: words("instanceComposer.palette.noInstances") })
    ).toBeVisible();
  });

  it("shows the kind and a name it cuts short in tooltips, not native titles", async () => {
    setup();

    const row = screen.getByTestId("palette-item-parent-service");

    await userEvent.hover(row.querySelector(".palette-row-icon") as HTMLElement);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      words("instanceComposer.label.core")
    );
    await userEvent.unhover(row.querySelector(".palette-row-icon") as HTMLElement);

    const name = within(row).getByText("parent-service");

    await userEvent.hover(name);
    expect(screen.queryByRole("tooltip", { name: "parent-service" })).not.toBeInTheDocument();
    await userEvent.unhover(name);

    Object.defineProperty(name, "scrollWidth", { configurable: true, value: 400 });
    await userEvent.hover(name);

    expect(await screen.findByRole("tooltip", { name: "parent-service" })).toBeInTheDocument();
    expect(screen.getByTestId("left_sidebar").querySelector("[title]")).not.toBeInTheDocument();
  });

  it("is hidden in the viewer", () => {
    setup({ editable: false });

    expect(screen.getByTestId("left_sidebar")).toHaveClass("view_mode");
  });

  describe("inventory fetching", () => {
    it("says the inventory is loading until it first arrives, and keeps the last one after", async () => {
      const { rerender } = setup({
        serviceInventories: null,
        isFetchingInventories: true,
        refetchInventories: vi.fn(),
      });

      await openInventory();

      expect(
        screen.getByRole("heading", { name: words("instanceComposer.palette.inventoryLoading") })
      ).toBeVisible();
      expect(
        screen.queryByText(words("instanceComposer.palette.noInstances"))
      ).not.toBeInTheDocument();

      // Fetching it again keeps the inventory it has
      rerender({ isFetchingInventories: true });

      expect(screen.getByTestId("palette-item-edge-1")).toBeVisible();
    });

    it("fetches the inventory again each time the Inventory tab opens", async () => {
      const refetchInventories = vi.fn();

      setup({ refetchInventories });

      await openInventory();
      // Selecting the open tab again doesn't fetch it again
      await openInventory();

      expect(refetchInventories).toHaveBeenCalledTimes(1);

      await userEvent.click(
        screen.getByRole("tab", { name: words("instanceComposer.stencil.new") })
      );
      await openInventory();

      expect(refetchInventories).toHaveBeenCalledTimes(2);
    });

    it("shows why the inventory couldn't be fetched instead of the last one, with a retry", async () => {
      const refetchInventories = vi.fn();

      setup({ inventoriesError: "Request failed", refetchInventories });
      await openInventory();

      expect(
        screen.getByRole("heading", { name: words("instanceComposer.palette.inventoryError") })
      ).toBeVisible();
      expect(screen.getByText("Request failed")).toBeVisible();
      expect(screen.queryByTestId("palette-item-edge-1")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: words("retry") }));

      // Once when the tab opened, once for the retry
      expect(refetchInventories).toHaveBeenCalledTimes(2);
    });

    it("keeps the New tab when the inventory couldn't be fetched", () => {
      setup({ inventoriesError: "Request failed", refetchInventories: vi.fn() });

      expect(screen.getByTestId("palette-group-parent-service")).toBeVisible();
    });
  });
});
