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
 *
 * The canvas state is a map of ServiceEntityShape objects that are changed in place. The domain
 * code (connections, layers, layouts, validation, order items) works on the shapes themselves,
 * and the shapes refer to each other by id. A shape keeps its object for as long as it is on the
 * canvas: the cards render the shape itself (`data.shape`), and React Flow keeps a card's measured
 * size by its id. The rules:
 *
 * - React only sees a change when the map is replaced. A change to what the cards show or to the
 *   order (connections, attributes, layers, a layout) is followed by a new map: through one of these
 *   actions, `refresh()` after changing a shape in place, or `setCanvasState` (EntityForm). Each new
 *   map derives the cards again (Canvas) and recomputes the order items (useServiceOrderItems).
 * - Moving or measuring a card is written to its shape without a new map (Canvas' onNodesChange).
 *   React Flow already shows the change and the order doesn't depend on it, so a pointer move
 *   doesn't derive every card and order item again.
 * - A shape caches its order item. The methods that change its connections or attributes clear the
 *   cache, so change those through the methods, not the fields.
 *
 * Keep the shapes mutable as a whole: copying some of them on a change would leave the other
 * shapes and the cards holding the old objects.
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
