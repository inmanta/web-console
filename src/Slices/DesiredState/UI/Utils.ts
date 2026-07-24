import { Maybe } from "@/Core";
import { Filter } from "@/Slices/DesiredState/Core/Types";
import { DesiredStateVersionStatus } from "../Core/Domain";

export type CompareSelection = Maybe.Maybe<number>;

/**
 * Applies default status filters when the user has not set an explicit status filter
 * and has not opted out via the disregardDefault flag.
 *
 * The default shows only active, candidate, and retired versions, hiding skipped/failed ones
 * to keep the view relevant. Setting `disregardDefault` in the URL signals the user
 * explicitly cleared those defaults, so they are not re-applied.
 */
export const applyFilterDefaults = (filter: Filter): Filter =>
  !filter.disregardDefault && !filter.status
    ? {
        ...filter,
        status: [
          DesiredStateVersionStatus.active,
          DesiredStateVersionStatus.candidate,
          DesiredStateVersionStatus.retired,
        ],
      }
    : filter;
