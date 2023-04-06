import React, { useEffect, useRef } from "react";
import "core-js/stable";
import "regenerator-runtime/runtime";
import "@clientio/rappid/rappid.css";
import { ServiceInstanceModel, ServiceModel } from "@/Core";
import diagramInit from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";

const Canvas = ({
  service,
  instance,
}: {
  service: ServiceModel;
  instance?: ServiceInstanceModel;
}) => {
  const canvas = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const actions = diagramInit(canvas);
    if (instance) {
      actions.addInstance(instance, service.attributes);
    }
    return () => actions.removeCanvas();
  }, [instance, service.attributes]);

  return (
    <CanvasWrapper id="canvas-wrapper">
      <div className="canvas" ref={canvas} />
    </CanvasWrapper>
  );
};
export default Canvas;
