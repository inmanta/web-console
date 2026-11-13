import React from "react";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@inmanta/web-console-core";
import { baseSetup } from "@inmanta/web-console-test-utils/Utils/base-setup";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { ComposerTestProvider } from "../Mock/ComposerTestProvider";
import { inventoryInstance, parentService } from "../Mock/serviceModels";
import { instanceShapes, newServiceShapes, toCanvasState } from "../Mock/shapes";
import { defineReactFlowTestObjects } from "../testSetup";
import { RightSidebar } from "./RightSidebar";

defineReactFlowTestObjects();

// The form's fields read the environment and the suggestions queries, so the sidebar
// renders with the test dependencies and query client.
const setup = (shapes: ServiceEntityShape[], options: { editable?: boolean } = {}) =>
  render(
    baseSetup(
      <ComposerTestProvider
        shapes={toCanvasState(...shapes)}
        activeCellId={shapes[0].id}
        {...options}
      >
        <RightSidebar />
      </ComposerTestProvider>
    ).component
  );

const candidateToggle = () =>
  screen.getByRole("button", { name: words("instanceComposer.sets.candidate") });
const activeToggle = () =>
  screen.getByRole("button", { name: words("instanceComposer.sets.active") });

/** An existing instance with a candidate and an active set, on the canvas. */
const bothSetsShapes = () =>
  instanceShapes(
    inventoryInstance(
      parentService,
      "parent-1",
      { name: "edge-1", region: "eu" },
      { candidate_attributes: { name: "edge-1", region: "eu-draft" } }
    ),
    parentService
  );

describe("RightSidebar", () => {
  it("offers both attribute sets, with the form only on the candidate set", async () => {
    setup(bothSetsShapes());

    // The editable set is the default, as a form
    expect(candidateToggle()).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("entity-form")).toBeInTheDocument();
    expect(screen.getByDisplayValue("eu-draft")).toBeInTheDocument();

    // The active set can only be viewed
    await userEvent.click(activeToggle());

    expect(screen.queryByTestId("entity-form")).not.toBeInTheDocument();
    expect(screen.getByText(words("instanceComposer.sets.readOnly"))).toBeVisible();

    const details = screen.getByTestId("entity-details");

    expect(within(details).getByText("eu")).toBeVisible();

    // And back
    await userEvent.click(candidateToggle());

    expect(screen.getByTestId("entity-form")).toBeInTheDocument();
  });

  it("offers no toggle when the instance has one set, or the entity is new", () => {
    const [instance] = instanceShapes(
      inventoryInstance(parentService, "parent-1", { name: "edge-1", region: "eu" }),
      parentService
    );

    const { unmount } = setup([instance]);

    expect(
      screen.queryByRole("button", { name: words("instanceComposer.sets.active") })
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("entity-form")).toBeInTheDocument();

    unmount();
    setup(newServiceShapes(parentService));

    expect(
      screen.queryByRole("button", { name: words("instanceComposer.sets.candidate") })
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("entity-form")).toBeInTheDocument();
  });

  it("offers both sets read-only in the viewer", async () => {
    setup(bothSetsShapes(), { editable: false });

    expect(screen.queryByTestId("entity-form")).not.toBeInTheDocument();
    expect(within(screen.getByTestId("entity-details")).getByText("eu-draft")).toBeVisible();

    await userEvent.click(activeToggle());

    expect(within(screen.getByTestId("entity-details")).getByText("eu")).toBeVisible();
    // The viewer edits nothing, so neither set says it is read-only
    expect(screen.queryByText(words("instanceComposer.sets.readOnly"))).not.toBeInTheDocument();
  });

  it("shows the lifecycle state of the selected instance", () => {
    const [instance] = instanceShapes(
      inventoryInstance(
        parentService,
        "parent-1",
        { name: "edge-1", region: "eu" },
        { state: "failed" }
      ),
      parentService
    );

    setup([instance]);

    expect(screen.getByText("failed")).toBeVisible();
  });
});
