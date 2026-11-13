import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { ComposerTestProvider } from "../Mock/ComposerTestProvider";
import { parentService } from "../Mock/serviceModels";
import { newServiceShapes, toCanvasState } from "../Mock/shapes";
import { defineReactFlowTestObjects } from "../testSetup";
import { Canvas } from "./Canvas";
import { ZoomControls } from "./ZoomControls";

defineReactFlowTestObjects();

const setup = (shapes: ServiceEntityShape[], activeCellId?: string) =>
  render(
    <ComposerTestProvider shapes={toCanvasState(...shapes)} activeCellId={activeCellId}>
      <Canvas />
      <ZoomControls />
    </ComposerTestProvider>
  );

const getZoom = () => parseInt(screen.getByTestId("slider-output").textContent ?? "", 10);

/** Where React Flow draws a shape's card */
const getCardPosition = (shape: ServiceEntityShape) =>
  (
    screen
      .getByTestId(`entity-${shape.getDisplayName()}`)
      .closest(".react-flow__node") as HTMLElement
  ).style.transform;

describe("ZoomControls", () => {
  it("zooms in and out with the buttons, and fits the view", async () => {
    setup(newServiceShapes(parentService));
    await screen.findByTestId("entity-parent-service");

    const initialZoom = getZoom();

    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.zoomHandler.zoomIn") })
    );
    await waitFor(() => expect(getZoom()).toBe(initialZoom + 10));

    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.zoomHandler.zoomOut") })
    );
    await waitFor(() => expect(getZoom()).toBe(initialZoom));

    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.zoomHandler.zoomIn") })
    );
    await waitFor(() => expect(getZoom()).toBe(initialZoom + 10));
    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.zoomHandler.zoomToFit") })
    );
    await waitFor(() => expect(getZoom()).not.toBe(initialZoom + 10));
  });

  it("zooms with the slider", async () => {
    setup(newServiceShapes(parentService));
    await screen.findByTestId("entity-parent-service");

    const initialZoom = getZoom();
    const slider = screen.getByRole("slider", {
      name: words("instanceComposer.zoomHandler.zoom"),
    });

    expect(slider).toHaveAttribute("aria-valuetext", `${initialZoom}%`);

    await userEvent.click(slider);
    await userEvent.keyboard("{ArrowRight}");

    await waitFor(() => expect(getZoom()).toBe(initialZoom + 1));
  });

  it("toggles full screen", async () => {
    setup([]);

    await userEvent.click(
      screen.getByRole("button", {
        name: words("instanceComposer.zoomHandler.fullscreen.toggle"),
      })
    );

    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it("names its icon buttons in PatternFly tooltips, not native titles", async () => {
    setup([]);

    await userEvent.hover(
      screen.getByRole("button", { name: words("instanceComposer.zoomHandler.zoomToFit") })
    );

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      words("instanceComposer.zoomHandler.zoomToFit")
    );
    expect(document.querySelector("[title]")).not.toBeInTheDocument();
  });

  it("arranges the canvas, and undoes it from the toast", async () => {
    const [parent, settings] = newServiceShapes(parentService);

    // Both cards in one spot, so arranging moves one of them
    settings.setPosition(0, 0);
    setup([parent, settings]);
    await screen.findByTestId("entity-settings");

    const before = getCardPosition(settings);

    await userEvent.click(screen.getByRole("button", { name: words("instanceComposer.arrange") }));

    expect(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.arrange.below")("…")),
      })
    ).toBeDisabled();

    await userEvent.click(
      screen.getByRole("menuitem", { name: new RegExp(words("instanceComposer.arrange.all")) })
    );

    expect(await screen.findByText(words("instanceComposer.arrange.done.title"))).toBeVisible();
    expect(getCardPosition(settings)).not.toBe(before);

    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.arrange.undo") })
    );

    expect(getCardPosition(settings)).toBe(before);
    expect(
      screen.queryByText(words("instanceComposer.arrange.done.title"))
    ).not.toBeInTheDocument();
  });

  it("arranges below the selected card, in the direction chosen", async () => {
    const [parent, settings] = newServiceShapes(parentService);

    settings.setPosition(0, 0);
    setup([parent, settings], parent.id);
    await screen.findByTestId("entity-settings");

    const before = getCardPosition(settings);

    await userEvent.click(screen.getByRole("button", { name: words("instanceComposer.arrange") }));
    await userEvent.click(
      screen.getByRole("button", { name: words("instanceComposer.arrange.topToBottom") })
    );

    expect(
      screen.getByRole("button", { name: words("instanceComposer.arrange.topToBottom") })
    ).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(
      screen.getByRole("menuitem", {
        name: new RegExp(words("instanceComposer.arrange.below")("parent-service")),
      })
    );

    expect(await screen.findByText(words("instanceComposer.arrange.done.title"))).toBeVisible();
    // Top to bottom: the embedded entity moves below its parent
    expect(getCardPosition(settings)).not.toBe(before);
    expect(getCardPosition(parent)).toBe("translate(0px,0px)");
  });
});
