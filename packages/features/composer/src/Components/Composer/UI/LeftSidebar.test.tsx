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

const setup = (
  options: {
    shapes?: ServiceEntityShape[];
    deletedInstanceIds?: string[];
    editable?: boolean;
    serviceCatalog?: ServiceModel[];
  } = {}
) =>
  render(
    <ComposerTestProvider
      shapes={toCanvasState(...(options.shapes ?? []))}
      serviceCatalog={options.serviceCatalog}
      serviceInventories={serviceInventories}
      deletedInstanceIds={options.deletedInstanceIds}
      editable={options.editable}
    >
      <LeftSidebar />
      <Canvas />
    </ComposerTestProvider>
  );

const openInventory = () =>
  userEvent.click(screen.getByRole("tab", { name: words("instanceComposer.stencil.inventory") }));

describe("LeftSidebar", () => {
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

    const other = screen.getByTestId(
      `palette-group-${words("instanceComposer.palette.otherServices")}`
    );

    expect(within(other).getByTestId("palette-item-standalone-service")).toBeInTheDocument();
    // The ungrouped services come last
    expect(network.compareDocumentPosition(other)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("shows the lifecycle state of an inventory instance", async () => {
    setup();
    await openInventory();

    const row = screen.getByTestId("palette-item-edge-1");

    expect(within(row).getByText("up")).toBeVisible();
    expect(row.querySelector(".pf-m-success")).toBeInTheDocument();
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

  it("says why an inventory instance can't be added again", async () => {
    setup({
      shapes: instanceShapes(parentInstance, parentService),
      deletedInstanceIds: ["child-1"],
    });
    await openInventory();

    expect(screen.getByTestId("palette-item-edge-1")).toHaveTextContent(
      words("instanceComposer.palette.onCanvas")
    );
    expect(screen.getByTestId("palette-item-leaf-1")).toHaveTextContent(
      words("instanceComposer.palette.markedForDeletion")
    );
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
});
