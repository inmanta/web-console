import { Pagination } from "@/Core/Domain/Pagination";
import { Maybe, ParsedNumber } from "@/Core/Language";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { PageSize } from "../PageSize";
import { Sort } from "../Sort";

/**
 * Type values for the three compound states.
 * These match the uppercase values returned by the resource state API.
 */
export type LastHandlerRun = "FAILED" | "SKIPPED" | "SUCCESSFUL" | "NEW";
export type Compliance = "COMPLIANT" | "NON_COMPLIANT" | "HAS_UPDATE" | "UNDEFINED";
export type Blocked = "BLOCKED" | "NOT_BLOCKED" | "TEMPORARILY_BLOCKED";
export type CompoundState = LastHandlerRun | Compliance | Blocked;

/**
 * Lowercased versions of the compound state enums, matching the keys in the resourceSummary API response.
 * @example LastHandlerRunKey = "failed" | "skipped" | "successful" | "new"
 */
export type LastHandlerRunKey = Lowercase<LastHandlerRun>;
export type ComplianceKey = Lowercase<Compliance>;
export type BlockedKey = Lowercase<Blocked>;

/** Union of all lowercased compound state keys. Used to key colorConfig, statusPriority, etc. */
export type CompoundStateKey = LastHandlerRunKey | ComplianceKey | BlockedKey;

/**
 * Maps a union of uppercase API enum strings to a count record with lowercased keys.
 * Used to type each group within {@link CompoundStateSummary}.
 *
 * @example SummaryRecord<"FAILED" | "SKIPPED"> = { failed: number; skipped: number }
 */
type SummaryRecord<T extends string> = Record<Lowercase<T>, number>;

/**
 * The three compound state groups returned in the resourceSummary API response.
 * Each group maps its lowercased status keys to a resource count.
 */
export interface CompoundStateSummary {
  lastHandlerRun: SummaryRecord<LastHandlerRun>;
  compliance: SummaryRecord<Compliance>;
  blocked: SummaryRecord<Blocked>;
}

/**
 * Full resource summary as returned by the API.
 * Extends {@link CompoundStateSummary} with deployment counts and a total.
 */
export interface ResourceSummary extends CompoundStateSummary {
  totalCount: number;
  isDeploying: { true: number; false: number };
}

/**
 * State fields of a resource.
 * @prop {boolean} isDeploying - Whether or not the resource is currently deploying
 * @prop {boolean} isOrphan - Whether the resource itself is an Orphan.
 * Orphans are resources which are no longer part of the latest intent. Can see them as log/history.
 * @prop {string} lastHandlerRunAt - ISO string with the date from when it was last processed by a handler.
 * @prop {LastHandlerRun} lastHandlerRun - The result of the last handler execution (e.g. FAILED, SKIPPED).
 * A handler knows how to translate resources (the abstraction of their attributes intent) into real world state.
 * @prop {Compliance} compliance - Whether the real world matches the latest intent for this resource (e.g. COMPLIANT, HAS_UPDATE).
 * @prop {Blocked} blocked - Whether the resource is blocked from being ran by the handler.
 * The exact intent of the resource is still unknown, it doesn't get send to the handler just yet until this gets resolved.
 */
export interface ResourceState {
  isDeploying: boolean;
  isOrphan: boolean;
  lastHandlerRunAt?: string;
  lastHandlerRun: LastHandlerRun;
  compliance: Compliance;
  blocked: Blocked;
}

/**
 * A resource as returned by the API, wrapped in a GraphQL-style node structure.
 * Use {@link FlatResource} when the node wrapper has already been unwrapped.
 *
 * @prop {string} resourceId - Unique identifier for the resource.
 * @prop {string} resourceType - The type of the resource (e.g. "frontend_model::resource_states::ResourceStateResource").
 * @prop {string} agent - The agent responsible for managing this resource.
 * @prop {string} resourceIdValue - The human-readable name/value of the resource id.
 * @prop {number} requiresLength - Number of other resources this resource depends on.
 * @prop {ResourceState} state - State fields of a resource. See {@link ResourceState}.
 */
