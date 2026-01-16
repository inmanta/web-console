import React, { useContext, useEffect, useRef, useState } from "react";
import { Button } from "@patternfly/react-core";
import { PlusIcon, MinusIcon } from "@patternfly/react-icons";
import { ComposerContext } from "../Data/Context";
import { ZoomControlsContainer } from "./ZoomControls.styles";
import { words } from "@/UI/words";
import fitToScreenIcon from "@/UI/Components/ComposerCanvas/icons/fit-to-screen.svg";
import requestFullscreenIcon from "@/UI/Components/ComposerCanvas/icons/request-fullscreen.svg";
import exitFullscreenIcon from "@/UI/Components/ComposerCanvas/icons/exit-fullscreen.svg";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const SLIDER_MIN = MIN_ZOOM * 100;
const SLIDER_MAX = MAX_ZOOM * 100;

export const ZoomControls: React.FC = () => {
    const { scroller, paper } = useContext(ComposerContext);
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const sliderRef = useRef<HTMLInputElement>(null);
    const isManualZoomRef = useRef(false);

    const updateSliderBackground = (zoomValue: number) => {
        if (!sliderRef.current) {
            return;
        }

        const zoomPercentage = Math.round(zoomValue * 100);
        const clampedZoom = Math.max(SLIDER_MIN, Math.min(SLIDER_MAX, zoomPercentage));
        const progress = ((clampedZoom - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

        sliderRef.current.style.setProperty(
            "--slider-background",
            `linear-gradient(to right, 
                var(--pf-t--global--border--color--brand--default) 0%, 
                var(--pf-t--global--border--color--brand--default) ${progress}%, 
                var(--pf-t--global--border--color--nonstatus--gray--default) ${progress}%, 
                var(--pf-t--global--border--color--nonstatus--gray--default) 100%)`
        );
    };

    const updateZoomState = (zoomValue: number) => {
        setZoom(zoomValue);
        updateSliderBackground(zoomValue);
    };

    // Update zoom state when scroller zoom changes
    useEffect(() => {
        if (!scroller) {
            return;
        }

        const updateZoom = () => {
            // Skip update if we're manually setting zoom to avoid race conditions
            if (isManualZoomRef.current) {
                return;
            }

            const currentZoom = scroller.zoom();
            updateZoomState(currentZoom);
        };

        // Initial zoom
        const currentZoom = scroller.zoom();
        updateZoomState(currentZoom);

        // Listen for zoom changes
        scroller.on("zoom", updateZoom);

        return () => {
            scroller.off("zoom", updateZoom);
        };
    }, [scroller]);

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

    const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>) => {
        if (!scroller || !paper) {
            return;
        }

        const sliderValue = parseFloat((event.target as HTMLInputElement).value);
        // Convert slider value (20-500) to zoom multiplier (0.2-5.0)
        const targetZoom = sliderValue / 100;

        // Clamp zoom to valid range
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));

        // Set flag to prevent event listener from updating state
        isManualZoomRef.current = true;

        // Get current zoom and viewport center
        const currentZoom = scroller.zoom();
        const scrollerRect = scroller.el.getBoundingClientRect();
        const viewportCenterX = scrollerRect.width / 2;
        const viewportCenterY = scrollerRect.height / 2;

        // Get the model point at the viewport center (before zoom)
        // Use the scroller's coordinate system
        const modelPoint = scroller.clientToLocalPoint(
            scrollerRect.left + viewportCenterX,
            scrollerRect.top + viewportCenterY
        );

        // Get current scroll position
        const currentScrollLeft = scroller.el.scrollLeft;
        const currentScrollTop = scroller.el.scrollTop;

        // Apply new zoom
        paper.scale(clampedZoom, clampedZoom);

        // After zoom, the model point will appear at a different screen position
        // We need to adjust the scroll to keep it at the viewport center
        // The scroll adjustment is: modelPoint * (oldZoom - newZoom)
        const scrollDeltaX = modelPoint.x * (currentZoom - clampedZoom);
        const scrollDeltaY = modelPoint.y * (currentZoom - clampedZoom);

        // Apply scroll adjustment immediately after zoom
        // Use requestAnimationFrame to ensure smooth update
        requestAnimationFrame(() => {
            scroller.el.scrollLeft = currentScrollLeft + scrollDeltaX;
            scroller.el.scrollTop = currentScrollTop + scrollDeltaY;
        });

        // Update state
        updateZoomState(clampedZoom);

        // Reset flag
        setTimeout(() => {
            isManualZoomRef.current = false;
        }, 50);
    };

    const handleFitToScreen = () => {
        if (!scroller) {
            return;
        }

        // Set flag to prevent event listener from interfering
        isManualZoomRef.current = true;

        scroller.zoomToFit({ useModelGeometry: true, padding: 20 });

        // Update zoom state after zoomToFit completes
        setTimeout(() => {
            const newZoom = scroller.zoom();
            updateZoomState(newZoom);
            isManualZoomRef.current = false;
        }, 100);
    };

    const handleFullscreenToggle = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    const handleZoomIncrement = (increment: number) => {
        if (!scroller || !paper) {
            return;
        }

        const currentZoom = scroller.zoom();
        const targetZoom = currentZoom + increment;
        const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));

        // If already at limit, don't do anything
        if (clampedZoom === currentZoom) {
            return;
        }

        // Set flag to prevent event listener from updating state
        isManualZoomRef.current = true;

        // Get viewport center
        const scrollerRect = scroller.el.getBoundingClientRect();
        const viewportCenterX = scrollerRect.width / 2;
        const viewportCenterY = scrollerRect.height / 2;

        // Get the model point at the viewport center (before zoom)
        const modelPoint = scroller.clientToLocalPoint(
            scrollerRect.left + viewportCenterX,
            scrollerRect.top + viewportCenterY
        );

        // Get current scroll position
        const currentScrollLeft = scroller.el.scrollLeft;
        const currentScrollTop = scroller.el.scrollTop;

        // Apply new zoom
        paper.scale(clampedZoom, clampedZoom);

        // Adjust scroll to keep viewport center in place
        const scrollDeltaX = modelPoint.x * (currentZoom - clampedZoom);
        const scrollDeltaY = modelPoint.y * (currentZoom - clampedZoom);

        requestAnimationFrame(() => {
            scroller.el.scrollLeft = currentScrollLeft + scrollDeltaX;
            scroller.el.scrollTop = currentScrollTop + scrollDeltaY;
        });

        // Update state
        updateZoomState(clampedZoom);

        // Reset flag
        setTimeout(() => {
            isManualZoomRef.current = false;
        }, 50);
    };

    const zoomPercentage = Math.round(zoom * 100);
    const sliderValue = Math.max(MIN_ZOOM * 100, Math.min(MAX_ZOOM * 100, zoomPercentage));

    return (
        <ZoomControlsContainer>
            <Button
                variant="control"
                onClick={handleFullscreenToggle}
                aria-label={isFullscreen ? words("instanceComposer.zoomHandler.fullscreen.exit") : words("instanceComposer.zoomHandler.fullscreen.toggle")}
                data-testid="fullscreen"
            >
                <img
                    src={isFullscreen ? exitFullscreenIcon : requestFullscreenIcon}
                    alt={isFullscreen ? words("instanceComposer.zoomHandler.fullscreen.exit") : words("instanceComposer.zoomHandler.fullscreen.toggle")}
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
            <Button
                variant="control"
                onClick={() => handleZoomIncrement(-0.1)}
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
                    onChange={handleZoomChange}
                    onInput={handleZoomChange}
                    aria-label={words("instanceComposer.zoomHandler.zoom")}
                    data-testid="slider-input"
                />
                <output data-testid="slider-output">{zoomPercentage}%</output>
            </div>
            <Button
                variant="control"
                onClick={() => handleZoomIncrement(0.1)}
                aria-label={words("instanceComposer.zoomHandler.zoomIn")}
                data-testid="zoom-in"
                isDisabled={zoom >= MAX_ZOOM}
            >
                <PlusIcon />
            </Button>
        </ZoomControlsContainer>
    );
};

