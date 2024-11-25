import React, { useContext, useEffect, useRef, useState } from "react";
import "@inmanta/rappid/joint-plus.css";
import { ui } from "@inmanta/rappid";
import styled from "styled-components";
import { CanvasContext, InstanceComposerContext } from "./Context";
import { EventWrapper } from "./Context/EventWrapper";
import { DictModal, RightSidebar } from "./components";
import { Validation } from "./components/Validation";
import { createConnectionRules, createStencilState } from "./helpers";
import { diagramInit } from "./init";
import { StencilSidebar } from "./stencil";
import { CanvasWrapper } from "./styles";
import { ZoomHandlerService } from "./zoomHandler";

/**
 * Properties for the Canvas component.
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
 * @prop {boolean} editable - A flag indicating if the diagram is editable.
 *
 * @returns {React.FC<Props>} The rendered Canvas component.
 */
export const Canvas: React.FC<Props> = ({ editable }) => {
  const { mainService, instance, serviceModels, relatedInventoriesQuery } =
    useContext(InstanceComposerContext);
  const {
    setStencilState,
    setServiceOrderItems,
    diagramHandlers,
    setDiagramHandlers,
    setCellToEdit,
  } = useContext(CanvasContext);
  const Canvas = useRef<HTMLDivElement>(null);
  const LeftSidebar = useRef<HTMLDivElement>(null);
  const ZoomHandler = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<ui.PaperScroller | null>(null);
  const [isStencilStateReady, setIsStencilStateReady] = useState(false);
  const [leftSidebar, setLeftSidebar] = useState<StencilSidebar | null>(null); // without this state it could happen that cells would load before sidebar is ready so its state could be outdated

  // create stencil state and set flag to true to enable the other components to be created - the flag is created to allow the components to depend from that states, passing the state as a dependency would cause an infinite loop
  useEffect(() => {
    setStencilState(createStencilState(mainService, !!instance));
    setIsStencilStateReady(true);
  }, [mainService, instance, setStencilState]);

  // create the diagram & set diagram handlers and the scroller only when service models and main service is defined and the stencil state is ready
  useEffect(() => {
    //if diagram handlers are already set or the stencil state is not ready, return early to avoid re-creating the diagram or to creating it too early
    if (!isStencilStateReady || diagramHandlers) {
      return;
    }
    let tempScroller;

    const connectionRules = createConnectionRules(serviceModels, {});
    const actions = diagramInit(
      Canvas,
      (newScroller) => {
        tempScroller = newScroller;
      },
      connectionRules,
      editable,
      mainService,
    );

    setScroller(tempScroller);
    setDiagramHandlers(actions);

    return () => {
      setStencilState(createStencilState(mainService));
      setIsStencilStateReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainService, serviceModels, isStencilStateReady]);

  /**
   * create the stencil sidebar and zoom handler only when the scroller, related inventories and main service are defined and the ref for sidebar and zoomHandler is there
   */
  useEffect(() => {
    if (
      !LeftSidebar.current ||
      !ZoomHandler.current ||
      !scroller ||
      !relatedInventoriesQuery.data
    ) {
      return;
    }

    const leftSidebar = new StencilSidebar(
      LeftSidebar.current,
      scroller,
      relatedInventoriesQuery.data,
      mainService,
      serviceModels,
    );
    const zoomHandler = new ZoomHandlerService(ZoomHandler.current, scroller);

    setLeftSidebar(leftSidebar);

    return () => {
      leftSidebar.remove();
      zoomHandler.remove();
    };
  }, [scroller, relatedInventoriesQuery.data, mainService, serviceModels]);

  /**
   * add the instances to the diagram only when the stencil sidebar, diagram handlers, service models, main service and stencil state are defined
   * we need to add instances after stencil has been created to ensure that the stencil will get updated in case there are any embedded entities and relations that will get appendend on the canvas
   */
  useEffect(() => {
    if (!leftSidebar || !diagramHandlers || !isStencilStateReady) {
      return;
    }

    const newInstances = new Map();
    const copiedGraph = diagramHandlers.saveAndClearCanvas();

    if (copiedGraph.cells.length > 0) {
      diagramHandlers.loadState(copiedGraph);
    } else {
      const cells = diagramHandlers.addInstance(serviceModels, instance);

      cells.forEach((cell) => {
        newInstances.set(cell.id, {
          instance_id: cell.id,
          service_entity: cell.get("entityName"),
          config: {},
          action: instance ? null : "create",
          attributes: cell.get("instanceAttributes"),
          embeddedTo: cell.get("embeddedTo"),
          relatedTo: cell.get("relatedTo"),
        });
      });

      setServiceOrderItems(newInstances);
    }

    return () => {
      setCellToEdit(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    diagramHandlers,
    isStencilStateReady,
    leftSidebar,
    serviceModels,
    instance,
  ]);

  return (
    <EventWrapper>
      <DictModal />
      <CanvasWrapper id="canvas-wrapper" data-testid="Composer-Container">
        <LeftSidebarContainer
          className="left_sidebar"
          data-testid="left_sidebar"
          ref={LeftSidebar}
        />
        <CanvasContainer className="canvas" data-testid="canvas" ref={Canvas} />
        <RightSidebar editable={editable} />
        <ZoomHandlerContainer className="zoom-handler" ref={ZoomHandler} />
      </CanvasWrapper>
      {editable && <Validation />}
    </EventWrapper>
  );
};

/**
 * Container for the zoom & fullscreen tools from JointJS
 */
const ZoomHandlerContainer = styled.div`
  position: absolute;
  bottom: 12px;
  right: 316px;
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
  width: calc(100% - 540px); //240 left sidebar + 300 right sidebar
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
const LeftSidebarContainer = styled.div`
  width: 240px;
  height: 100%;
  background: var(--pf-v5-global--BackgroundColor--100);
  filter: drop-shadow(
    0.1rem 0.1rem 0.15rem
      var(--pf-v5-global--BackgroundColor--dark-transparent-200)
  );
`;
