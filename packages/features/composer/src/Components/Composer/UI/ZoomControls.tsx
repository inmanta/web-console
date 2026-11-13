import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  AlertGroup,
  Button,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  Slider,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from "@patternfly/react-core";
import { CompressIcon } from "@patternfly/react-icons/dist/esm/icons/compress-icon";
import { ExpandArrowsAltIcon } from "@patternfly/react-icons/dist/esm/icons/expand-arrows-alt-icon";
import { ExpandIcon } from "@patternfly/react-icons/dist/esm/icons/expand-icon";
import { MinusIcon } from "@patternfly/react-icons/dist/esm/icons/minus-icon";
import { PlusIcon } from "@patternfly/react-icons/dist/esm/icons/plus-icon";
import { SitemapIcon } from "@patternfly/react-icons/dist/esm/icons/sitemap-icon";
import { useReactFlow, useViewport } from "@xyflow/react";
import { words } from "@inmanta/web-console-core";
import { ComposerContext } from "../Data/Context";
import { applyLayeredLayout, LayoutDirection } from "../Data/Helpers";
import { Point } from "../Data/ServiceEntityShape";
import { MIN_ZOOM, MAX_ZOOM, SLIDER_MIN, SLIDER_MAX, ZOOM_TO_FIT_PADDING_BUTTON } from "../config";
import { ZoomControlsContainer } from "./ZoomControls.styles";

/**
 * The toolbar under the canvas: arrange the layout, full screen, fit to screen, and zoom.
 */
