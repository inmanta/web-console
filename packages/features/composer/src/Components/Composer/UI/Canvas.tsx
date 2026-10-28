import React, { useContext, useEffect, useRef } from "react";
import { ui } from "@joint/plus";
import styled from "styled-components";
import { ComposerContext } from "../Data/Context";
import { LEFT_SIDEBAR_WIDTH, RIGHT_SIDEBAR_WIDTH } from "../config";

/**
 * Main JointJS canvas host.
 * Mounts the paper scroller element and sets up tooltips for shapes with `data-tooltip`.
 */
export const Canvas: React.FC = () => {
  const { scroller, editable } = useContext(ComposerContext);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<ui.Tooltip | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !scroller) {
      return;
    }

    canvasRef.current.appendChild(scroller.el);
    scroller.render();

    // Initialize tooltip system for elements with data-tooltip attribute
    if (!tooltipRef.current) {
      tooltipRef.current = new ui.Tooltip({
        rootTarget: ".canvas",
        target: "[data-tooltip]",
        padding: 20,
      });
    }

    return () => {
      // Cleanup tooltip on unmount
      if (tooltipRef.current) {
        tooltipRef.current.remove();
        tooltipRef.current = null;
      }
    };
  }, [scroller]);

  return (
    <CanvasContainer
      className={`canvas ${!editable && "view_mode"}`}
      data-testid="canvas"
      ref={canvasRef}
    />
  );
};

const CanvasContainer = styled.div`
  // Leave room for both flanking sidebars so the canvas never runs under them.
  width: calc(100% - ${LEFT_SIDEBAR_WIDTH + RIGHT_SIDEBAR_WIDTH}px);
  height: 100%;
  background: var(--pf-t--global--background--color--primary--default);

  // The left sidebar is hidden in view mode, so only reserve the right sidebar.
  &.view_mode {
    width: calc(100% - ${RIGHT_SIDEBAR_WIDTH}px);
  }

  * {
    font-family: var(--pf-t--global--font--family--mono);
  }

  .source-arrowhead,
  .target-arrowhead {
    fill: var(--pf-t--global--text--color--regular);
    stroke-width: 1;
  }
`;
