import React, { useContext, useEffect } from "react";
import { updateInstancesToSend } from "../helpers";
import { ActionEnum, EmbeddedEventEnum } from "../interfaces";
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
    setStencilState,
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
  const handleUpdateInstancesToSend = (event) => {
    const customEvent = event as CustomEvent;
    const { cell, action } = customEvent.detail as {
      cell: ServiceEntityBlock;
      action: ActionEnum;
    };

    setInstancesToSend((prev) => {
      //related instances aren't added to the instancesToSend map, and to avoid unwanted deletion of them, we need to assert that the instance is in the map before editing
      if (prev.has(String(cell.id)) || action === ActionEnum.CREATE) {
        return updateInstancesToSend(cell, action, prev);
      }

      return prev;
    });
  };

  /**
   * Handles updating the inventory stencil
   */
  const handleUpdateInventoryStencil = (event) => {
    const customEvent = event as CustomEvent;
    const eventData: { name: string; action: EmbeddedEventEnum } =
      customEvent.detail;

    //event listener doesn't ger updated state outside setStencilState function, so all logic has to be done inside it
    setStencilState((prev) => {
      const stencilStateCopy = JSON.parse(JSON.stringify(prev));

      // If the stencil doesn't exist, return the previous state - that's the case when we recurrently adding related children to the canvas, these embedded entities aren't tracked
      if (!stencilStateCopy[eventData.name]) {
        return stencilStateCopy;
      }

      switch (eventData.action) {
        case "add":
          stencilStateCopy[eventData.name].current += 1;
          break;
        case "remove":
          stencilStateCopy[eventData.name].current -= 1;
          break;
      }

      // If the current count is more than or equal to the max count, disable the stencil of given embedded entity
      if (
        stencilStateCopy[eventData.name].max !== null &&
        stencilStateCopy[eventData.name].max !== undefined &&
        stencilStateCopy[eventData.name].current >=
          stencilStateCopy[eventData.name].max
      ) {
        document
          .querySelector(`.${eventData.name}_body`)
          ?.classList.add("stencil_accent-disabled");
        document
          .querySelector(`.${eventData.name}_bodyTwo`)
          ?.classList.add("stencil_body-disabled");
        document
          .querySelector(`.${eventData.name}_text`)
          ?.classList.add("stencil_text-disabled");
      } else {
        document
          .querySelector(`.${eventData.name}_body`)
          ?.classList.remove("stencil_accent-disabled");
        document
          .querySelector(`.${eventData.name}_bodyTwo`)
          ?.classList.remove("stencil_body-disabled");
        document
          .querySelector(`.${eventData.name}_text`)
          ?.classList.remove("stencil_text-disabled");
      }

      return stencilStateCopy;
    });
  };

  useEffect(() => {
    document.addEventListener("openDictsModal", handleDictEvent);
    document.addEventListener("sendCellToSidebar", handleEditEvent);
    document.addEventListener("looseEmbedded", handleLooseEmbeddedEvent);
    document.addEventListener(
      "updateInstancesToSend",
      handleUpdateInstancesToSend,
    );
    document.addEventListener("updateStencil", handleUpdateInventoryStencil);

    return () => {
      document.removeEventListener("openDictsModal", handleDictEvent);
      document.removeEventListener("sendCellToSidebar", handleEditEvent);
      document.removeEventListener("looseEmbedded", handleLooseEmbeddedEvent);
      document.removeEventListener(
        "updateInstancesToSend",
        handleUpdateInstancesToSend,
      );
      document.removeEventListener(
        "updateStencil",
        handleUpdateInventoryStencil,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
