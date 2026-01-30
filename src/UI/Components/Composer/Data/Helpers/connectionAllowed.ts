import { dia } from "@inmanta/rappid";
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

  const sourceName = sourceModel.getEntityName();
  const targetName = targetModel.getEntityName();

  const sourceRelations = relationsDictionary[sourceName];
  const targetRelations = relationsDictionary[targetName];

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
