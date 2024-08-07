import React, { useContext, useEffect, useRef, useState } from "react";
import "@inmanta/rappid/joint-plus.css";
import { ui } from "@inmanta/rappid";
import styled from "styled-components";
import { ServiceModel } from "@/Core";
import { sanitizeAttributes } from "@/Data";
import { diagramInit, DiagramHandlers } from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";
import { CanvasContext, InstanceComposerContext } from "./Context/Context";
import { EventWrapper } from "./Context/EventWrapper";
import DictModal from "./components/DictModal";
import FormModal from "./components/FormModal";
import Toolbar from "./components/Toolbar";
import { createConnectionRules } from "./helpers";
import { StencilSidebar } from "./stencil";

/**
 * Canvas component for creating, displaying and editing an Instance.
 *
 * @param {ServiceModel[]} services - The list of service models .
 * @param {ServiceModel} mainService - The main service model.
 * @param {InstanceWithRelations} instance - The instance with references.
 * @returns {JSX.Element} The rendered Canvas component.
 */
export const Canvas: React.FC<{
  editable: boolean;
}> = ({ editable }) => {
  const { mainService, instance, serviceModels, relatedInventories } =
    useContext(InstanceComposerContext);
  const { setInstancesToSend } = useContext(CanvasContext);
  const Canvas = useRef<HTMLDivElement>(null);
  const LeftSidebar = useRef<HTMLDivElement>(null);
  const ZoomHandler = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<ui.PaperScroller | null>(null);
  const [diagramHandlers, setDiagramHandlers] =
    useState<DiagramHandlers | null>(null);

  useEffect(() => {
    const connectionRules = createConnectionRules(
      serviceModels.concat(mainService),
      {},
    );
    const actions = diagramInit(
      Canvas,
      (newScroller) => {
        if (!scroller) {
          setScroller(newScroller);
        }
      },
      connectionRules,
      editable,
      mainService,
    );
    setDiagramHandlers(actions);
    const newInstances = new Map();

    if (instance) {
      const cells = actions.addInstance(
        [...serviceModels, mainService],
        instance,
      );

      cells.forEach((cell) => {
        if (cell.type === "app.ServiceEntityBlock") {
          newInstances.set(cell.id, {
            instance_id: cell.id,
            service_entity: cell.entityName,
            config: {},
            action: null,
            attributes: cell.instanceAttributes,
            embeddedTo: cell.embeddedTo,
            relatedTo: cell.relatedTo,
          });
        }
      });
    } else {
      const cells = actions.addInstance([...serviceModels, mainService]);
      cells.forEach((cell) => {
        if (cell.type === "app.ServiceEntityBlock") {
          newInstances.set(cell.id, {
            instance_id: cell.id,
            service_entity: cell.entityName,
            config: {},
            action: "create",
            attributes: cell.instanceAttributes,
            embeddedTo: cell.embeddedTo,
            relatedTo: cell.relatedTo,
          });
        }
      });
    }
    setInstancesToSend(newInstances);

    return () => {
      actions.removeCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, serviceModels, editable, mainService]);

  useEffect(() => {
    if (
      !LeftSidebar.current ||
      !scroller ||
      !relatedInventories.data ||
      !mainService
    ) {
      return;
    }

    new StencilSidebar(
      LeftSidebar.current,
      scroller,
      relatedInventories.data,
      mainService,
    );
  }, [scroller, relatedInventories.data, mainService]);
  return (
    <EventWrapper>
      <DictModal />
      <FormModal
        onConfirm={(fields, entity, selected, cellToEdit) => {
          if (diagramHandlers) {
            const sanitizedAttrs = sanitizeAttributes(fields, entity);
            if (cellToEdit) {
              //deep copy
              const shape = diagramHandlers.editEntity(
                cellToEdit,
                selected.model as ServiceModel,
                entity,
              );
              shape.set("sanitizedAttrs", sanitizedAttrs);
              //handleUpdate(shape, ActionEnum.UPDATE);
            }
          }
        }}
      />
      <Toolbar
        serviceName={mainService.name}
        editable={editable}
        diagramHandlers={diagramHandlers}
      />
      <CanvasWrapper id="canvas-wrapper" data-testid="Composer-Container">
        <StencilContainer className="stencil-sidebar" ref={LeftSidebar} />
        <div className="canvas" ref={Canvas} />
        <ZoomHandlerWrapper className="zoomHandler" ref={ZoomHandler} />
      </CanvasWrapper>
    </EventWrapper>
  );
};

/**
 * Wrapper and ref container for the zoom & fullscreen tools from JointJS
 */
const ZoomHandlerWrapper = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
`;

/**
 * To be able to have draggable items on the canvas, we need to have a stencil container to which we append the JointJS stencil objects that handle the drag and drop functionality.
 */
const StencilContainer = styled.div`
  position: absolute;
  left: 1px;
  top: 1px;
  width: 240px;
  height: calc(100% - 2px);
  z-index: 1;
  background: var(--pf-v5-global--BackgroundColor--100);
  filter: drop-shadow(
    0.1rem 0.1rem 0.15rem
      var(--pf-v5-global--BackgroundColor--dark-transparent-200)
  );
`;
