import { dia } from "@joint/plus";
import { isServiceEntityShapeCell } from "./getEntitiesFromCanvas";
import { RelationsDictionary } from ".";

/**
 * Checks whether a new link between two shapes is allowed on the canvas.
 *
 * @param graph - JointJS graph containing all shapes and links.
 * @param targetView - Cell/element view that is the potential link target; if undefined, connection is not allowed.
 * @param sourceView - Cell/element view that is the link source.
 * @param relationsDictionary - Dictionary describing allowed relations between service entities.
 * @returns `true` if the connection is valid and not already present, otherwise `false`.
 */
export const checkIfConnectionIsAllowed = (
  graph: dia.Graph,
  targetView: dia.CellView | dia.ElementView | undefined,
  sourceView: dia.CellView | dia.ElementView,
  relationsDictionary: RelationsDictionary
): boolean => {
  if (!targetView) {
    return false;
  }

  const sourceModel = sourceView.model;
  const targetModel = targetView.model;

  if (!isServiceEntityShapeCell(sourceModel) || !isServiceEntityShapeCell(targetModel)) {
    return false;
  }

  if (sourceModel.id === targetModel.id) {
    return false;
  }

  const safeEntityType = (model: { getEntityType?: () => string; getEntityName: () => string }) => {
    try {
      if (typeof model.getEntityType === "function") {
        return model.getEntityType();
      }
    } catch {
      // Fallback for lightweight test doubles that don't carry full model internals
    }
    return model.getEntityName();
  };

  const sourceType = safeEntityType(sourceModel);
  const sourceName = sourceModel.getEntityName();
  const targetType = safeEntityType(targetModel);
  const targetName = targetModel.getEntityName();

  const hasRelations = (type: string, name: string): boolean => {
    if (relationsDictionary[type] || relationsDictionary[name]) {
      return true;
    }

    return Object.keys(relationsDictionary).some(
      (key) => key.toLowerCase() === type.toLowerCase() || key.toLowerCase() === name.toLowerCase()
    );
  };

  const sourceRelations = hasRelations(sourceType, sourceName);
  const targetRelations = hasRelations(targetType, targetName);

  if (!sourceRelations && !targetRelations) {
    return false;
  }

  const sourceElement = sourceModel as unknown as dia.Element;
  const connectedElements = graph.getNeighbors(sourceElement);
  const alreadyConnected = connectedElements.some((neighbor) => neighbor.id === targetModel.id);

  if (alreadyConnected) {
    return false;
  }

  const sourceAllowed = sourceModel.validateConnection(targetModel);
  const targetAllowed = targetModel.validateConnection(sourceModel);

  return sourceAllowed && targetAllowed;
};
