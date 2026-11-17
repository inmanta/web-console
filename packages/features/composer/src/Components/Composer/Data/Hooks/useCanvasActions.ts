import { Dispatch, SetStateAction, useMemo } from "react";
import { ServiceModel } from "@inmanta/web-console-core";
import { CanvasActions } from "../Context";
import {
  addConnectionsBetweenShapes,
  canRemoveLink,
  checkIfConnectionIsAllowed,
  RelationsDictionary,
  removeConnectionsBetweenShapes,
  revealDirectChildren,
} from "../Helpers";
import { ServiceEntityShape } from "../ServiceEntityShape";

interface UseCanvasActionsParams {
  canvasState: Map<string, ServiceEntityShape>;
  setCanvasState: Dispatch<SetStateAction<Map<string, ServiceEntityShape>>>;
  relationsDictionary: RelationsDictionary;
  serviceCatalog: ServiceModel[];
}

/**
 * Hook for the changes to the shapes on the canvas.
 * The shapes are changed in place; a new canvasState map then re-renders the canvas and
 * recomputes the order items.
 */
export const useCanvasActions = ({
  canvasState,
  setCanvasState,
  relationsDictionary,
  serviceCatalog,
}: UseCanvasActionsParams): CanvasActions =>
  useMemo(() => {
    const refresh = () => setCanvasState((prev) => new Map(prev));

    const addShapes: CanvasActions["addShapes"] = (shapes) => {
      setCanvasState((prev) => new Map([...prev, ...shapes]));
    };

    /**
     * A shape with the embedded entities below it: they live in the instance's attributes,
     * so whatever happens to the instance happens to them.
     */
    const withEmbeddedEntities = (shape: ServiceEntityShape): ServiceEntityShape[] => [
      shape,
      ...(shape.entityType === "embedded"
        ? []
        : Array.from(canvasState.values()).filter(
            (other) => other.entityType === "embedded" && other.parentIds.has(shape.id)
          )),
    ];

    const removeShape: CanvasActions["removeShape"] = (shape) => {
      const removedShapes = withEmbeddedEntities(shape);
      const removedIds = new Set(removedShapes.map((removed) => removed.id));

      removedShapes.forEach((removed) => {
        // If the removed shape has collapsed children, reveal the first layer
        // so those children remain visible after the parent disappears.
        revealDirectChildren(canvasState, removed);
      });

      // Take the shapes out of the connections of the shapes that hold them. A relation loaded
      // from an instance is only recorded on one side, so look at every shape.
      canvasState.forEach((otherShape) => {
        if (removedIds.has(otherShape.id)) {
          return;
        }
        otherShape.connections.forEach((connectedIds, relationType) => {
          connectedIds
            .filter((connectedId) => removedIds.has(connectedId))
            .forEach((connectedId) => otherShape.removeConnection(connectedId, relationType));
        });
        removedIds.forEach((removedId) => otherShape.parentIds.delete(removedId));
      });

      setCanvasState((prev) => {
        const next = new Map(prev);

        removedIds.forEach((removedId) => next.delete(removedId));

        return next;
      });
    };

    const markShapeForDeletion: CanvasActions["markShapeForDeletion"] = (shape, marked) => {
      withEmbeddedEntities(shape).forEach((markedShape) => {
        markedShape.isMarkedForDeletion = marked;
      });
      refresh();
    };

    const connectShapes: CanvasActions["connectShapes"] = (source, target) => {
      if (!checkIfConnectionIsAllowed(source, target, relationsDictionary)) {
        return;
      }
      addConnectionsBetweenShapes(source, target);
      refresh();
    };

    const disconnectShapes: CanvasActions["disconnectShapes"] = (source, target) => {
      if (!canRemoveLink(source, target, canvasState, relationsDictionary, serviceCatalog)) {
        return;
      }
      removeConnectionsBetweenShapes(source, target);
      refresh();
    };

    return {
      addShapes,
      removeShape,
      markShapeForDeletion,
      connectShapes,
      disconnectShapes,
      refresh,
    };
  }, [canvasState, setCanvasState, relationsDictionary, serviceCatalog]);
