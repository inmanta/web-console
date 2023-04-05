import React, { useEffect, useRef } from "react";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "@clientio/rappid/rappid.css";
import { ServiceModel } from "@/Core";
import diagramInit from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";

/* eslint-disable @typescript-eslint/no-unused-vars */
const Canvas = ({ service }: { service: ServiceModel }) => {
  const canvas = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const actions = diagramInit(canvas);
    return () => actions.removeCanvas();
  }, []);

  return (
    <CanvasWrapper id="canvas-wrapper">
      <div className="canvas" ref={canvas} />
    </CanvasWrapper>
  );
};
export default Canvas;
