import { Pagination } from "@/Core/Domain/Pagination";
import { Maybe, ParsedNumber } from "@/Core/Language";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { PageSize } from "../PageSize";
import { Sort } from "../Sort";

/**
 * --- General explanation of compound state ---
 * Old status field for resources had 1 big flaw which was that it hid information:
 * - Did it deploy succesfully in the past?
 * - Is the intent correctly enforced?
 * In short, more information should be available about a resource now in comparison to before.
 * See {@link ResourceState} for details about resource state fields.
 * See {@link CompoundState} for details about the compound state values.
 */

/**
 * Result of the last handler execution for a resource. More of a health check because it is not supposed to fail.
 *
 * Possible values:
 * - `"FAILED"` — Something went wrong in the handler execution. This could be a communication error with a device or an uncaught exception in the handler code.
 * - `"SKIPPED"` — Handler decided that the resource is not ready to be processed by it. Most common reason for handler deciding to skip is that one of
 * it's dependencies is in a failed state. Imagine a resource wanting to write it's intent on a virtual machine but the virtual machine itself doesn't exist.
 * It can only write that intent on that machine once it exist, so it will decide to skip the processing of that resource.
 * - `"SUCCESSFUL"` — Handler finishes it's run successfully, handler succeeded to enfore the resource's intent in the real world.
 * - `"NEW"` — Handler has never finished run for this resource yet. Perhaps because it's waiting in queue, perhaps it is running at this very moment but it takes a while.
 *
 * These values match the uppercase values returned by the resource state API.
 */
export type LastHandlerRun = "FAILED" | "SKIPPED" | "SUCCESSFUL" | "NEW";

/**
 * Indicates whether the real-world state matches the intended configuration. Is about intent being reflected in the real world.
 *
 * Possible values:
 * - `"COMPLIANT"` — Derived from a successful handler result. May be overwritten when the intent is updated.
 * - `"NON_COMPLIANT"` — Derived from a handler failure with 1 exception.
 * Report only resources will get this state assigned to it as well because they are not allowed to enfore their intent (even if lastHandlerRun is successful).
 * - `"HAS_UPDATE"` — The intent for this resource has received an update since the last handler run.
 * Special form of non-compliance, the real world doesn't match the resource's intent but only because we haven't yet tried.
 * A Resource with lastHandlerRun NEW would always have HAS_UPDATE as the compliance value.
 * - `"UNDEFINED"` — Special form of HAS_UPDATE. Intent of the resource is unknown, these won't be send to the handler. Results in resource being BLOCKED.
 */
export type Compliance = "COMPLIANT" | "NON_COMPLIANT" | "HAS_UPDATE" | "UNDEFINED";

/**
 * Indicates whether execution of the resource handler is blocked. Heavily tied to UNDEFINED.
 *
 * Possible values:
 * - `"BLOCKED"` — The resource cannot currently be processed.
 * - `"NOT_BLOCKED"` — The resource can be processed normally.
 * - `"TEMPORARILY_BLOCKED"` — The resource is blocked but may become unblocked automatically.
 */
export type Blocked = "BLOCKED" | "NOT_BLOCKED" | "TEMPORARILY_BLOCKED";

/**
 * Union of all compound state values.
 * Combines {@link LastHandlerRun}, {@link Compliance}, and {@link Blocked}.
 */
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

export interface ResourceParams {
  sort?: Sort<SortKey>;
  filter?: Filter;
  pageSize: PageSize;
  currentPage: CurrentPage;
}

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
