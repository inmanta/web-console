import React, { useEffect, useRef, useState } from "react";
import "@inmanta/rappid/rappid.css";
import { dia } from "@inmanta/rappid";
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
  const [cellToEdit, setCellToEdit] = useState<dia.CellView | null>(null);
  const [dictToDisplay, setDictToDisplay] = useState<DictDialogData | null>(
    null,
  );
  const [diagramHandlers, setDiagramHandlers] =
    useState<DiagramHandlers | null>(null);
  const [instancesToSend, setInstancesToSend] = useState<object>({});

  const handleDictEvent = (event) => {
    const customEvent = event as CustomEvent;
    setDictToDisplay(JSON.parse(customEvent.detail));
    setIsDialogOpen(true);
  };
  const handleEditEvent = (event) => {
    const customEvent = event as CustomEvent;
    setCellToEdit(customEvent.detail);
    setIsFormModalOpen(true);
  };

  useEffect(() => {
    const connectionRules = createConnectionRules(services, {});
    const actions = diagramInit(canvas, connectionRules);
    setDiagramHandlers(actions);

    if (instance) {
      const isMainInstance = true;
      const cells = actions.addInstance(instance, services, isMainInstance);
      const newInstances = {};
      cells.forEach((cell) => {
        if (cell.type === "app.ServiceEntityBlock") {
          newInstances[cell.id] = {
            instance_id: cell.id,
            service_entity: cell.entityName,
            config: {},
            action: null,
            value: cell.instanceAttributes,
            embeddedTo: cell.embeddedTo,
            relatedTo: cell.relatedTo,
          };
        }
      });
      setInstancesToSend(newInstances);
    }

    return () => {
      actions.removeCanvas();
    };
  }, [instance, services, mainServiceName]);

  useEffect(() => {
    document.addEventListener("openDictsModal", handleDictEvent);
    document.addEventListener("openEditModal", handleEditEvent);

    return () => {
      document.removeEventListener("openDictsModal", handleDictEvent);
      document.removeEventListener("openEditModal", handleEditEvent);
    };
  }, []);

  return (
    <Container>
      <Modal
        disableFocusTrap
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
        toggleIsOpen={(value: boolean) => {
          if (cellToEdit && !value) {
            setCellToEdit(null);
          }
          setIsFormModalOpen(value);
        }}
        services={services}
        cellView={cellToEdit}
        onConfirm={(entity, selected) => {
          if (diagramHandlers) {
            if (cellToEdit) {
              //deep copy
              diagramHandlers.editEntity(
                cellToEdit,
                selected.model as ServiceModel,
                entity,
              );

              const instances = JSON.parse(JSON.stringify(instancesToSend));
              instances[cellToEdit.model.id] = entity;
              setInstancesToSend(instances);
            } else {
              const shape = diagramHandlers.addEntity(
                entity,
                selected.model as ServiceModel,
                selected.name === mainServiceName,
                selected.isEmbedded,
              );

              //deep copy
              const instances = JSON.parse(JSON.stringify(instancesToSend));
              instances[shape.id] = entity;
              setInstancesToSend(instances);
            }
          }
        }}
      />
      <Toolbar
        openEntityModal={() => {
          setIsFormModalOpen(true);
        }}
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
