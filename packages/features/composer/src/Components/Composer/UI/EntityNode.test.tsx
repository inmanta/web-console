import React from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { ComposerTestProvider } from "../Mock/ComposerTestProvider";
import {
  childService,
  inventoryInstance,
  parentService,
  standaloneService,
} from "../Mock/serviceModels";
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

const missingAttributes = words("instanceComposer.tooltip.missingRequiredAttributes");

describe("EntityNode", () => {
  it("names a new service by its identity, with its kind, icon, attributes and problems", async () => {
    const [parent] = newServiceShapes(parentService);

    setup([parent]);

    const card = await screen.findByTestId("entity-parent-service");

    expect(within(card).getByTestId("header-parent-service")).toHaveTextContent(
      `${words("instanceComposer.label.core")} · parent-service`
    );
    expect(within(card).getByText(words("instanceComposer.card.unnamed"))).toHaveClass(
      "is-placeholder"
    );
    expect(card.querySelector(".kind-icon svg")).toBeInTheDocument();
    expect(card.closest(".react-flow__node > div")).toHaveStyle({
      "--entity-accent": "var(--pf-t--global--border--color--nonstatus--yellow--default)",
    });
    expect(within(card).getByText(words("instanceComposer.label.new"))).toBeVisible();
    expect(within(card).getByText("region")).toBeVisible();
    expect(within(card).getByText(words("instanceComposer.card.notSet"))).toBeVisible();
    expect(card).toHaveAttribute("data-invalid", "true");

    const problems = within(card).getByRole("button", {
      name: words("instanceComposer.card.issues")(1),
    });

    expect(problems).toHaveAccessibleDescription(missingAttributes);
    expect(
      within(card).queryByRole("img", { name: words("instanceComposer.card.readOnly") })
    ).not.toBeInTheDocument();
  });

  it("colours an embedded entity blue and a valid card has no problem count", async () => {
    const [parent, settings] = newServiceShapes(parentService);

    parent.updateAttributes({ name: "edge-1", region: "eu" });
    settings.updateAttributes({ vlan: "100" });
    setup([parent, settings]);

    const card = await screen.findByTestId("entity-parent-service");

    expect(within(card).getByText("edge-1")).toBeVisible();
    expect(within(card).getByText("eu")).toBeVisible();
    expect(card).toHaveAttribute("data-invalid", "false");
    expect(within(card).queryByRole("button")).not.toBeInTheDocument();

    const settingsCard = screen.getByTestId("entity-settings");

    expect(settingsCard.closest(".react-flow__node > div")).toHaveStyle({
      "--entity-accent": "var(--pf-t--global--border--color--nonstatus--blue--default)",
    });
    expect(within(settingsCard).getByTestId("header-settings")).toHaveTextContent(
      `${words("instanceComposer.label.embedded")} · settings`
    );
  });

  it("lists the problems in a tooltip while the card is pointed at", async () => {
    const [parent] = newServiceShapes(parentService);

    setup([parent]);

    await userEvent.hover(await screen.findByTestId("entity-parent-service"));

    expect(await screen.findByRole("tooltip")).toHaveTextContent(missingAttributes);
  });

  it("lists the problems when the count is focused, and hides them on Escape", async () => {
    const [parent] = newServiceShapes(parentService);

    setup([parent]);

    const problems = await screen.findByRole("button", {
      name: words("instanceComposer.card.issues")(1),
    });

    act(() => problems.focus());

    expect(await screen.findByRole("tooltip")).toHaveTextContent(missingAttributes);

    await userEvent.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("offers the link action on the selected card only when its model can be linked", async () => {
    const [child] = newServiceShapes(childService);
    const [standalone] = newServiceShapes(standaloneService, { x: 400, y: 0 });

    const { unmount } = setup([child, standalone], { activeCellId: child.id });

    const toolbar = await screen.findByRole("toolbar", {
      name: words("instanceComposer.halo.actions")("child-service"),
    });

    expect(within(toolbar).getByLabelText(words("instanceComposer.halo.link"))).toBeInTheDocument();
    unmount();

    setup([child, standalone], { activeCellId: standalone.id });

    await screen.findByTestId("entity-standalone-service");
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });

  it("shows its link action in a PatternFly tooltip, not a native title", async () => {
    const [child] = newServiceShapes(childService);

    setup([child], { activeCellId: child.id });

    const link = await screen.findByLabelText(words("instanceComposer.halo.link"));

    await userEvent.hover(link);

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      words("instanceComposer.halo.link")
    );
    expect(document.querySelector("[title]")).not.toBeInTheDocument();
  });

  it("collapses the layers below the selected card into a stack", async () => {
    const [parent, settings] = newServiceShapes(parentService);

    setup([parent, settings], { activeCellId: parent.id });

    const card = await screen.findByTestId("entity-parent-service");

    expect(screen.getByTestId("entity-settings")).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.halo.collapseLayers") })
    );

    expect(within(card).getByText(words("instanceComposer.hiddenLayers")(1))).toBeVisible();
    expect(screen.queryByTestId("entity-settings")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.halo.expandLayers") })
    );

    expect(
      within(card).queryByText(words("instanceComposer.hiddenLayers")(1))
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("entity-settings")).toBeVisible();
  });

  it("marks an existing instance read-only, and keeps its link action", async () => {
    const [parent] = instanceShapes(
      inventoryInstance(parentService, "parent-1", { name: "edge-1", region: "eu" }),
      parentService
    );

    setup([parent], { activeCellId: parent.id });

    const card = await screen.findByTestId("entity-parent-service");

    expect(
      within(card).getByRole("img", { name: words("instanceComposer.card.readOnly") })
    ).toBeVisible();
    expect(within(card).queryByText(words("instanceComposer.label.new"))).not.toBeInTheDocument();
    expect(screen.getByLabelText(words("instanceComposer.halo.link"))).toBeInTheDocument();
    expect(card.closest(".react-flow__node > div")).toHaveStyle({
      "--entity-accent": "var(--pf-t--global--border--color--nonstatus--purple--default)",
    });
  });

  it("shows the lifecycle state of an existing instance, and none on a new card", async () => {
    const [parent] = instanceShapes(
      inventoryInstance(
        parentService,
        "parent-1",
        { name: "edge-1", region: "eu" },
        { state: "failed" }
      ),
      parentService
    );
    const [child] = newServiceShapes(childService);

    setup([parent, child]);

    const card = await screen.findByTestId("entity-parent-service");
    const state = within(card).getByTestId("entity-state-parent-service");

    expect(within(state).getByText("failed")).toBeVisible();
    // The lifecycle gives the state its status colour
    expect(state.querySelector(".pf-m-danger")).toBeInTheDocument();

    const newCard = screen.getByTestId("entity-child-service");

    expect(within(newCard).queryByTestId("entity-state-child-service")).not.toBeInTheDocument();
  });

  it("has no link action in the viewer", async () => {
    const [child] = newServiceShapes(childService);

    setup([child], { activeCellId: child.id, editable: false });

    await screen.findByTestId("entity-child-service");
    expect(screen.queryByLabelText(words("instanceComposer.halo.link"))).not.toBeInTheDocument();
  });

  it("shows text the card cuts short in a tooltip, and only then", async () => {
    const [parent] = newServiceShapes(parentService);

    parent.updateAttributes({ name: "a-name-too-long-for-the-card", region: "eu" });
    setup([parent]);

    const card = await screen.findByTestId("entity-parent-service");
    const region = within(card).getByText("eu");

    await userEvent.hover(region);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await userEvent.unhover(region);

    const title = within(card).getByText("a-name-too-long-for-the-card");

    Object.defineProperty(title, "scrollWidth", { configurable: true, value: 400 });
    await userEvent.hover(title);

    expect(await screen.findByRole("tooltip")).toHaveTextContent("a-name-too-long-for-the-card");
    expect(card.querySelector("[title]")).not.toBeInTheDocument();
  });
});
