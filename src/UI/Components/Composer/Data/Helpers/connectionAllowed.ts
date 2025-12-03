import { dia } from "@inmanta/rappid";
import { RelationsDictionary } from ".";
import { ServiceEntityShape } from "../../UI";
import { isServiceEntityShapeCell } from "./getEntitiesFromCanvas";

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