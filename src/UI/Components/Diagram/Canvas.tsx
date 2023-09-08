import React, { useContext, useEffect, useRef, useState } from "react";
import "@inmanta/rappid/rappid.css";
import { dia } from "@inmanta/rappid";
import styled from "styled-components";
import { ServiceModel } from "@/Core";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
import diagramInit, { DiagramHandlers } from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";
import { DependencyContext } from "@/UI/Dependency";
import { PrimaryBaseUrlManager } from "@/UI/Routing";
import DictModal from "./components/DictModal";
import FormModal from "./components/FormModal";
import Toolbar from "./components/Toolbar";
import { createConnectionRules, shapesDataTransform } from "./helpers";
import { DictDialogData, InstanceForApi } from "./interfaces";
import { ServiceEntityBlock } from "./shapes";

const Canvas = ({
  services,
  mainServiceName,
  instance,
}: {
  services: ServiceModel[];
  mainServiceName: string;
  instance?: InstanceWithReferences;
}) => {
  const { environmentHandler } = useContext(DependencyContext);
  const environment = environmentHandler.useId();
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);
  const canvas = useRef<HTMLDivElement>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [cellToEdit, setCellToEdit] = useState<dia.CellView | null>(null);
  const [dictToDisplay, setDictToDisplay] = useState<DictDialogData | null>(
    null,
  );
  const [diagramHandlers, setDiagramHandlers] =
    useState<DiagramHandlers | null>(null);
  const [instancesToSend, setInstancesToSend] = useState<
    Map<string, InstanceForApi>
  >(new Map());

  const handleDictEvent = (event) => {
    const customEvent = event as CustomEvent;
    setDictToDisplay(JSON.parse(customEvent.detail));
  };
  const handleEditEvent = (event) => {
    const customEvent = event as CustomEvent;
    setCellToEdit(customEvent.detail);
    setIsFormModalOpen(true);
  };

  const handleDeploy = async () => {
    const mapToArray = Array.from(instancesToSend, (instance) => instance[1]); //only value, the id is stored in the object anyway
    const topServicesNames = services.map((service) => service.name);
    const topInstances = mapToArray.filter((instance) =>
      topServicesNames.includes(instance.service_entity),
    );
    const embeddedInstances = mapToArray.filter(
      (instance) => !topServicesNames.includes(instance.service_entity),
    );

    await fetch(`${baseUrl}/lsm/v2/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Inmanta-tid": environment,
      },
      body: JSON.stringify({
        service_order_items: topInstances
          .map((instance) => shapesDataTransform(embeddedInstances, instance))
          .filter((item) => item.action !== null),
      }),
    });
  };

  const handleUpdate = (
    cell: ServiceEntityBlock,
    action: "update" | "create" | "delete",
  ) => {
    const newInstance: InstanceForApi = {
      instance_id: cell.id as string,
      service_entity: cell.getName(),
      config: {},
      action: null,
      value: cell.get("instanceAttributes"),
      edit: null,
      embeddedTo: cell.get("embeddedTo"),
      relatedTo: cell.getRelations(),
    };
    setInstancesToSend((prevInstances) => {
      const updatedInstance = prevInstances.get(cell.id as string);
      switch (action) {
        case "update":
          newInstance.action =
            updatedInstance?.action === "create" ? "create" : "update";
          return new Map(prevInstances.set(cell.id as string, newInstance));
        case "create":
          newInstance.action = action;
          return new Map(prevInstances.set(cell.id as string, newInstance));
        default:
          if (
            updatedInstance &&
            (updatedInstance.action === null ||
              updatedInstance.action === "update")
          ) {
            return new Map(
              prevInstances.set(cell.id as string, {
                instance_id: cell.id as string,
                service_entity: cell.getName(),
                config: {},
                action: "delete",
                value: null,
                edit: null,
                embeddedTo: null,
                relatedTo: null,
              }),
            );
          } else {
            const newInstances = new Map(prevInstances);
            newInstances.delete(cell.id as string);
            return newInstances;
          }
      }
    });
  };

  useEffect(() => {
    const connectionRules = createConnectionRules(services, {});
    const actions = diagramInit(canvas, connectionRules, handleUpdate);
    setDiagramHandlers(actions);

    if (instance) {
      const isMainInstance = true;
      const cells = actions.addInstance(instance, services, isMainInstance);
      const newInstances = new Map();
      cells.forEach((cell) => {
        if (cell.type === "app.ServiceEntityBlock") {
          newInstances.set(cell.id, {
            instance_id: cell.id,
            service_entity: cell.entityName,
            config: {},
            action: null,
            value: cell.instanceAttributes,
            embeddedTo: cell.embeddedTo,
            relatedTo: cell.relatedTo,
          });
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
      <DictModal
        dictToDisplay={dictToDisplay}
        setDictToDisplay={setDictToDisplay}
      />
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
              const shape = diagramHandlers.editEntity(
                cellToEdit,
                selected.model as ServiceModel,
                entity,
              );

              handleUpdate(shape, "update");
            } else {
              const shape = diagramHandlers.addEntity(
                entity,
                selected.model as ServiceModel,
                selected.name === mainServiceName,
                selected.isEmbedded,
              );
              handleUpdate(shape, "create");
            }
          }
        }}
      />
      <Toolbar
        openEntityModal={() => {
          setIsFormModalOpen(true);
        }}
        serviceName={mainServiceName}
        handleDeploy={handleDeploy}
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
