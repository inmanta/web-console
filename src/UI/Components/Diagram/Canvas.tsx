import React, { useContext, useEffect, useRef, useState } from "react";
import "@inmanta/rappid/joint-plus.css";
import { ui } from "@inmanta/rappid";
import styled from "styled-components";
import { diagramInit } from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";
import { CanvasContext, InstanceComposerContext } from "./Context/Context";
import { EventWrapper } from "./Context/EventWrapper";
import DictModal from "./components/DictModal";
import { RightSidebar } from "./components/RightSidebar";
import Toolbar from "./components/Toolbar";
import { createConnectionRules, createStencilState } from "./helpers";
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
  const {
    setStencilState,
    setInstancesToSend,
    diagramHandlers,
    setDiagramHandlers,
  } = useContext(CanvasContext);
  const Canvas = useRef<HTMLDivElement>(null);
  const LeftSidebar = useRef<HTMLDivElement>(null);
  const ZoomHandler = useRef<HTMLDivElement>(null);
  const [scroller, setScroller] = useState<ui.PaperScroller | null>(null);
  const [isStencilStateReady, setIsStencilStateReady] = useState(false);

  const [sidebar, setSidebar] = useState<StencilSidebar | null>(null); // without this state it could happen that cells would load before sidebar is ready so it's state could be outdated

  useEffect(() => {
    if (!mainService) {
      return;
    }
    setStencilState(createStencilState(mainService, !!instance));
    setIsStencilStateReady(true);
  }, [mainService, instance, setStencilState]);

  useEffect(() => {
    if (!mainService || !serviceModels || !isStencilStateReady) {
      return;
    }

    const connectionRules = createConnectionRules(serviceModels, {});
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
      setStencilState(createStencilState(mainService));
      setIsStencilStateReady(false);
      actions.removeCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainService, serviceModels, isStencilStateReady]);

  useEffect(() => {
    if (
      !LeftSidebar.current ||
      !scroller ||
      !relatedInventories.data ||
      !mainService ||
      !serviceModels
    ) {
      return;
    }

    const sidebar = new StencilSidebar(
      LeftSidebar.current,
      scroller,
      relatedInventories.data,
      mainService,
      serviceModels,
    );

    setSidebar(sidebar);

    return () => sidebar.remove();
  }, [scroller, relatedInventories.data, mainService, serviceModels]);

  useEffect(() => {
    if (
      !sidebar ||
      !diagramHandlers ||
      !serviceModels ||
      !mainService ||
      !isStencilStateReady
    ) {
      return;
    }
    const newInstances = new Map();

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
    setInstancesToSend(newInstances);

    return () => {
      setStencilState(createStencilState(mainService));
      setIsStencilStateReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramHandlers, isStencilStateReady, sidebar]);

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
      <Toolbar serviceName={mainService.name} editable={editable} />
      <CanvasWrapper id="canvas-wrapper" data-testid="Composer-Container">
        <StencilContainer className="stencil-sidebar" ref={LeftSidebar} />
        <CanvasContainer className="canvas" ref={Canvas} />
        <RightSidebar />
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
const StencilContainer = styled.div`
  width: 240px;
  height: 100%;
  background: var(--pf-v5-global--BackgroundColor--100);
  filter: drop-shadow(
    0.1rem 0.1rem 0.15rem
      var(--pf-v5-global--BackgroundColor--dark-transparent-200)
  );
`;
