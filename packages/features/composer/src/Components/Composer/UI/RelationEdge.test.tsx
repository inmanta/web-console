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

const removeLabel = words("instanceComposer.link.remove")(
  "parent-service",
  "optional-child-service"
);

/** The relation line between the parent and the child, focused like tabbing to it. */
const focusEdge = async (parent: ServiceEntityShape, child: ServiceEntityShape) => {
  const edge = (await screen.findAllByRole("group")).find(
    (element) =>
      element.getAttribute("data-id")?.includes(parent.id) &&
      element.getAttribute("data-id")?.includes(child.id)
  ) as HTMLElement;

  act(() => edge.focus());

  return edge;
};

describe("RelationEdge", () => {
  it("removes an optional relation with the keyboard: select the line, then Delete", async () => {
    const { parent, child, shapes } = linkedShapes(optionalChildService);

    setup(shapes);
    await focusEdge(parent, child);
    await userEvent.keyboard("{Enter}");

    expect(await screen.findByRole("button", { name: removeLabel })).toBeVisible();

    await userEvent.keyboard("{Delete}");

    expect(child.connections.get("parent-service")).toBeUndefined();
    expect(screen.queryByRole("button", { name: removeLabel })).not.toBeInTheDocument();
  });

  it("removes an optional relation with its button once the line is selected", async () => {
    const { parent, child, shapes } = linkedShapes(optionalChildService);

    setup(shapes);
    await focusEdge(parent, child);
    await userEvent.keyboard("{Enter}");
    await userEvent.click(await screen.findByRole("button", { name: removeLabel }));

    expect(child.connections.get("parent-service")).toBeUndefined();
  });

  it("keeps a required relation: no remove button, and Delete does nothing", async () => {
    const { parent, child, shapes } = linkedShapes(childService);

    setup(shapes);
    await focusEdge(parent, child);
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Delete}");

    expect(child.connections.get("parent-service")).toEqual([parent.id]);
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });
});
