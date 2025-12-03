import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { dia } from "@inmanta/rappid";

/**
 * Type guard to check if an element is a ServiceEntityShape
 */
export function isServiceEntityShape(element: dia.Element): element is ServiceEntityShape {
    return element.attributes.type === "app.ServiceEntityShape";
}

/**
 * Type guard to check if a cell is a ServiceEntityShape
 */
export function isServiceEntityShapeCell(cell: dia.Cell): cell is ServiceEntityShape {
    return cell instanceof ServiceEntityShape;
}

export const getEntitiesFromCanvas = (graph: dia.Graph): ServiceEntityShape[] => {
    const elementsOnCanvas = graph.getElements();
    return elementsOnCanvas.filter(isServiceEntityShape);
};