import { Pagination } from "@/Core/Domain/Pagination";
import { Maybe, ParsedNumber } from "@/Core/Language";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { PageSize } from "../PageSize";
import { Sort } from "../Sort";

export interface Resource {
  node: {
    resourceId: string;
    resourceType: string;
    agent: string;
    resourceIdValue: string;
    requiresLength: number;
    state: {
      isDeploying: boolean;
      isOrphan: boolean;
      lastHandlerRunAt?: string;
    } & CompoundStateUpper;
  };
}
export type FlatResource = Resource["node"];

export interface ResourceSummary extends CompoundState {
  totalCount: number;
  isDeploying: { true: number; false: number };
}

/** Possible blocked states for a resource. */
export enum BlockedState {
  blocked = "blocked",
  not_blocked = "not_blocked",
  temporarily_blocked = "temporarily_blocked",
}

/** Possible compliance states for a resource. */
export enum ComplianceState {
  compliant = "compliant",
  has_update = "has_update",
  non_compliant = "non_compliant",
  undefined = "undefined",
}

/** Possible last handler run states for a resource. */
export enum LastHandlerRunState {
  failed = "failed",
  new = "new",
  skipped = "skipped",
  successful = "successful",
}

/** Union of all compound state types. */
export type CompoundStateType = BlockedState | ComplianceState | LastHandlerRunState;

/** Flat record of all compound state types mapped to counts. */
export type StateRecord = Record<CompoundStateType, number>;

/** Status counts grouped by state. */
export interface CompoundState {
  blocked: Record<BlockedState, number>;
  compliance: Record<ComplianceState, number>;
  lastHandlerRun: Record<LastHandlerRunState, number>;
}

/** Possible uppercased values grouped by state. */
export type CompoundStateUpper = {
  [K in keyof CompoundState]: Uppercase<Extract<keyof CompoundState[K], string>>;
};

/** Union of all uppercased state values. */
export type CompoundStateUpperType = Uppercase<CompoundStateType>;

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

export interface Row {
  type: string;
  agent: string;
  value: string;
  status: {
    isDeploying: boolean;
    isOrphan: boolean;
    lastHandlerRunAt?: string;
  } & CompoundStateUpper;
  requiresLength: number;
  id: string;
}

export type RowFromVersion = Omit<Row, "status" | "requiresLength"> & {
  numberOfDependencies: ParsedNumber;
};

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
