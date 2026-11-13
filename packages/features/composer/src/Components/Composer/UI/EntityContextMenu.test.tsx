import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { ComposerTestProvider } from "../Mock/ComposerTestProvider";
import { childService, inventoryInstance, parentService } from "../Mock/serviceModels";
import { instanceShapes, newServiceShapes, toCanvasState } from "../Mock/shapes";
import { defineReactFlowTestObjects } from "../testSetup";
import { Canvas } from "./Canvas";

defineReactFlowTestObjects();

const setup = (
  shapes: ServiceEntityShape[],
  options: { activeCellId?: string; editable?: boolean } = {}
) =>
  render(
    <ComposerTestProvider shapes={toCanvasState(...shapes)} {...options}>
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

  it("deletes an existing instance permanently", async () => {
    const { shapes } = existingInstances();

    setup(shapes);
    await openMenu("entity-child-service");

    expect(
      screen.queryByText(words("instanceComposer.contextMenu.remove"))
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.contextMenu.delete")),
      })
    );

    expect(screen.queryByTestId("entity-child-service")).not.toBeInTheDocument();
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
