import React, { useEffect, useRef, useState } from "react";
import "@inmanta/rappid/rappid.css";
import { Modal } from "@patternfly/react-core";
import styled from "styled-components";
import { ServiceModel } from "@/Core";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
import diagramInit, { DiagramHandlers } from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";
import FormModal from "./components/FormModal";
import Toolbar from "./components/Toolbar";
import { createConnectionRules } from "./helpers";
import { DictDialogData } from "./interfaces";

const Canvas = ({
  services,
  mainServiceName,
  instance,
}: {
  services: ServiceModel[];
  mainServiceName: string;
  instance?: InstanceWithReferences;
}) => {
  const canvas = useRef<HTMLDivElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [dictToDisplay, setDictToDisplay] = useState<DictDialogData | null>(
    null,
  );
  const [diagramHandlers, setDiagramHandlers] =
    useState<DiagramHandlers | null>(null);

  const handleEvent = (event) => {
    const customEvent = event as CustomEvent;
    setDictToDisplay(JSON.parse(customEvent.detail));
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const connectionRules = createConnectionRules(services, {});
    const actions = diagramInit(canvas, connectionRules);
    setDiagramHandlers(actions);

    if (instance) {
      const isMainInstance = true;
      actions.addInstance(instance, services, isMainInstance);
    }

    return () => {
      actions.removeCanvas();
    };
  }, [instance, services, mainServiceName]);

  useEffect(() => {
    document.addEventListener("openDictsModal", handleEvent);

    return () => {
      document.removeEventListener("openDictsModal", handleEvent);
    };
  }, []);
  return (
    <Container>
      <Modal
        isOpen={isDialogOpen}
        title={"Values of " + dictToDisplay?.title}
        variant={"small"}
        onClose={() => {
          setIsDialogOpen(false);
          setDictToDisplay(null);
        }}
      >
        {dictToDisplay && (
          <pre>
            <code>{JSON.stringify(dictToDisplay.value, null, 2)}</code>
          </pre>
        )}
      </Modal>
      <FormModal
        isOpen={isFormModalOpen}
        toggleIsOpen={(value: boolean) => setIsFormModalOpen(value)}
        services={services}
        onConfirm={(entity, selected) => {
          if (diagramHandlers) {
            diagramHandlers.addEntity(
              entity,
              selected.model as ServiceModel,
              selected.name === mainServiceName,
            );
          }
        }}
      />
      <Toolbar
        openEntityModal={() => setIsFormModalOpen(true)}
        serviceName={mainServiceName}
      />
      <CanvasWrapper id="canvas-wrapper">
        <div className="canvas" ref={canvas} />
        <ZoomWrapper>
          <button
            className="zoom-in"
            onClick={(event) => {
              event.stopPropagation();

              if (diagramHandlers) {
                diagramHandlers.zoom(1);
              }
            }}
          >
            +
          </button>
          <button
            className="zoom-out"
            onClick={(event) => {
              event.stopPropagation();
              if (diagramHandlers) {
                diagramHandlers.zoom(-1);
              }
            }}
          >
            -
          </button>
        </ZoomWrapper>
      </CanvasWrapper>
    </Container>
  );
};
export default Canvas;

const Container = styled.div`
  margin: 0 40px;
  height: 100%;
`;

const ZoomWrapper = styled.div`
  display: flex;
  gap: 1px;
  position: absolute;
  bottom: 16px;
  right: 16px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.35);

  button {
    display: flex;
    width: 24px;
    height: 22px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    background: #fff;
    padding: 0;
    border: 0;

    &.zoom-in {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
    }
    &.zoom-out {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
    &:hover {
      background: #ececec;
    }
    &:active {
      background: #e6e5e5;
    }
  }
`;
