import { Dispatch, MutableRefObject, SetStateAction, useMemo } from "react";
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
  initialShapeInfoRef: MutableRefObject<Map<string, { service_entity: string }>>;
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
  initialShapeInfoRef,
  relationsDictionary,
  serviceCatalog,
}: UseCanvasActionsParams): CanvasActions =>
  useMemo(() => {
    const refresh = () => setCanvasState((prev) => new Map(prev));

    const addShapes: CanvasActions["addShapes"] = (shapes) => {
      setCanvasState((prev) => new Map([...prev, ...shapes]));
    };

    const removeShape: CanvasActions["removeShape"] = (shape, deletePermanently) => {
      // Only shapes that existed when the canvas opened end up in initialShapeInfoRef, and the
      // ones missing on deploy become delete order items. Removing a shape from the canvas
      // without deleting it means forgetting it was there.
      if (!deletePermanently) {
        initialShapeInfoRef.current.delete(shape.id);
      }

      // If the removed shape has collapsed children, reveal the first layer
      // so those children remain visible after the parent disappears.
      revealDirectChildren(canvasState, shape);

      // Take the shape out of the connections of the shapes that hold it. A relation loaded
      // from an instance is only recorded on one side, so look at every shape.
      canvasState.forEach((otherShape) => {
        otherShape.connections.forEach((connectedIds, relationType) => {
          if (connectedIds.includes(shape.id)) {
            otherShape.removeConnection(shape.id, relationType);
          }
        });
        otherShape.parentIds.delete(shape.id);
      });

      setCanvasState((prev) => {
        const next = new Map(prev);
        next.delete(shape.id);

        return next;
      });
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

    return { addShapes, removeShape, connectShapes, disconnectShapes, refresh };
  }, [canvasState, setCanvasState, initialShapeInfoRef, relationsDictionary, serviceCatalog]);
