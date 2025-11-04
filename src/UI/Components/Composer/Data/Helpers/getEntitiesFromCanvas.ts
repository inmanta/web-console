import { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";
import { dia } from "@inmanta/rappid";

/**
 * Type guard to check if an element is a ServiceEntityShape
 */
function isServiceEntityShape(element: dia.Element): element is ServiceEntityShape {
    return element.attributes.type === "app.ServiceEntityShape";
}

export const getEntitiesFromCanvas = (graph: dia.Graph): ServiceEntityShape[] => {
    const elementsOnCanvas = graph.getElements();
    return elementsOnCanvas.filter(isServiceEntityShape);
};