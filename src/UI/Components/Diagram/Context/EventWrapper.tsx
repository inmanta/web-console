import React, { useContext, useEffect } from "react";
import {
  ActionEnum,
  ComposerServiceOrderItem,
  EmbeddedEventEnum,
} from "../interfaces";
import { ServiceEntityBlock } from "../shapes";
import { CanvasContext } from "./Context";

/**
 * EventWrapper component
 *
 * This component is a higher-order component that wraps its children and provides event handling for all necessary communication from withing JointJS code to the Composer.
 * It uses the CanvasContext to get and set various state variables.
 *
 * @param {React.PropsWithChildren} props - The properties that define the behavior and display of the component.
 * @param {React.ReactNode} props.children - The children components to be wrapped.
 *
 * @returns {React.FC<React.PropsWithChildren>} The EventWrapper component.
 */
export const EventWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const {
    instancesToSend,
    setInstancesToSend,
    setCellToEdit,
    setDictToDisplay,
    looseEmbedded,
    setLooseEmbedded,
  } = useContext(CanvasContext);

  /**
   * Handles the event triggered when there are loose embedded entities on the canvas.
   *
   * @param {CustomEvent} event - The event object.
   */
  const handleLooseEmbeddedEvent = (event) => {
    const customEvent = event as CustomEvent;
    const eventData: { kind: EmbeddedEventEnum; id: string } = JSON.parse(
      customEvent.detail,
    );
    const newSet = new Set(looseEmbedded);
    if (eventData.kind === "remove") {
      newSet.delete(eventData.id);
    } else {
      newSet.add(eventData.id);
    }
    setLooseEmbedded(newSet);
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
  };

  /**
   * Handles the update of a service entity block.
   *
   * @param {ServiceEntityBlock} cell - The service entity block to be updated.
   * @param {ActionEnum} action - The action to be performed on the service entity block.
   */
  const updateInstancesToSend = (event) => {
    const customEvent = event as CustomEvent;
    const { cell, action } = customEvent.detail as {
      cell: ServiceEntityBlock;
      action: ActionEnum;
    };

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

    const copiedInstances = new Map(instancesToSend); // copy

    const updatedInstance = instancesToSend.get(String(cell.id));
    switch (action) {
      case "update":
        //action in the instance isn't the same as action passed to this function, this assertion is to make sure that the update action won't change the action state of newly created instance. It will be addressed in next PR to make it clearer.
        newInstance.action =
          updatedInstance?.action === "create" ? "create" : "update";
        copiedInstances.set(String(cell.id), newInstance);
        break;
      case "create":
        newInstance.action = action;
        break;
      default:
        if (
          updatedInstance &&
          (updatedInstance.action === null ||
            updatedInstance.action === "update")
        ) {
          copiedInstances.set(String(cell.id), {
            instance_id: cell.id,
            service_entity: cell.getName(),
            config: {},
            action: "delete",
            attributes: null,
            edits: null,
            embeddedTo: cell.attributes.embeddedTo,
            relatedTo: cell.attributes.relatedTo,
          });
        } else {
          copiedInstances.delete(String(cell.id));
        }
        break;
    }
    setInstancesToSend(copiedInstances);
  };

  useEffect(() => {
    document.addEventListener("openDictsModal", handleDictEvent);
    document.addEventListener("openEditModal", handleEditEvent);
    document.addEventListener("looseEmbedded", handleLooseEmbeddedEvent);
    document.addEventListener("updateInstancesToSend", updateInstancesToSend);
    return () => {
      document.removeEventListener("openDictsModal", handleDictEvent);
      document.removeEventListener("openEditModal", handleEditEvent);
      document.removeEventListener("looseEmbedded", handleLooseEmbeddedEvent);
      document.removeEventListener(
        "updateInstancesToSend",
        updateInstancesToSend,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
};
