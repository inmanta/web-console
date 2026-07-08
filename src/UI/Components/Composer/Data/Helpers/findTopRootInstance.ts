import type { ServiceEntityShape } from "../../UI/JointJsShapes/ServiceEntityShape";

/**
 * The subset of a shape this walk needs: its id, its type, and the ids of the
 * shapes it hangs off. Typed as a `Pick` of the real shape so we reuse that
 * contract instead of inventing a parallel interface, while staying generic
 * enough to unit-test with plain objects.
 */
export type PartialEntityShape = Pick<ServiceEntityShape, "id" | "entityType" | "parentIds">;

/**
 * Walks up an embedded shape's parent chain to its top root instance - the
 * first non-embedded ancestor (core or relation).
 *
 * `parentIds` is not reliably a single top-level id: the backend-load path sets
 * it to the root instance, but links drawn on the canvas add the immediate
 * parent and can accumulate several. So we climb one non-embedded step at a time,
 * guarding against cycles, and return the first core/relation shape reached (or
 * undefined when the chain can't be resolved, e.g. an unconnected new entity).
 *
 * @param shape - The starting shape (a non-embedded shape is returned as-is).
 * @param cells - The canvas shapes, keyed by id.
 * @returns The top root instance shape, or undefined if none can be resolved.
 */
export const findTopRootInstance = <T extends PartialEntityShape>(
  shape: T,
  cells: Map<string, T>
): T | undefined => {
  const visited = new Set<string>();
  let current: T | undefined = shape;

  while (current && current.entityType === "embedded") {
    visited.add(String(current.id));
    current = [...current.parentIds]
      .map((id) => cells.get(id))
      .find((parent) => parent !== undefined && !visited.has(String(parent.id)));
  }

  return current;
};
