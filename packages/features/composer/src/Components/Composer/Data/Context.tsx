import { createContext, Dispatch, MutableRefObject, SetStateAction } from "react";
import { ServiceModel, ServiceOrderItemRequest } from "@inmanta/web-console-core";
import { Inventories } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { RelationsDictionary } from "./Helpers/createRelationsDictionary";
import { ServiceEntityShape } from "./ServiceEntityShape";

/**
 * What can be dragged from the palette onto the canvas: a new entity, or an existing
 * instance from the inventory.
 */
export type PaletteItem =
  | {
      kind: "new";
      serviceModel: ServiceModel | ServiceModel["embedded_entities"][number];
      entityType: "core" | "embedded";
    }
  | {
      kind: "inventory";
      instance: Inventories[string][number];
      serviceModel: ServiceModel;
    };

/**
 * Changes to the shapes on the canvas. Each one updates the shapes and re-renders the canvas.
 */
export interface CanvasActions {
  /** Puts new shapes on the canvas. */
  addShapes: (shapes: Map<string, ServiceEntityShape>) => void;

  /**
   * Takes a shape off the canvas. Deleting it permanently adds a delete to the order for an
   * existing instance; removing it only takes it off the canvas.
   */
  removeShape: (shape: ServiceEntityShape, deletePermanently: boolean) => void;

  /** Connects two shapes, if their relation allows it. */
  connectShapes: (source: ServiceEntityShape, target: ServiceEntityShape) => void;

  /** Disconnects two shapes, if their relation allows it. */
  disconnectShapes: (source: ServiceEntityShape, target: ServiceEntityShape) => void;

  /** Re-renders the canvas after shapes were changed in place (positions, layers). */
  refresh: () => void;
}

/**
 * Shape of the shared Composer React context.
 */
interface ComposerContextInterface {
  relationsDictionary: RelationsDictionary;
  canvasState: Map<string, ServiceEntityShape>;
  setCanvasState: Dispatch<SetStateAction<Map<string, ServiceEntityShape>>>;
  canvasActions: CanvasActions;
  activeCell: ServiceEntityShape | null;
  setActiveCell: (cell: ServiceEntityShape | null) => void;

  /** The instances on the canvas when it opened; those missing on deploy are deleted. */
  initialShapeInfoRef: MutableRefObject<Map<string, { service_entity: string }>>;

  /** The palette item being dragged onto the canvas, if any. */
  draggedItemRef: MutableRefObject<PaletteItem | null>;
  mainService: ServiceModel | null;
  serviceCatalog: ServiceModel[];
  serviceInventories: Inventories | null;
  serviceInstanceId: string | null;
  editable: boolean;
  serviceOrderItems: Map<string, ServiceOrderItemRequest>;
  hasValidationErrors: boolean;
}

const noop = () => {};

/**
 * Default Composer context value used when no provider is present.
 */
export const composerContext: ComposerContextInterface = {
  relationsDictionary: {},
  canvasState: new Map(),
  setCanvasState: noop,
  canvasActions: {
    addShapes: noop,
    removeShape: noop,
    connectShapes: noop,
    disconnectShapes: noop,
    refresh: noop,
  },
  activeCell: null,
  setActiveCell: noop,
  initialShapeInfoRef: { current: new Map() },
  draggedItemRef: { current: null },
  mainService: null,
  serviceCatalog: [],
  serviceInventories: null,
  serviceInstanceId: null,
  editable: false,
  serviceOrderItems: new Map(),
  hasValidationErrors: false,
};

export const ComposerContext = createContext(composerContext);
