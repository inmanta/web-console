import React from "react";
import { act, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { ComposerTestProvider } from "../Mock/ComposerTestProvider";
import { childService, optionalChildService, parentService } from "../Mock/serviceModels";
import { newServiceShapes, toCanvasState } from "../Mock/shapes";
import { defineReactFlowTestObjects } from "../testSetup";
import { Canvas } from "./Canvas";

defineReactFlowTestObjects();

/** A new parent and a new child of the given service, linked. */
const linkedShapes = (child: typeof childService) => {
  const [parent, ...embedded] = newServiceShapes(parentService);
  const [childShape] = newServiceShapes(child, { x: 400, y: 0 });

  childShape.addConnection(parent.id, "parent-service");
  parent.addConnection(childShape.id, child.name);

  return { parent, child: childShape, shapes: [parent, ...embedded, childShape] };
};

const setup = (shapes: ServiceEntityShape[]) =>
  render(
    <ComposerTestProvider shapes={toCanvasState(...shapes)}>
      <Canvas />
    </ComposerTestProvider>
  );

const canvas = () => screen.getByRole("region", { name: words("instanceComposer.canvas") });

/** The relation line between the parent and a child, focused like tabbing to it, then selected. */
const selectLine = async (child: string) => {
  const line = await screen.findByRole("group", {
    name: words("instanceComposer.link.label")("parent-service", child),
  });

  act(() => line.focus());
  await userEvent.keyboard("{Enter}");

  expect(line).toHaveClass("selected");

  return line;
};

const removeButton = () =>
  screen.queryByRole("button", {
    name: words("instanceComposer.link.remove")("parent-service", "optional-child-service"),
  });

describe("RelationEdge", () => {
  it("removes an optional relation with the keyboard: select the line, then Delete", async () => {
    const { child, shapes } = linkedShapes(optionalChildService);

    setup(shapes);
    await selectLine("optional-child-service");

    expect(removeButton()).toBeVisible();

    await userEvent.keyboard("{Delete}");

    expect(child.connections.get("parent-service")).toBeUndefined();
    expect(removeButton()).not.toBeInTheDocument();
    // The line went away with the focus, so the focus goes back to the canvas
    expect(canvas()).toHaveFocus();
  });

  it("removes an optional relation with its button once the line is selected", async () => {
    const { child, shapes } = linkedShapes(optionalChildService);

    setup(shapes);
    await selectLine("optional-child-service");
    await userEvent.click(removeButton()!);

    expect(child.connections.get("parent-service")).toBeUndefined();
    expect(canvas()).toHaveFocus();
  });

  it("keeps a required relation, and says why Delete didn't remove it", async () => {
    const { parent, child, shapes } = linkedShapes(childService);

    setup(shapes);
    await selectLine("child-service");

    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();

    await userEvent.keyboard("{Delete}");

    expect(child.connections.get("parent-service")).toEqual([parent.id]);
    expect(screen.getByRole("status")).toHaveTextContent(
      words("instanceComposer.link.cannotRemove")("parent-service", "child-service")
    );
  });
});
