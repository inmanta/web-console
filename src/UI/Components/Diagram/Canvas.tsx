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
import { StencilSidebar } from "./stencil/stencil";
import { ZoomHandlerService } from "./zoomHandler";

/**
 * Properties for the Header component.
 *
 * @interface
 * @prop {boolean} editable - A flag indicating if the diagram is editable.
 */
interface Props {
  editable: boolean;
}

/**
 * Canvas component for creating, displaying and editing an Instance.
 *
 * @props {Props} props - The properties passed to the component.
 * @prop {boolean} props.editable - A flag indicating if the diagram is editable.
 *
 * @returns {JSX.Element} The rendered Canvas component.
 */
export const Canvas: React.FC<Props> = ({ editable }) => {
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
    if (!mainService || !serviceModels) {
      return;
    }

    const connectionRules = createConnectionRules(
      serviceModels.concat(mainService),
      {},
    );
    const actions = diagramInit(
      Canvas,
      (newScroller) => {
        setScroller(newScroller);
      },
      connectionRules,
      editable,
      mainService,
    );

    setDiagramHandlers(actions);

    return () => {
      actions.removeCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainService, serviceModels]);

  useEffect(() => {
    if (!diagramHandlers || !serviceModels || !mainService) {
      return;
    }
    const newInstances = new Map();

    if (instance) {
      const cells = diagramHandlers.addInstance(
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
      const cells = diagramHandlers.addInstance([
        ...serviceModels,
        mainService,
      ]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instance, serviceModels, mainService, diagramHandlers]);

  useEffect(() => {
    if (
      !LeftSidebar.current ||
      !scroller ||
      !relatedInventories.data ||
      !mainService
    ) {
      return;
    }

    const sidebar = new StencilSidebar(
      LeftSidebar.current,
      scroller,
      relatedInventories.data,
      mainService,
    );

    return () => sidebar.remove();
  }, [scroller, relatedInventories.data, mainService]);

  useEffect(() => {
    if (!ZoomHandler.current || !scroller) {
      return;
    }
    const navigator = new ZoomHandlerService(ZoomHandler.current, scroller);

    return () => navigator.remove();
  }, [scroller]);

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
        <CanvasContainer className="canvas" ref={Canvas} />
        <ZoomHandlerContainer className="zoom-handler" ref={ZoomHandler} />
      </CanvasWrapper>
    </EventWrapper>
  );
};

/**
 * Container for the zoom & fullscreen tools from JointJS
 */
const ZoomHandlerContainer = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  filter: drop-shadow(
    0.05rem 0.2rem 0.2rem
      var(--pf-v5-global--BackgroundColor--dark-transparent-200)
  );

  .joint-toolbar {
    padding: 0.5rem 2rem;
    border: 0;
  }

  button.joint-widget.joint-theme-default {
    border: 0;
    &:hover {
      background: transparent;
    }
  }

  .joint-widget.joint-theme-default {
    --slider-background: linear-gradient(
      to right,
      var(--pf-v5-global--active-color--100) 0%,
      var(--pf-v5-global--active-color--100) 20%,
      var(--pf-v5-global--palette--black-400) 20%,
      var(--pf-v5-global--palette--black-400) 100%
    );

    output {
      color: var(--pf-v5-global--palette--black-400);
    }

    .units {
      color: var(--pf-v5-global--palette--black-400);
    }

    /*********** Baseline, reset styles ***********/
    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      background: var(--slider-background);
      cursor: pointer;
      width: 8rem;
      margin-right: 0.5rem;
    }

    /* Removes default focus */
    input[type="range"]:focus {
      outline: none;
    }

    /******** Chrome, Safari, Opera and Edge Chromium styles ********/
    /* slider track */
    input[type="range"]::-webkit-slider-runnable-track {
      background: var(--slider-background);
      border-radius: 0.5rem;
      height: 0.15rem;
    }

    /* slider thumb */
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none; /* Override default look */
      appearance: none;
      margin-top: -3.6px; /* Centers thumb on the track */
      background-color: var(--pf-v5-global--active-color--100);
      border-radius: 0.5rem;
      height: 0.7rem;
      width: 0.7rem;
    }

    /*********** Firefox styles ***********/
    /* slider track */
    input[type="range"]::-moz-range-track {
      background-color: var(--slider-background);
      border-radius: 0.5rem;
      height: 0.15rem;
    }

    /* slider thumb */
    input[type="range"]::-moz-range-thumb {
      background-color: var(--pf-v5-global--active-color--100);
      border: none; /*Removes extra border that FF applies*/
      border-radius: 0.5rem;
      height: 0.7rem;
      width: 0.7rem;
    }

    input[type="range"]:focus::-moz-range-thumb {
      outline: 3px solid var(--pf-v5-global--active-color--100);
      outline-offset: 0.125rem;
    }
  }
`;

/**
 * Container for the JointJS canvas.
 */
const CanvasContainer = styled.div`
  width: calc(100% - 240px);
  height: 100%;
  background: var(--pf-v5-global--BackgroundColor--light-300);

  * {
    font-family: var(--pf-v5-global--FontFamily--monospace);
  }
  .joint-paper-background {
    background: var(--pf-v5-global--BackgroundColor--light-300);
  }

  .source-arrowhead,
  .target-arrowhead {
    fill: var(--pf-v5-global--palette--black-500);
    stroke-width: 1;
  }
`;

/**
 * To be able to have draggable items on the canvas, we need to have a stencil container to which we append the JointJS stencil objects that handle the drag and drop functionality.
 */
const StencilContainer = styled.div`
  width: 240px;
  height: 100%;
  background: var(--pf-v5-global--BackgroundColor--100);
  filter: drop-shadow(
    0.1rem 0.1rem 0.15rem
      var(--pf-v5-global--BackgroundColor--dark-transparent-200)
  );
`;