export interface Resource {
  node: {
    resourceId: string;
    resourceType: string;
    agent: string;
    resourceIdValue: string;
    requiresLength: number;
    state: ResourceState;
  };
}

/** Unwrapped resource node — convenience alias for use after unwrapping the API response. */
export type FlatResource = Resource["node"];

/** Table row shape used for the resource view. */
export interface Row {
  id: string;
  type: string;
  agent: string;
  value: string;
  requiresLength: number;
  status: ResourceState;
}

/** Table row shape used for the desired state resource view. */
export type RowFromVersion = {
  id: string;
  type: string;
  agent: string;
  value: string;
  numberOfDependencies: ParsedNumber;
};

/** @deprecated Use Resource.CompoundState instead */
export enum Status {
  unavailable = "unavailable",
  skipped = "skipped",
  dry = "dry",
  deployed = "deployed",
  failed = "failed",
  deploying = "deploying",
  available = "available",
  cancelled = "cancelled",
  undefined = "undefined",
  skipped_for_undefined = "skipped_for_undefined",
  orphaned = "orphaned",
}

interface BaseDetails {
  resource_id: string;
  resource_type: string;
  agent: string;
  id_attribute: string;
  id_attribute_value: string;
  attributes: Record<string, unknown>;
}

interface ReleasedDetails extends BaseDetails {
  last_deploy?: string;
  first_generated_time: string;
  first_generated_version: ParsedNumber;
}

export interface Details extends ReleasedDetails {
  status: Status;
  requires_status: Record<string, Status>;
}

export interface RawDetails extends ReleasedDetails {
  status: string;
  requires_status: Record<string, string>;
}

export interface VersionedDetails extends BaseDetails {
  version: ParsedNumber;
  resource_version_id: string;
}

export const TRANSIENT_STATES = ["available", "deploying", "processing_events"];

export interface ResourceParams {
  sort?: Sort<SortKey>;
  filter?: Filter;
  pageSize: PageSize;
  currentPage: CurrentPage;
}

export interface Filter {
  type?: string[];
  agent?: string[];
  value?: string[];
  status?: string[];
}

export interface FilterWithDefaultHandling extends Filter {
  disregardDefault?: boolean;
}

export enum FilterKind {
  Type = "Type",
  Agent = "Agent",
  Value = "Value",
  Status = "Status",
}

export type SortKey = "agent" | "status" | "resource_type" | "resource_id_value";

export type FilterFromVersion = Omit<Filter, "status">;
export type SortKeyFromVersion = Exclude<SortKey, "status">;

export interface IdDetails {
  resource_type: string;
  agent: string;
  attribute: string;
  resource_id_value: string;
}

/** Resource data structure used for desired state page */
export interface FromVersionResource {
  resource_id: string;
  requires: string[];
  requiresLength?: number;
  id_details: IdDetails;
  resource_version_id: string;
}

export interface ResponseFromVersion {
  data: FromVersionResource[];
  links: Pagination.Links;
  metadata: Pagination.Metadata;
}

interface Id {
  entityType: string;
  agentName: string;
  attribute: string;
  attributeValue: string;
}

export class IdParser {
  private static readonly parseIdRegex =
    /^(?<id>(?<type>(?<ns>[\w-]+(::[\w-]+)*)::(?<class>[\w-]+))\[(?<hostname>[^,]+),(?<attr>[^=]+)=(?<value>[^\]]+)\])(,v=(?<version>[0-9]+))?$/;

  public static parse(idStr: string): Maybe.Maybe<Id> {
    const groups = idStr.match(IdParser.parseIdRegex)?.groups;

    if (!groups) {
      return Maybe.none();
    }

    return Maybe.some({
      entityType: groups.type,
      agentName: groups.hostname,
      attribute: groups.attr,
      attributeValue: groups.value,
    });
  }

  public static getAgentName(idStr: string): Maybe.Maybe<Id["agentName"]> {
    const id = IdParser.parse(idStr);

    return Maybe.isSome(id) ? Maybe.some(id.value.agentName) : Maybe.none();
  }
}
