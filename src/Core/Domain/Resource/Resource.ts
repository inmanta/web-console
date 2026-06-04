import { Pagination } from "@/Core/Domain/Pagination";
import { Maybe, ParsedNumber } from "@/Core/Language";

/**
 * --- General explanation of compound state ---
 * Old status field for resources had 1 big flaw which was that it hid information:
 * - Did it deploy successfully in the past?
 * - Is the intent correctly enforced?
 * In short, more information should be available about a resource now in comparison to before.
 * See {@link ResourceState} for details about resource state fields.
 * See {@link CompoundState} for details about the compound state values.
 */

/**
 * Result of the last handler execution for a resource. More of a health check because it is not supposed to fail.
 *
 * - `failed → "FAILED"` — Something went wrong in the handler execution. This could be a communication error with a device or an uncaught exception in the handler code.
 * - `skipped → "SKIPPED"` — Handler decided that the resource is not ready to be processed by it. Most common reason for handler deciding to skip is that one of
 *   its dependencies is in a failed state.
 * - `successful → "SUCCESSFUL"` — Handler finishes its run successfully, handler succeeded to enforce the resource's intent in the real world.
 * - `new → "NEW"` — Handler has never finished run for this resource yet. Perhaps because it's waiting in queue, perhaps it is running at this very moment but it takes a while.
 *
 * Keys are the lowercase filter strings; values are the uppercase API enum values.
 */
export const LAST_HANDLER_RUN = {
  failed: "FAILED",
  skipped: "SKIPPED",
  successful: "SUCCESSFUL",
  new: "NEW",
} as const;

/**
 * Indicates whether the real-world state matches the intended configuration. Is about intent being reflected in the real world.
 *
 * - `compliant → "COMPLIANT"` — Derived from a successful handler result. May be overwritten when the intent is updated.
 * - `has_update → "HAS_UPDATE"` — The intent for this resource has received an update since the last handler run.
 *   Special form of non-compliance; the real world doesn't match the resource's intent but only because we haven't yet tried.
 *   A resource with lastHandlerRun NEW would always have HAS_UPDATE as the compliance value.
 * - `non_compliant → "NON_COMPLIANT"` — Derived from a handler failure with 1 exception.
 *   Report-only resources will get this state assigned as well because they are not allowed to enforce their intent.
 * - `undefined → "UNDEFINED"` — Special form of HAS_UPDATE. Intent of the resource is unknown, these won't be sent to the handler. Results in resource being BLOCKED.
 *
 * Keys are the lowercase filter strings; values are the uppercase API enum values.
 */
export const COMPLIANCE = {
  compliant: "COMPLIANT",
  has_update: "HAS_UPDATE",
  non_compliant: "NON_COMPLIANT",
  undefined: "UNDEFINED",
} as const;

/**
 * Indicates whether execution of the resource handler is blocked. Heavily tied to UNDEFINED compliance.
 *
 * - `blocked → "BLOCKED"` — The resource cannot currently be processed.
 * - `not_blocked → "NOT_BLOCKED"` — The resource can be processed normally.
 * - `temporarily_blocked → "TEMPORARILY_BLOCKED"` — The resource is blocked but may become unblocked automatically.
 *
 * Keys are the lowercase filter strings; values are the uppercase API enum values.
 */
export const BLOCKED = {
  blocked: "BLOCKED",
  not_blocked: "NOT_BLOCKED",
  temporarily_blocked: "TEMPORARILY_BLOCKED",
} as const;

export type LastHandlerRunKey = keyof typeof LAST_HANDLER_RUN;
export type LastHandlerRunValue = (typeof LAST_HANDLER_RUN)[LastHandlerRunKey];

export type ComplianceKey = keyof typeof COMPLIANCE;
export type ComplianceValue = (typeof COMPLIANCE)[ComplianceKey];

export type BlockedKey = keyof typeof BLOCKED;
export type BlockedValue = (typeof BLOCKED)[BlockedKey];

/** Union of all compound state values across all three groups. */
export type CompoundState = LastHandlerRunValue | ComplianceValue | BlockedValue;

/** Union of all lowercase compound state keys. Used to key colorConfig, statusPriority, etc. */
export type CompoundStateKey = LastHandlerRunKey | ComplianceKey | BlockedKey;

/**
 * The three compound state groups returned in the resourceSummary API response.
 * Each group maps its lowercase status keys to a resource count.
 */
export interface CompoundStateSummary {
  lastHandlerRun: Record<LastHandlerRunKey, number>;
  compliance: Record<ComplianceKey, number>;
  blocked: Record<BlockedKey, number>;
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
  lastHandlerRun: LastHandlerRunValue;
  compliance: ComplianceValue;
  blocked: BlockedValue;
}

/**
 * A resource as returned by the API, wrapped in a GraphQL-style node structure.
 * Use {@link Resource} when the node wrapper has already been unwrapped.
 *
 * @prop {string} resourceId - Unique identifier for the resource.
 * @prop {string} resourceType - The type of the resource (e.g. "frontend_model::resource_states::ResourceStateResource").
 * @prop {string} agent - The agent responsible for managing this resource.
 * @prop {string} resourceIdValue - The human-readable name/value of the resource id.
 * @prop {number} requiresLength - Number of other resources this resource depends on.
 * @prop {ResourceState} state - State fields of a resource. See {@link ResourceState}.
 */
export interface RawResource {
  node: {
    resourceId: string;
    resourceType: string;
    agent: string;
    resourceIdValue: string;
    requiresLength: number;
    state: ResourceState;
  };
}

/** Unwrapped resource node — default for use after unwrapping the API response. */
export type Resource = RawResource["node"];

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

/**
 * Interface for filtering resources
 */
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

export const STATUS_SORT_KEYS = ["blocked", "compliance", "lastHandlerRun", "isDeploying"] as const;

export type StatusSortKey = (typeof STATUS_SORT_KEYS)[number];

export type SortKey = "agent" | "resource_type" | "resource_id_value" | StatusSortKey;

const STATUS_SORT_KEY_SET: ReadonlySet<string> = new Set(STATUS_SORT_KEYS);

/**
 * Type guard that checks whether a given SortKey is a StatusSortKey.
 * Used to safely narrow sort keys to status-related keys.
 */
export const isStatusSortKey = (key: SortKey): key is StatusSortKey => STATUS_SORT_KEY_SET.has(key);

export type SortKeyFromVersion = Exclude<SortKey, StatusSortKey>;

export type FilterFromVersion = Omit<Filter, "status">;

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
