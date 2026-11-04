import { ServiceEntityShape } from "../ServiceEntityShape";
import { RelationsDictionary } from "./createRelationsDictionary";

/**
 * Checks whether a new link between two shapes is allowed on the canvas.
 *
 * @param sourceShape - The shape the link starts from.
 * @param targetShape - The shape that is the potential link target; if undefined, connection is not allowed.
 * @param relationsDictionary - Dictionary describing allowed relations between service entities.
 * @returns `true` if the connection is valid and not already present, otherwise `false`.
 */
export const checkIfConnectionIsAllowed = (
  sourceShape: ServiceEntityShape,
  targetShape: ServiceEntityShape | undefined,
  relationsDictionary: RelationsDictionary
): boolean => {
  if (!targetShape) {
    return false;
  }

  if (sourceShape.id === targetShape.id) {
    return false;
  }

  const sourceType = sourceShape.getEntityType();
  const sourceName = sourceShape.getEntityName();
  const targetType = targetShape.getEntityType();
  const targetName = targetShape.getEntityName();

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

  const alreadyConnected = Array.from(sourceShape.connections.values()).some((ids) =>
    ids.includes(targetShape.id)
  );

  if (alreadyConnected) {
    return false;
  }

  const sourceAllowed = sourceShape.validateConnection(targetShape);
  const targetAllowed = targetShape.validateConnection(sourceShape);

  return sourceAllowed && targetAllowed;
};
