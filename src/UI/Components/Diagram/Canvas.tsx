import React, { useContext, useEffect, useRef, useState } from "react";
import "@inmanta/rappid/joint-plus.css";
import { useNavigate } from "react-router-dom";
import { dia } from "@inmanta/rappid";
import { AlertVariant } from "@patternfly/react-core";
import styled from "styled-components";
import { ServiceModel } from "@/Core";
import { sanitizeAttributes } from "@/Data";
import { InstanceWithRelations } from "@/Data/Managers/V2/GetInstanceWithRelations";
import { Inventories } from "@/Data/Managers/V2/GetRelatedInventories";
import { usePostMetadata } from "@/Data/Managers/V2/PostMetadata";
import { usePostOrder } from "@/Data/Managers/V2/PostOrder";
import diagramInit, { DiagramHandlers } from "@/UI/Components/Diagram/init";
import {
  ComposerServiceOrderItem,
  ActionEnum,
  DictDialogData,
} from "@/UI/Components/Diagram/interfaces";

import { CanvasWrapper } from "@/UI/Components/Diagram/styles";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ToastAlert } from "../ToastAlert";
import DictModal from "./components/DictModal";
import FormModal from "./components/FormModal";
import Toolbar from "./components/Toolbar";
import { getServiceOrderItems, createConnectionRules } from "./helpers";
import { ServiceEntityBlock } from "./shapes";

/**
 * Canvas component for creating, displaying and editing an Instance.
 *
 * @param {ServiceModel[]} services - The list of service models .
 * @param {ServiceModel} mainServiceName - The name of the main service.
 * @param {InstanceWithRelations} instance - The instance with references.
 * @returns {JSX.Element} The rendered Canvas component.
 */
