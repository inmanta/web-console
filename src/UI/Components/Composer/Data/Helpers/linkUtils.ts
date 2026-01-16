import { dia } from "@inmanta/rappid";
import { LinkShape } from "../../UI/JointJsShapes/LinkShape";
import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";

/**
 * Creates a LinkShape with default router/connector/anchor from paper options.
 * This consolidates the link creation logic used in multiple places.
 * The relation key (port) is derived from the target entity's name.
 * 
 * @param sourceShape - The source shape for the link
 * @param targetShape - The target shape for the link
 * @param paper - The paper instance (optional, for getting default options)
 * @returns A configured LinkShape instance
 */
export const createLinkShape = (
    sourceShape: ServiceEntityShape,
    targetShape: ServiceEntityShape,
    paper?: dia.Paper
): dia.Link => {
    const link = new LinkShape();

    // Get options from paper if provided (where they're actually set)
    if (paper) {
        const paperOptions = paper.options;
        const defaultRouter = paperOptions?.defaultRouter;
        const defaultConnector = paperOptions?.defaultConnector;
        const defaultAnchor = paperOptions?.defaultAnchor;

        if (defaultRouter) {
            link.router(defaultRouter);
        }
        if (defaultConnector) {
            link.connector(defaultConnector);
        }
        if (defaultAnchor) {
            link.set("defaultAnchor", defaultAnchor);
        }
    }

    // The relation key (port) is the target entity's name
    const sourceRelationKey = targetShape.getEntityName();
    link.source({ id: sourceShape.id, port: sourceRelationKey });
    link.target({ id: targetShape.id });
    return link;
};

/**
 * Updates connections between two shapes (adds connections to both).
 * This consolidates the connection update logic used in multiple places.
 * 
 * @param sourceShape - The source shape
 * @param targetShape - The target shape
 */
export const addConnectionsBetweenShapes = (
    sourceShape: ServiceEntityShape,
    targetShape: ServiceEntityShape
): void => {
    const sourceRelationKey = targetShape.getEntityName();
    const targetRelationKey = sourceShape.getEntityName();

    sourceShape.addConnection(targetShape.id, sourceRelationKey);
    targetShape.addConnection(sourceShape.id, targetRelationKey);
};

/**
 * Removes connections between two shapes (removes from both).
 * This consolidates the connection removal logic used in multiple places.
 * 
 * @param sourceShape - The source shape
 * @param targetShape - The target shape
 */
export const removeConnectionsBetweenShapes = (
    sourceShape: ServiceEntityShape,
    targetShape: ServiceEntityShape
): void => {
    const sourceRelationKey = targetShape.getEntityName();
    const targetRelationKey = sourceShape.getEntityName();

    sourceShape.removeConnection(targetShape.id, sourceRelationKey);
    targetShape.removeConnection(sourceShape.id, targetRelationKey);
};

