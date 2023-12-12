import React, { useContext, useEffect, useRef, useState } from "react";
import "@inmanta/rappid/rappid.css";
import { useNavigate } from "react-router-dom";
import { dia } from "@inmanta/rappid";
import { AlertVariant } from "@patternfly/react-core";
import { isObject } from "lodash";
import styled from "styled-components";
import { objectHasKey, ServiceModel } from "@/Core";
import { sanitizeAttributes } from "@/Data";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
import diagramInit, { DiagramHandlers } from "@/UI/Components/Diagram/init";
import { CanvasWrapper } from "@/UI/Components/Diagram/styles";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ToastAlert } from "../ToastAlert";
import DictModal from "./components/DictModal";
import FormModal from "./components/FormModal";
import Toolbar from "./components/Toolbar";
import { bundleInstances, createConnectionRules } from "./helpers";
import { ActionEnum, DictDialogData, InstanceForApi } from "./interfaces";
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
  const { environmentHandler, urlManager, routeManager } =
    useContext(DependencyContext);
  const environment = environmentHandler.useId();
  const baseUrl = urlManager.getApiUrl();
  const canvas = useRef<HTMLDivElement>(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(AlertVariant.danger);
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
  const [isDirty, setIsDirty] = useState(false);

  const navigate = useNavigate();
  const url = routeManager.useUrl("Inventory", {
    service: mainServiceName,
  });

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
    try {
      const response = await fetch(`${baseUrl}/lsm/v2/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Inmanta-tid": environment,
        },
        body: JSON.stringify({
          service_order_items: bundleInstances(
            instancesToSend,
            services,
          ).filter((item) => item.action !== null),
        }),
      });

      if (response.ok) {
        setAlertType(AlertVariant.success);
        setAlertMessage(words("inventory.instanceComposer.success"));
        setTimeout(() => {
          navigate(url);
        }, 2000);
      } else {
        setAlertType(AlertVariant.danger);
        setAlertMessage(JSON.parse(await response.text()).message);
      }
    } catch (error) {
      setAlertType(AlertVariant.danger);
      if (
        isObject(error) &&
        objectHasKey(error as Record<string, unknown>, "message")
      ) {
        setAlertMessage((error as { message: string }).message);
      } else {
        setAlertMessage(`Error: ${error}`);
      }
    }
  };

  const handleUpdate = (cell: ServiceEntityBlock, action: ActionEnum) => {
    const newInstance: InstanceForApi = {
      instance_id: cell.id as string,
      service_entity: cell.getName(),
      config: {},
      action: null,
      attributes: cell.get("sanitizedAttrs"),
      edits: null,
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
                attributes: null,
                edits: null,
                embeddedTo: cell.attributes.embeddedTo,
                relatedTo: cell.attributes.relatedTo,
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
    if (!isDirty) {
      setIsDirty(
        Array.from(instancesToSend).filter(
          ([_key, item]) => item.action !== null,
        ).length > 0,
      );
    }
  }, [instancesToSend, services, isDirty]);

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
      {alertMessage && (
        <ToastAlert
          data-testid="ToastAlert"
          title={
            alertType === AlertVariant.success
              ? words("inventory.instanceComposer.success.title")
              : words("inventory.instanceComposer.failed.title")
          }
          message={alertMessage}
          setMessage={setAlertMessage}
          type={alertType}
        />
      )}
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
        onConfirm={(fields, entity, selected) => {
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
              handleUpdate(shape, ActionEnum.UPDATE);
            } else {
              const shape = diagramHandlers.addEntity(
                entity,
                selected.model as ServiceModel,
                selected.name === mainServiceName,
                selected.isEmbedded,
                selected.holderName,
              );
              shape.set("sanitizedAttrs", sanitizedAttrs);
              handleUpdate(shape, ActionEnum.CREATE);
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
        isDeployDisabled={instancesToSend.size < 1 || !isDirty}
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
  box-shadow: 0px 4px 4px 0px
    var(--pf-v5-global--BackgroundColor--dark-transparent-200);
  border-radius: 5px;
  background: var(--pf-v5-global--BackgroundColor--dark-transparent-200);

  button {
    display: flex;
    width: 24px;
    height: 22px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    background: var(--pf-v5-global--BackgroundColor--100);
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
      background: var(--pf-v5-global--BackgroundColor--light-300);
    }
    &:active {
      background: var(--pf-v5-global--Color--light-300);
    }
  }
`;
