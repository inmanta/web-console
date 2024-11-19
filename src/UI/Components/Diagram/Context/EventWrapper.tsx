import React, { useContext, useEffect } from "react";
import { updateServiceOrderItems } from "../helpers";
import {
  ActionEnum,
  EventActionEnum,
  RelationCounterForCell,
} from "../interfaces";
import { ServiceEntityBlock } from "../shapes";
import { CanvasContext } from "./Context";

/**
 * EventWrapper component
 *
 * This component is a higher-order component that wraps its children and provides event handling for all necessary communication from within JointJS code to the Composer.
 * It uses the CanvasContext to get and set various state variables.
 *
 * @props {React.PropsWithChildren} props - The properties that define the behavior and display of the component.
 * @prop {React.ReactNode} children - The children components to be wrapped.
 *
 * @returns {React.FC<React.PropsWithChildren>} The EventWrapper component.
 */
export const EventWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const {
    setInterServiceRelationsOnCanvas,
    setStencilState,
    setServiceOrderItems,
    setCellToEdit,
    setDictToDisplay,
    looseElement,
    setLooseElement,
  } = useContext(CanvasContext);

  /**
   * Handles the event triggered when there are loose embedded entities on the canvas.
   * The loose embedded entities are the entities that are not connected to the main entity. If there are any, they will be highlighted and deploy button will be disabled.
   *
   * @param {CustomEvent} event - The event object.
   *
   * @returns {void}
   */
  const handleLooseElementEvent = (event): void => {
    const customEvent = event as CustomEvent;
    const eventData: { kind: EventActionEnum; id: string } = JSON.parse(
      customEvent.detail,
    );
    const newSet = new Set(looseElement);

    if (eventData.kind === "remove") {
      newSet.delete(eventData.id);
    } else {
      newSet.add(eventData.id);
    }
    setLooseElement(newSet);
  };

  /**
   * Handles the event triggered when the user wants to see the dictionary properties of an entity.
   *
   * @param {CustomEvent} event - The event object.
   *
   * @returns {void}
   */
  const handleDictEvent = (event): void => {
    const customEvent = event as CustomEvent;

    setDictToDisplay(JSON.parse(customEvent.detail));
  };

  /**
   * Handles the event triggered when the user wants to edit an entity.
   *
   * @param {CustomEvent} event - The event object.
   *
   * @returns {void}
   */
  const handleEditEvent = (event): void => {
    const customEvent = event as CustomEvent;

    setCellToEdit(customEvent.detail);
  };

  /**
   * Handles the event triggered when the user made update to the instance cell
   * we need to assert first if the instance triggered the event is in the serviceOrderItems map,
   * as the inter-service related instances aren't added to the serviceOrderItems map as we don't want to accidentally delete or edit them,
   * yet they can exist on the canvas and be removed from it.
   *
   * @param {CustomEvent} event - The event object.
   *
   * @returns {void}
   */
  const handleUpdateServiceOrderItems = (event): void => {
    const customEvent = event as CustomEvent;
    const { cell, action } = customEvent.detail as {
      cell: ServiceEntityBlock;
      action: ActionEnum;
    };

    setServiceOrderItems((prev) => {
      // inter-service related instances aren't added to the serviceOrderItems map, this condition is here to prevent situation where we try to remove the inter-service related instance from the canvas and it ends up here with status to delete it from the inventory
      if (prev.has(String(cell.id)) || action === ActionEnum.CREATE) {
        return updateServiceOrderItems(cell, action, prev);
      }

      return prev;
    });
  };

  /**
   * Handles updating the stencil state
   * If the current count of elements created from a certain type of stencil is more than or equal to the max count, the corresponding stencil element will be disabled.
   *
   * @param {CustomEvent} event - The event object.
   *
   * @returns {void}
   */
  const handleUpdateStencilState = (event): void => {
    const customEvent = event as CustomEvent;
    const eventData: { name: string; action: EventActionEnum } =
      customEvent.detail;

    //event listener doesn't get updated state outside setStencilState function, so all logic has to be done inside it
    setStencilState((prev) => {
      const stencilStateCopy = JSON.parse(JSON.stringify(prev));

      const name = eventData.name;
      const stencil = stencilStateCopy[name];

      // If the stencil doesn't exist, return the previous state - that's the case when we add inter-service related instance through appendInstance() function which is connected through it's own embedded entity - then the stencil state doesn't have that stencil stored
      if (!stencil) {
        return stencilStateCopy;
      }

      switch (eventData.action) {
        case EventActionEnum.ADD:
          stencil.current += 1;
          break;
        case EventActionEnum.REMOVE:
          stencil.current -= 1;
          break;
        default:
          break;
      }

      const elements = [
        { selector: `.body_${name}`, className: "stencil_accent-disabled" },
        { selector: `.bodyTwo_${name}`, className: "stencil_body-disabled" },
        { selector: `.text_${name}`, className: "stencil_text-disabled" },
      ];

      const shouldDisable =
        stencil.max !== null &&
        stencil.max !== undefined &&
        stencil.current >= stencil.max;

      // As in the docstrings mentioned, If the current count of the instances created from given stencil is more than or equal to the max count, disable the stencil of given embedded entity
      elements.forEach(({ selector, className }) => {
        const element = document.querySelector(selector);

        if (element) {
          element.classList.toggle(className, shouldDisable);
        }
      });

      return stencilStateCopy;
    });
  };

  /**
   * Handles the event triggered when there is a creation of entity that has required inter-service relation.
   *
   * @param {CustomEvent} event - The event object.
   *
   * @returns {void}
   */
  const handleAddCellWithInterServiceRelations = (event): void => {
    const customEvent = event as CustomEvent;
    const { id, name, relations } = customEvent.detail;

    setInterServiceRelationsOnCanvas((prev) => {
      const copy = new Map(prev);

      copy.set(id, {
        name,
        relations,
      });

      return copy;
    });
  };

  /**
   * Handles the event triggered when there is a removal of entity that has required inter-service relation.
   *
   * @param {CustomEvent} event - The event object.
   *
   * @returns {void}
   */
  const handleRemoveCellWithInterServiceRelations = (event): void => {
    const customEvent = event as CustomEvent;
    const { id } = customEvent.detail;

    setInterServiceRelationsOnCanvas((prev) => {
      const copy = new Map(prev);

      copy.delete(id);

      return copy;
    });
  };

  /**
   * Handles the event triggered when there is a addition/removal of inter-service relation.
   *
   * @param {CustomEvent} event - The event object.
   *
   * @returns {void}
   */
  const handleUpdateCellWithInterServiceRelations = (event): void => {
    const customEvent = event as CustomEvent;
    const { id, name, action } = customEvent.detail;

    setInterServiceRelationsOnCanvas((prev) => {
      const copy = new Map(prev);
      const cellsRelations: RelationCounterForCell | undefined = copy.get(id);

      if (cellsRelations) {
        const indexOfRelationToUpdate = cellsRelations.relations.findIndex(
          (relation) => relation.name === name,
        );

        if (indexOfRelationToUpdate > -1) {
          const relationToUpdate =
            cellsRelations.relations[indexOfRelationToUpdate];

          let current = relationToUpdate.current;

          relationToUpdate.current =
            action === EventActionEnum.ADD ? ++current : --current;

          cellsRelations.relations.splice(
            indexOfRelationToUpdate,
            1,
            relationToUpdate,
          );
          copy.set(id, cellsRelations);
        }
      }

      return copy;
    });
  };

  useEffect(() => {
    document.addEventListener("openDictsModal", handleDictEvent);
    document.addEventListener("sendCellToSidebar", handleEditEvent);
    document.addEventListener("looseElement", handleLooseElementEvent);
    document.addEventListener(
      "updateServiceOrderItems",
      handleUpdateServiceOrderItems,
    );
    document.addEventListener("updateStencil", handleUpdateStencilState);
    document.addEventListener(
      "addInterServiceRelationToTracker",
      handleAddCellWithInterServiceRelations,
    );
    document.addEventListener(
      "removeInterServiceRelationFromTracker",
      handleRemoveCellWithInterServiceRelations,
    );
    document.addEventListener(
      "updateInterServiceRelations",
      handleUpdateCellWithInterServiceRelations,
    );

    return () => {
      document.removeEventListener("openDictsModal", handleDictEvent);
      document.removeEventListener("sendCellToSidebar", handleEditEvent);
      document.removeEventListener("looseElement", handleLooseElementEvent);
      document.removeEventListener(
        "updateServiceOrderItems",
        handleUpdateServiceOrderItems,
      );
      document.removeEventListener("updateStencil", handleUpdateStencilState);
      document.removeEventListener(
        "addInterServiceRelationToTracker",
        handleAddCellWithInterServiceRelations,
      );
      document.removeEventListener(
        "removeInterServiceRelationFromTracker",
        handleRemoveCellWithInterServiceRelations,
      );
      document.addEventListener(
        "updateInterServiceRelations",
        handleUpdateCellWithInterServiceRelations,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
