import React, { useContext, useEffect, useRef } from "react";
import { ui } from "@inmanta/rappid";
import styled from "styled-components";
import { ComposerContext } from "../Data/Context";

export const Canvas: React.FC = () => {
  const { scroller, editable } = useContext(ComposerContext);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<ui.Tooltip | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !scroller) {
      return;
    }

    canvasRef.current.appendChild(scroller.el);
    scroller.render().center();

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
  width: calc(100% - 540px); // 240px left sidebar + 300px right sidebar
  height: 100%;
  background: var(--pf-t--global--background--color--primary--default);

  &.view_mode {
    width: calc(100% - 300px);
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
