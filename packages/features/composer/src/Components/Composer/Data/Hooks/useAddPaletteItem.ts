import { useCallback, useContext } from "react";
import { ComposerContext, PaletteItem } from "../Context";
import {
  createInventoryEntityShapes,
  createNewEntityShapes,
  getShapeDimensions,
  PositionTracker,
} from "../Helpers";
import { Point } from "../ServiceEntityShape";

/**
 * Hook that puts an item from the palette on the canvas at a position, or below it where it
 * doesn't cover another card, and selects it.
 * A new entity comes with the embedded entities it requires; an inventory instance with its
 * cluster: its embedded entities and the instances it relates to (createInventoryEntityShapes).
 */
export const useAddPaletteItem = () => {
  const {
    canvasState,
    canvasActions,
    serviceCatalog,
    serviceInventories,
    relationsDictionary,
    setActiveCell,
  } = useContext(ComposerContext);

  return useCallback(
    (item: PaletteItem, requestedPosition: Point) => {
      const positionTracker = new PositionTracker();
      canvasState.forEach((shape) => {
        const { x, y } = shape.getPosition();
        const { width, height } = getShapeDimensions(shape);

        positionTracker.reserve(shape.id, x, y, width, height);
      });
      const position = {
        x: requestedPosition.x,
        y: positionTracker.findNextYPosition(
          requestedPosition.x,
          undefined,
          undefined,
          requestedPosition.y
        ),
      };

      const shapes =
        item.kind === "new"
          ? createNewEntityShapes({
              serviceModel: item.serviceModel,
              entityType: item.entityType,
              position,
              serviceCatalog,
              relationsDictionary,
            })
          : createInventoryEntityShapes({
              instance: item.instance,
              serviceModel: item.serviceModel,
              position,
              canvasState,
              relationsDictionary,
              serviceCatalog,
              serviceInventories,
            });

      canvasActions.addShapes(shapes);
      setActiveCell(shapes.values().next().value ?? null);
    },
    [
      canvasState,
      canvasActions,
      serviceCatalog,
      serviceInventories,
      relationsDictionary,
      setActiveCell,
    ]
  );
};
