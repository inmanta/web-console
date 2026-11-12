import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
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
  ToggleGroup,
  ToggleGroupItem,
} from "@patternfly/react-core";
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
import exitFullscreenIcon from "./icons/exit-fullscreen.svg";
import fitToScreenIcon from "./icons/fit-to-screen.svg";
import requestFullscreenIcon from "./icons/request-fullscreen.svg";

/**
 * The toolbar under the canvas: arrange the layout, full screen, fit to screen, and zoom.
 */
export const ZoomControls: React.FC = () => {
  const { canvasState, canvasActions, activeCell } = useContext(ComposerContext);
  const { zoomTo, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isArrangeOpen, setIsArrangeOpen] = useState(false);
  const [direction, setDirection] = useState<LayoutDirection>("LR");
  // The positions before the last arrangement, to undo it
  const [previousPositions, setPreviousPositions] = useState<Map<string, Point> | null>(null);
  const sliderRef = useRef<HTMLInputElement>(null);

  const zoomPercentage = Math.round(zoom * 100);
  const sliderValue = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, zoomPercentage));

  useEffect(() => {
    if (!sliderRef.current) {
      return;
    }

    const progress = ((sliderValue - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

    sliderRef.current.style.setProperty(
      "--slider-background",
      `linear-gradient(to right,
                var(--pf-t--global--border--color--brand--default) 0%,
                var(--pf-t--global--border--color--brand--default) ${progress}%,
                var(--pf-t--global--border--color--nonstatus--gray--default) ${progress}%,
                var(--pf-t--global--border--color--nonstatus--gray--default) 100%)`
    );
  }, [sliderValue]);

  // Listen for fullscreen changes and update styling
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isFullscreen);

      // Update canvas wrapper styling
      const canvasWrapper = document.getElementById("canvas-wrapper");
      if (canvasWrapper) {
        canvasWrapper.classList.toggle("fullscreen", isFullscreen);
      }

      // Hide/show banners
      const banners = document.querySelectorAll(".pf-v6-c-banner");
      banners.forEach((el) => {
        (el as HTMLElement).style.display = isFullscreen ? "none" : "block";
      });

      // Hide/show page sidebar and header
      const pageSidebar = document.querySelector("#page-sidebar");
      const pageHeader = document.querySelector("#page-header");
      if (pageSidebar) {
        (pageSidebar as HTMLElement).style.display = isFullscreen ? "none" : "flex";
      }
      if (pageHeader) {
        (pageHeader as HTMLElement).style.display = isFullscreen ? "none" : "grid";
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
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
        Array.from(canvasState.values()).map((shape) => [shape.id, shape.position()])
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
    previousPositions?.forEach(({ x, y }, id) => canvasState.get(id)?.position(x, y));
    canvasActions.refresh();
    setPreviousPositions(null);
  };

  return (
    <ZoomControlsContainer>
      <Dropdown
        isOpen={isArrangeOpen}
        onOpenChange={setIsArrangeOpen}
        popperProps={{ direction: "up", position: "start" }}
        toggle={(toggleRef) => (
          <MenuToggle
            ref={toggleRef}
            className="arrange-toggle"
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
      <Button
        variant="control"
        onClick={handleFullscreenToggle}
        aria-label={
          isFullscreen
            ? words("instanceComposer.zoomHandler.fullscreen.exit")
            : words("instanceComposer.zoomHandler.fullscreen.toggle")
        }
        data-testid="fullscreen"
      >
        <img
          src={isFullscreen ? exitFullscreenIcon : requestFullscreenIcon}
          alt={
            isFullscreen
              ? words("instanceComposer.zoomHandler.fullscreen.exit")
              : words("instanceComposer.zoomHandler.fullscreen.toggle")
          }
          style={{ width: "16px", height: "16px" }}
        />
      </Button>
      <Button
        variant="control"
        onClick={handleFitToScreen}
        aria-label={words("instanceComposer.zoomHandler.zoomToFit")}
        data-testid="fit-to-screen"
      >
        <img
          src={fitToScreenIcon}
          alt={words("instanceComposer.zoomHandler.zoomToFit")}
          style={{ width: "16px", height: "16px" }}
        />
      </Button>
      <span className="toolbar-divider" aria-hidden />
      <Button
        variant="control"
        onClick={() => handleZoom(-0.1)}
        aria-label={words("instanceComposer.zoomHandler.zoomOut")}
        data-testid="zoom-out"
        isDisabled={zoom <= MIN_ZOOM}
      >
        <MinusIcon />
      </Button>
      <div className="zoom-slider-container">
        <input
          ref={sliderRef}
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step="1"
          value={sliderValue}
          onChange={(event) => zoomTo(parseFloat(event.target.value) / 100)}
          aria-label={words("instanceComposer.zoomHandler.zoom")}
          data-testid="slider-input"
        />
        <output data-testid="slider-output">{zoomPercentage}%</output>
      </div>
      <Button
        variant="control"
        onClick={() => handleZoom(0.1)}
        aria-label={words("instanceComposer.zoomHandler.zoomIn")}
        data-testid="zoom-in"
        isDisabled={zoom >= MAX_ZOOM}
      >
        <PlusIcon />
      </Button>
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