const Canvas: React.FC<{
  services: ServiceModel[];
  mainService: ServiceModel;
  serviceInventories: Inventories;
  instance?: InstanceWithRelations;
  editable: boolean;
}> = ({
  services,
  mainService,
  serviceInventories,
  instance,
  editable = true,
}) => {
  const { environmentHandler, routeManager } = useContext(DependencyContext);
  const environment = environmentHandler.useId();
  const oderMutation = usePostOrder(environment);
  const metadataMutation = usePostMetadata(environment);
  const canvas = useRef<HTMLDivElement>(null);
  const LeftSidebar = useRef<HTMLDivElement>(null);
  const zoomHandler = useRef<HTMLDivElement>(null);

  const [looseEmbedded, setLooseEmbedded] = useState<Set<string>>(new Set());
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
    Map<string, ComposerServiceOrderItem>
  >(new Map());
  const [isDirty, setIsDirty] = useState(false);

  const navigate = useNavigate();
  const url = routeManager.useUrl("Inventory", {
    service: mainService.name,
  });

  /**
   * Handles the event triggered when there are loose embedded entities on the canvas.
   *
   * @param {CustomEvent} event - The event object.
   */
  const handleLooseEmbeddedEvent = (event) => {
    const customEvent = event as CustomEvent;
    const eventData: { kind: "remove" | "add"; id: string } = JSON.parse(
      customEvent.detail,
    );
    if (eventData.kind === "remove") {
      setLooseEmbedded((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.delete(eventData.id);
        return newSet;
      });
    } else {
      setLooseEmbedded((prevSet) => {
        const newSet = new Set(prevSet);
        newSet.add(eventData.id);
        return newSet;
      });
    }
  };

  /**
   * Handles the event triggered when the user wants to see the dictionary properties of an entity.
   *
   * @param {CustomEvent} event - The event object.
   */
  const handleDictEvent = (event) => {
    const customEvent = event as CustomEvent;
    setDictToDisplay(JSON.parse(customEvent.detail));
  };

  /**
   * Handles the event triggered when the user wants to edit an entity.
   *
   * @param {CustomEvent} event - The event object.
   */
  const handleEditEvent = (event) => {
    const customEvent = event as CustomEvent;
    setCellToEdit(customEvent.detail);
    setIsFormModalOpen(true);
  };

  /**
   * Handles the filtering of the unchanged entities and sending serviceOrderItems to the backend.
   *
   */
  const handleDeploy = () => {
    const coordinates = diagramHandlers?.getCoordinates();

    const serviceOrderItems = getServiceOrderItems(instancesToSend, services)
      .filter((item) => item.action !== null)
      .map((instance) => ({
        ...instance,
        metadata: {
          coordinates: JSON.stringify(coordinates),
        },
      }));

    //Temporary workaround to update coordinates in metadata, as currently order endpoint don't handle metadata in the updates.
    // can't test in jest as I can't add any test-id to the halo handles though.
    if (instance) {
      metadataMutation.mutate({
        service_entity: mainService.name,
        service_id: instance.instance.id,
        key: "coordinates",
        body: {
          current_version: instance.instance.version,
          value: JSON.stringify(coordinates),
        },
      });
    }

    oderMutation.mutate(serviceOrderItems);
  };

  /**
   * Handles the update of a service entity block.
   *
   * @param {ServiceEntityBlock} cell - The service entity block to be updated.
   * @param {ActionEnum} action - The action to be performed on the service entity block.
   */
  const handleUpdate = (cell: ServiceEntityBlock, action: ActionEnum) => {
    const newInstance: ComposerServiceOrderItem = {
      instance_id: cell.id,
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
                instance_id: cell.id,
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
    const actions = diagramInit(
      canvas,
      LeftSidebar,
      zoomHandler,
      connectionRules,
      handleUpdate,
      editable,
      mainService,
      serviceInventories,
    );
    setDiagramHandlers(actions);
    const isMainInstance = true;
    const newInstances = new Map();

    if (instance) {
      try {
        const cells = actions.addInstance(isMainInstance, services, instance);

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
      } catch (error) {
        setAlertType(AlertVariant.danger);
        setAlertMessage(String(error));
      }
    } else {
      const cells = actions.addInstance(isMainInstance, services);
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
  }, [instance, services, editable, mainService, serviceInventories]);

  useEffect(() => {
    if (!isDirty) {
      setIsDirty(
        Array.from(instancesToSend).filter(
          ([_key, item]) => item.action !== null,
        ).length > 0,
      );
    }
  }, [instancesToSend, isDirty]);

  useEffect(() => {
    if (oderMutation.isSuccess) {
      //If response is successful then show feedback notification and redirect user to the service inventory view
      setAlertType(AlertVariant.success);
      setAlertMessage(words("inventory.instanceComposer.success"));

      setTimeout(() => {
        navigate(url);
      }, 1000);
    } else if (oderMutation.isError) {
      setAlertType(AlertVariant.danger);
      setAlertMessage(oderMutation.error.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oderMutation.isSuccess, oderMutation.isError]);

  useEffect(() => {
    document.addEventListener("openDictsModal", handleDictEvent);
    document.addEventListener("openEditModal", handleEditEvent);
    document.addEventListener("looseEmbedded", handleLooseEmbeddedEvent);

    return () => {
      document.removeEventListener("openDictsModal", handleDictEvent);
      document.removeEventListener("openEditModal", handleEditEvent);
      document.addEventListener("looseEmbedded", handleLooseEmbeddedEvent);
    };
  }, []);

  return (
    <>
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
            }
          }
        }}
      />
      <Toolbar
        serviceName={mainService.name}
        handleDeploy={handleDeploy}
        isDeployDisabled={
          instancesToSend.size < 1 || !isDirty || looseEmbedded.size > 0
        }
        editable={editable}
      />
      <CanvasWrapper id="canvas-wrapper" data-testid="Composer-Container">
        <StencilContainer className="stencil-sidebar" ref={LeftSidebar} />
        <div className="canvas" ref={canvas} />
        <ZoomHandlerWrapper className="zoomHandler" ref={zoomHandler} />
      </CanvasWrapper>
    </>
  );
};
export default Canvas;

const ZoomHandlerWrapper = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
`;

/**
 * To be able have draggables on the canvas, we need to have a stencil container to which we append the JointJS stencil objects that handle this scenario
 */
const StencilContainer = styled.div`
  position: absolute;
  left: 1px;
  top: 1px;
  width: 240px;
  height: calc(100% - 2px);
  z-index: 9999;
  background: var(--pf-v5-global--BackgroundColor--100);
  filter: drop-shadow(
    0.1rem 0.1rem 0.15rem
      var(--pf-v5-global--BackgroundColor--dark-transparent-200)
  );
`;
