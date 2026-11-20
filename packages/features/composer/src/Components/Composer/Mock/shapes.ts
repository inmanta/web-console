import { ServiceInstanceModel, ServiceModel } from "@inmanta/web-console-core";
import {
  createInventoryEntityShapes,
  createNewEntityShapes,
  createRelationsDictionary,
  initializeCanvasFromInstance,
} from "../Data/Helpers";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { serviceCatalog } from "./serviceModels";

const relationsDictionary = createRelationsDictionary(serviceCatalog);

/**
 * A new service on the canvas, with the embedded entities it requires, the service first.
 */
export const newServiceShapes = (
  serviceModel: ServiceModel,
  position = { x: 0, y: 0 }
): ServiceEntityShape[] =>
  Array.from(
    createNewEntityShapes({
      serviceModel,
      entityType: "core",
      position,
      serviceCatalog,
      relationsDictionary,
    }).values()
  );

/**
 * An existing instance on the canvas, read-only, with its embedded entities, the instance first.
 */
export const instanceShapes = (
  instance: ServiceInstanceModel,
  serviceModel: ServiceModel,
  position = { x: 0, y: 300 }
): ServiceEntityShape[] =>
  Array.from(
    createInventoryEntityShapes({
      instance,
      serviceModel,
      position,
      canvasState: new Map(),
      relationsDictionary,
      serviceCatalog,
      serviceInventories: null,
    }).values()
  );

/**
 * The canvas of the editor: the instance being edited with its embedded entities, built
 * like the editor builds it, the instance first.
 */
export const editedInstanceShapes = (instance: ServiceInstanceModel): ServiceEntityShape[] =>
  Array.from(
    initializeCanvasFromInstance(
      { instance, interServiceRelations: [] },
      serviceCatalog,
      relationsDictionary
    ).values()
  );

/**
 * The canvas state of shapes.
 */
export const toCanvasState = (...shapes: ServiceEntityShape[]): Map<string, ServiceEntityShape> =>
  new Map(shapes.map((shape) => [shape.id, shape]));