export const ZoomControls: React.FC = () => {
  const { canvasState, canvasActions, activeCell } = useContext(ComposerContext);
  const { zoomTo, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [isArrangeOpen, setIsArrangeOpen] = useState(false);
  const [direction, setDirection] = useState<LayoutDirection>("LR");
  // The positions before the last arrangement, to undo it
  const [previousPositions, setPreviousPositions] = useState<Map<string, Point> | null>(null);

  const zoomPercentage = Math.round(zoom * 100);
  const sliderValue = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, zoomPercentage));

  // While the document is full screen, the composer's frame covers the page (ComposerContainer).
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleFitToScreen = () => {
    fitView({
      padding: { x: `${ZOOM_TO_FIT_PADDING_BUTTON}px`, y: "40px" },
      maxZoom: 1,
      duration: 200,
    });
  };

  const handleZoom = (increment: number) => {
    zoomTo(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + increment)), { duration: 100 });
  };

  const arrange = useCallback(
    (rootId?: string) => {
      const positions = new Map(
        Array.from(canvasState.values()).map((shape) => [shape.id, shape.getPosition()])
      );

      applyLayeredLayout(canvasState, direction, rootId);
      canvasActions.refresh();
      setPreviousPositions(positions);
      setIsArrangeOpen(false);

      if (!rootId) {
        // Let the cards move before fitting the view around them
        requestAnimationFrame(() => fitView({ padding: 0.2, maxZoom: 1, duration: 300 }));
      }
    },
    [canvasState, canvasActions, direction, fitView]
  );

  const undoArrange = () => {
    previousPositions?.forEach(({ x, y }, id) => canvasState.get(id)?.setPosition(x, y));
    canvasActions.refresh();
    setPreviousPositions(null);
  };

  const fullscreenLabel = isFullscreen
    ? words("instanceComposer.zoomHandler.fullscreen.exit")
    : words("instanceComposer.zoomHandler.fullscreen.toggle");

  return (
    <ZoomControlsContainer>
      <Dropdown
        isOpen={isArrangeOpen}
        onOpenChange={setIsArrangeOpen}
        popperProps={{ direction: "up", position: "start" }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            className="toolbar-control"
            variant="plainText"
            icon={<SitemapIcon />}
            isExpanded={isArrangeOpen}
            onClick={() => setIsArrangeOpen(!isArrangeOpen)}
            data-testid="arrange-toggle"
          >
            {words("instanceComposer.arrange")}
          </MenuToggle>
        )}
      >
        <DropdownList>
          <DropdownItem
            description={words("instanceComposer.arrange.all.description")}
            onClick={() => arrange()}
          >
            {words("instanceComposer.arrange.all")}
          </DropdownItem>
          <DropdownItem
            isDisabled={!activeCell}
            description={
              activeCell
                ? words("instanceComposer.arrange.below.description")
                : words("instanceComposer.arrange.below.disabled")
            }
            onClick={() => activeCell && arrange(activeCell.id)}
          >
            {words("instanceComposer.arrange.below")(
              activeCell ? activeCell.getDisplayName() : "…"
            )}
          </DropdownItem>
        </DropdownList>
        <DropdownGroup label={words("instanceComposer.arrange.direction")} labelHeadingLevel="h3">
          <ToggleGroup
            isCompact
            aria-label={words("instanceComposer.arrange.direction")}
            style={{ padding: "0 var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--sm)" }}
          >
            <ToggleGroupItem
              text={words("instanceComposer.arrange.leftToRight")}
              isSelected={direction === "LR"}
              onChange={() => setDirection("LR")}
            />
            <ToggleGroupItem
              text={words("instanceComposer.arrange.topToBottom")}
              isSelected={direction === "TB"}
              onChange={() => setDirection("TB")}
            />
          </ToggleGroup>
        </DropdownGroup>
      </Dropdown>
      <span className="toolbar-divider" aria-hidden />
      <Tooltip content={fullscreenLabel} aria="none">
        <Button
          className="toolbar-control"
          variant="control"
          icon={isFullscreen ? <CompressIcon /> : <ExpandIcon />}
          onClick={handleFullscreenToggle}
          aria-label={fullscreenLabel}
          data-testid="fullscreen"
        />
      </Tooltip>
      <Tooltip content={words("instanceComposer.zoomHandler.zoomToFit")} aria="none">
        <Button
          className="toolbar-control"
          variant="control"
          icon={<ExpandArrowsAltIcon />}
          onClick={handleFitToScreen}
          aria-label={words("instanceComposer.zoomHandler.zoomToFit")}
          data-testid="fit-to-screen"
        />
      </Tooltip>
      <span className="toolbar-divider" aria-hidden />
      <Tooltip content={words("instanceComposer.zoomHandler.zoomOut")} aria="none">
        <Button
          className="toolbar-control"
          variant="control"
          icon={<MinusIcon />}
          onClick={() => handleZoom(-0.1)}
          aria-label={words("instanceComposer.zoomHandler.zoomOut")}
          data-testid="zoom-out"
          isDisabled={zoom <= MIN_ZOOM}
        />
      </Tooltip>
      <Slider
        className="zoom-slider"
        min={SLIDER_MIN}
        max={SLIDER_MAX}
        value={sliderValue}
        showBoundaries={false}
        thumbAriaLabel={words("instanceComposer.zoomHandler.zoom")}
        thumbAriaValueText={`${zoomPercentage}%`}
        onChange={(_event, value) => zoomTo(value / 100)}
        data-testid="slider-input"
      />
      <output className="zoom-percentage" data-testid="slider-output">
        {zoomPercentage}%
      </output>
      <Tooltip content={words("instanceComposer.zoomHandler.zoomIn")} aria="none">
        <Button
          className="toolbar-control"
          variant="control"
          icon={<PlusIcon />}
          onClick={() => handleZoom(0.1)}
          aria-label={words("instanceComposer.zoomHandler.zoomIn")}
          data-testid="zoom-in"
          isDisabled={zoom >= MAX_ZOOM}
        />
      </Tooltip>
      {previousPositions && (
        <AlertGroup isToast isLiveRegion>
          <Alert
            variant="success"
            title={words("instanceComposer.arrange.done.title")}
            timeout={8000}
            onTimeout={() => setPreviousPositions(null)}
            actionClose={<AlertActionCloseButton onClose={() => setPreviousPositions(null)} />}
            actionLinks={
              <AlertActionLink onClick={undoArrange}>
                {words("instanceComposer.arrange.undo")}
              </AlertActionLink>
            }
          >
            {words("instanceComposer.arrange.done.body")}
          </Alert>
        </AlertGroup>
      )}
    </ZoomControlsContainer>
  );
};
