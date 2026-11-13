import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@inmanta/web-console-core";
import { Inventories } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { ComposerTestProvider } from "../Mock/ComposerTestProvider";
import { childService, inventoryInstance, parentService } from "../Mock/serviceModels";
import { instanceShapes, newServiceShapes, toCanvasState } from "../Mock/shapes";
import { defineReactFlowTestObjects } from "../testSetup";
import { Canvas } from "./Canvas";
import { LeftSidebar } from "./LeftSidebar";

defineReactFlowTestObjects();

const setup = (
  shapes: ServiceEntityShape[],
  options: {
    activeCellId?: string;
    editable?: boolean;
    serviceInstanceId?: string;
    serviceInventories?: Inventories;
  } = {}
) =>
  render(
    <ComposerTestProvider shapes={toCanvasState(...shapes)} {...options}>
      <LeftSidebar />
      <Canvas />
    </ComposerTestProvider>
  );

/**
 * An existing parent instance and an existing child instance that requires it: the parent can't
 * be removed, the child can be deleted permanently.
 */
const existingInstances = () => {
  const parent = instanceShapes(
    inventoryInstance(parentService, "parent-1", {
      name: "edge-1",
      region: "eu",
      settings: { vlan: "100" },
    }),
    parentService
  );
  const [child] = instanceShapes(
    inventoryInstance(childService, "child-1", { name: "leaf-1", parent_entity: "parent-1" }),
    childService,
    { x: 400, y: 0 }
  );

  return { parent: parent[0], child, shapes: [...parent, child] };
};

const openMenu = async (testId: string) => {
  fireEvent.contextMenu(await screen.findByTestId(testId));

  return screen.findByTestId("entity-context-menu");
};

/** Focuses a card, like tabbing to it, so the canvas gets its keys */
const focusCard = async (testId: string) => {
  const node = (await screen.findByTestId(testId)).closest(".react-flow__node") as HTMLElement;

  act(() => node.focus());
};

