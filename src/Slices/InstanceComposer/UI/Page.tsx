import React, { useEffect, useRef } from "react";
import { diagramInit } from "./diagram/init";
import { CanvasWrapper } from "./diagram/styles";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "@clientio/rappid/rappid.css";
export const Page = () => {
  const canvas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const removeCanvas = diagramInit(canvas);
    return () => removeCanvas();
  }, []);

  return (
    <CanvasWrapper id="canvas-wrapper">
      <div className="canvas" ref={canvas} />
    </CanvasWrapper>
  );
};
