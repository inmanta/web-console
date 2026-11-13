import React, { useCallback, useMemo, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { ServiceModel } from "@inmanta/web-console-core";
import { Inventories } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { ComposerContext, composerContext, PaletteItem } from "../Data/Context";
import { createRelationsDictionary } from "../Data/Helpers";
import { useCanvasActions } from "../Data/Hooks";
import { ServiceEntityShape } from "../Data/ServiceEntityShape";
import { serviceCatalog as defaultCatalog } from "./serviceModels";

type InitialShapeInfo = [string, { service_entity: string }];

interface Props {
  /** The shapes on the canvas when it opens. */
  shapes?: Map<string, ServiceEntityShape>;
  serviceCatalog?: ServiceModel[];
  serviceInventories?: Inventories | null;
  editable?: boolean;

  /** Instances the canvas opened with that were deleted from it since. */
  deletedInstanceIds?: string[];

  /** The selected shape when the canvas opens. */
  activeCellId?: string;

  /** The instance the composer edits, like the editor provides it. */
  serviceInstanceId?: string | null;
  children: React.ReactNode;
}

/**
 * The composer's context for its component tests, like the Composer provides it, without the
 * queries: the canvas state, the selection and the real canvas actions, and React Flow. The shapes
 * that are not new count as the instances the canvas opened with, so removing one deletes it.
 */
export const ComposerTestProvider: React.FC<Props> = ({
  shapes = new Map(),
  serviceCatalog = defaultCatalog,
  serviceInventories = null,
  editable = true,
  deletedInstanceIds = [],
  activeCellId: initialActiveCellId,
  serviceInstanceId = null,
  children,
}) => {
  const relationsDictionary = useMemo(
    () => createRelationsDictionary(serviceCatalog),
    [serviceCatalog]
  );
  const [canvasState, setCanvasState] = useState(shapes);
  const [activeCellId, setActiveCellId] = useState(initialActiveCellId ?? null);
  const initialShapeInfoRef = useRef(
    new Map([
      ...Array.from(shapes.values())
        .filter((shape) => !shape.isNew && shape.entityType !== "embedded")
        .map((shape): InitialShapeInfo => [shape.id, { service_entity: shape.getEntityName() }]),
      ...deletedInstanceIds.map((id): InitialShapeInfo => [id, { service_entity: "" }]),
    ])
  );
  const draggedItemRef = useRef<PaletteItem | null>(null);
  const canvasActions = useCanvasActions({
    canvasState,
    setCanvasState,
    initialShapeInfoRef,
    relationsDictionary,
    serviceCatalog,
  });
  const activeCell = (activeCellId && canvasState.get(activeCellId)) || null;
  const setActiveCell = useCallback(
    (cell: ServiceEntityShape | null) => setActiveCellId(cell ? cell.id : null),
    []
  );

  const value = {
    ...composerContext,
    relationsDictionary,
    serviceCatalog,
    serviceInventories,
    editable,
    canvasState,
    setCanvasState,
    canvasActions,
    activeCell,
    setActiveCell,
    initialShapeInfoRef,
    draggedItemRef,
    mainService: serviceCatalog[0] ?? null,
    serviceInstanceId,
  };

  return (
    <ComposerContext.Provider value={value}>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </ComposerContext.Provider>
  );
};