describe("EntityContextMenu", () => {
  it("removes a new entity from the canvas", async () => {
    const [child] = newServiceShapes(childService);

    setup([child]);

    const menu = await openMenu("entity-child-service");

    expect(menu).toHaveAttribute(
      "aria-label",
      words("instanceComposer.halo.actions")("child-service")
    );
    expect(screen.getByRole("menu")).toBeVisible();
    expect(
      screen.queryByText(words("instanceComposer.contextMenu.delete"))
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.contextMenu.remove")),
      })
    );

    expect(screen.queryByTestId("entity-child-service")).not.toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("stages an existing instance for deletion on its card, and undoes it", async () => {
    const { shapes } = existingInstances();

    setup(shapes);
    await openMenu("entity-child-service");

    // An existing instance offers both: taking it off the canvas, and deleting it
    expect(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.contextMenu.remove")),
      })
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.contextMenu.delete")),
      })
    );

    // The card stays on the canvas, marked, so the delete can be undone
    const card = screen.getByTestId("entity-child-service");

    expect(card).toHaveAttribute("data-marked-for-deletion", "true");
    expect(within(card).getByText(words("instanceComposer.card.markedForDeletion"))).toBeVisible();

    // The menu of a marked card only offers to undo the delete
    await openMenu("entity-child-service");

    expect(
      screen.queryByText(words("instanceComposer.contextMenu.delete"))
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.contextMenu.undoDelete")),
      })
    );

    expect(screen.getByTestId("entity-child-service")).toHaveAttribute(
      "data-marked-for-deletion",
      "false"
    );
  });

  it("removes an existing instance from the canvas without deleting it", async () => {
    const parentInstance = inventoryInstance(parentService, "parent-1", {
      name: "edge-1",
      region: "eu",
      settings: { vlan: "100" },
    });
    const shapes = instanceShapes(parentInstance, parentService);

    setup(shapes, { serviceInventories: { "parent-service": [parentInstance] } });
    await openMenu("entity-parent-service");
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.contextMenu.remove")),
      })
    );

    // The instance leaves the canvas together with its embedded entities
    expect(screen.queryByTestId("entity-parent-service")).not.toBeInTheDocument();
    expect(screen.queryByTestId("entity-settings")).not.toBeInTheDocument();

    // The instance itself is kept: the inventory offers it again, not marked for deletion
    await userEvent.click(
      screen.getByRole("tab", { name: words("instanceComposer.stencil.inventory") })
    );

    const row = screen.getByTestId("palette-item-edge-1");

    expect(row).not.toHaveAttribute("aria-disabled");
    expect(
      screen.queryByText(words("instanceComposer.palette.markedForDeletion"))
    ).not.toBeInTheDocument();
  });

  it("keeps a staged delete on the canvas, with its embedded entities, 'On canvas' in the inventory", async () => {
    const parentInstance = inventoryInstance(parentService, "parent-1", {
      name: "edge-1",
      region: "eu",
      settings: { vlan: "100" },
    });
    const shapes = instanceShapes(parentInstance, parentService);

    setup(shapes, { serviceInventories: { "parent-service": [parentInstance] } });
    await openMenu("entity-parent-service");
    await userEvent.click(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.contextMenu.delete")),
      })
    );

    // The embedded entities are deleted with the instance, so they are marked with it
    expect(screen.getByTestId("entity-settings")).toHaveAttribute(
      "data-marked-for-deletion",
      "true"
    );

    // The instance is still on the canvas, so the inventory says so
    await userEvent.click(
      screen.getByRole("tab", { name: words("instanceComposer.stencil.inventory") })
    );

    const row = screen.getByTestId("palette-item-edge-1");

    expect(row).toHaveAttribute("aria-disabled", "true");
    expect(within(row).getByText(words("instanceComposer.palette.onCanvas"))).toBeVisible();
    expect(
      within(screen.getByTestId("left_sidebar")).queryByText(
        words("instanceComposer.palette.markedForDeletion")
      )
    ).not.toBeInTheDocument();
  });

  it("never offers to remove the instance being edited, only to delete it", async () => {
    const parentInstance = inventoryInstance(parentService, "parent-1", {
      name: "edge-1",
      region: "eu",
    });
    const shapes = instanceShapes(parentInstance, parentService);

    setup(shapes, { serviceInstanceId: "parent-1" });
    await openMenu("entity-parent-service");

    expect(
      screen.queryByText(words("instanceComposer.contextMenu.remove"))
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.contextMenu.delete")),
      })
    ).toBeVisible();
  });

  it("says when the relations require the entity", async () => {
    const { shapes } = existingInstances();

    setup(shapes);
    await openMenu("entity-parent-service");

    expect(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.contextMenu.cannotRemove.title")),
      })
    ).toBeDisabled();
  });

  it("closes on Escape and on a click outside it", async () => {
    const [child] = newServiceShapes(childService);

    setup([child]);
    await openMenu("entity-child-service");
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await openMenu("entity-child-service");
    await userEvent.click(document.body);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByTestId("entity-child-service")).toBeVisible();
  });

  it("has no menu in the viewer", async () => {
    const [child] = newServiceShapes(childService);

    setup([child], { editable: false });
    fireEvent.contextMenu(await screen.findByTestId("entity-child-service"));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  describe("Delete and Backspace", () => {
    it("remove the selected new entity right away", async () => {
      const [parent, settings] = newServiceShapes(parentService);
      const [child] = newServiceShapes(childService, { x: 400, y: 0 });

      setup([parent, settings, child], { activeCellId: child.id });
      await focusCard("entity-child-service");
      await userEvent.keyboard("{Delete}");

      expect(screen.queryByTestId("entity-child-service")).not.toBeInTheDocument();

      // Nothing is selected any more, so Backspace removes nothing
      await userEvent.keyboard("{Backspace}");
      expect(screen.getByTestId("entity-parent-service")).toBeVisible();
    });

    it("open the menu of a removable existing instance, to choose between remove and delete", async () => {
      const { child, shapes } = existingInstances();

      setup(shapes, { activeCellId: child.id });
      await focusCard("entity-child-service");
      await userEvent.keyboard("{Delete}");

      // Not removed right away: the user chooses what taking it off means
      expect(screen.getByTestId("entity-child-service")).toBeVisible();
      expect(await screen.findByRole("menu")).toBeVisible();
      expect(
        screen.getByRole("menuitem", {
          name: new RegExp(words("instanceComposer.contextMenu.remove")),
        })
      ).toBeVisible();
      expect(
        screen.getByRole("menuitem", {
          name: new RegExp(words("instanceComposer.contextMenu.delete")),
        })
      ).toBeVisible();
    });

    it("open the menu of an existing instance, to delete it or say why it can't be", async () => {
      const { parent, shapes } = existingInstances();

      setup(shapes, { activeCellId: parent.id });
      await focusCard("entity-parent-service");
      await userEvent.keyboard("{Backspace}");

      expect(await screen.findByRole("menu")).toBeVisible();
      expect(
        screen.getByRole("menuitem", {
          name: new RegExp(words("instanceComposer.contextMenu.cannotRemove.title")),
        })
      ).toBeDisabled();
      expect(screen.getByTestId("entity-parent-service")).toBeVisible();
    });

    it("do nothing in the viewer", async () => {
      const [child] = newServiceShapes(childService);

      setup([child], { activeCellId: child.id, editable: false });
      await focusCard("entity-child-service");
      await userEvent.keyboard("{Delete}");

      expect(screen.getByTestId("entity-child-service")).toBeVisible();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });
});
