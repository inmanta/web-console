import { Pagination } from "@/Core/Domain/Pagination";
import { isObject, ParsedNumber } from "@/Core/Language";
import { Blocked, Compliance, HandlerResult } from "@/Data/Apollo/gql/graphql";
import type {
  GetDashboardResourceSummaryQuery,
  ResourceTableRow_FragmentFragment,
} from "@/Data/Apollo/gql/graphql";

/**
 * --- General explanation of compound state ---
 * Old status field for resources had 1 big flaw which was that it hid information:
 * - Did it deploy successfully in the past?
 * - Is the intent correctly enforced?
 * In short, more information should be available about a resource now in comparison to before.
 * See {@link ResourceState} for details about resource state fields.
 * See {@link CompoundState} for details about the compound state values.
 *
 * The types below are derived from the GraphQL codegen output (src/Data/Apollo/gql), so they follow the API schema.
 */

/**
 * Maps the lowercase form of every value of a generated GraphQL enum to the value itself.
 *
 * @example toKeyMap(Blocked) // { blocked: "BLOCKED", not_blocked: "NOT_BLOCKED", temporarily_blocked: "TEMPORARILY_BLOCKED" }
 */
const toKeyMap = <State extends string>(states: Record<string, State>) =>
  Object.fromEntries(Object.values(states).map((state) => [state.toLowerCase(), state])) as {
    [Key in State as Lowercase<Key>]: Key;
  };

/**
 * Result of the last handler execution for a resource. More of a health check because it is not supposed to fail.
 *
 * - `failed → "FAILED"`: Something went wrong in the handler execution. This could be a communication error with a device or an uncaught exception in the handler code.
 * - `skipped → "SKIPPED"`: Handler decided that the resource is not ready to be processed by it. Most common reason for handler deciding to skip is that one of
 *   its dependencies is in a failed state.
 * - `successful → "SUCCESSFUL"`: Handler finishes its run successfully, handler succeeded to enforce the resource's intent in the real world.
 * - `new → "NEW"`: Handler has never finished run for this resource yet. Perhaps because it's waiting in queue, perhaps it is running at this very moment but it takes a while.
 *
 * Keys are the lowercase filter strings; values are the generated HandlerResult enum values.
 */
export const LAST_HANDLER_RUN = toKeyMap(HandlerResult);

/**
 * Indicates whether the real-world state matches the intended configuration. Is about intent being reflected in the real world.
 *
 * - `compliant → "COMPLIANT"`: Derived from a successful handler result. May be overwritten when the intent is updated.
 * - `has_update → "HAS_UPDATE"`: The intent for this resource has received an update since the last handler run.
 *   Special form of non-compliance; the real world doesn't match the resource's intent but only because we haven't yet tried.
 *   A resource with lastHandlerRun NEW would always have HAS_UPDATE as the compliance value.
 * - `non_compliant → "NON_COMPLIANT"`: Derived from a handler failure with 1 exception.
 *   Report-only resources will get this state assigned as well because they are not allowed to enforce their intent.
 * - `undefined → "UNDEFINED"`: Special form of HAS_UPDATE. Intent of the resource is unknown, these won't be sent to the handler. Results in resource being BLOCKED.
 *
 * Keys are the lowercase filter strings; values are the generated Compliance enum values.
 */
export const COMPLIANCE = toKeyMap(Compliance);

/**
 * Indicates whether execution of the resource handler is blocked. Heavily tied to UNDEFINED compliance.
 *
 * - `blocked → "BLOCKED"`: The resource cannot currently be processed.
 * - `not_blocked → "NOT_BLOCKED"`: The resource can be processed normally.
 * - `temporarily_blocked → "TEMPORARILY_BLOCKED"`: The resource is blocked but may become unblocked automatically.
 *
 * Keys are the lowercase filter strings; values are the generated Blocked enum values.
 */
export const BLOCKED = toKeyMap(Blocked);

export type LastHandlerRunKey = keyof typeof LAST_HANDLER_RUN;
export type LastHandlerRunValue = HandlerResult;

export type ComplianceKey = keyof typeof COMPLIANCE;
export type ComplianceValue = Compliance;

export type BlockedKey = keyof typeof BLOCKED;
export type BlockedValue = Blocked;

/** Union of all compound state values across all three groups. */
export type CompoundState = LastHandlerRunValue | ComplianceValue | BlockedValue;

/** Union of all lowercase compound state keys. Used to key colorConfig, statusPriority, etc. */
export type CompoundStateKey = LastHandlerRunKey | ComplianceKey | BlockedKey;

const compoundStates = new Set<string>([
  ...Object.values(HandlerResult),
  ...Object.values(Compliance),
  ...Object.values(Blocked),
]);

/** Whether a string is one of the compound state values. */
const isCompoundState = (value: string): value is CompoundState => compoundStates.has(value);

/**
 * Narrows a state string from the API to a compound state. The schema types some states as plain strings,
 * so an unknown value gives undefined instead of an invalid state.
 *
 * @example
 * toCompoundState("FAILED") // "FAILED"
 * toCompoundState("SOMETHING_ELSE") // undefined
 */
export const toCompoundState = (value: string | null | undefined): CompoundState | undefined =>
  value && isCompoundState(value) ? value : undefined;

/**
 * The three compound state groups of the resource summary.
 * Each group maps its lowercase status keys to a resource count.
 */
export interface CompoundStateSummary {
  lastHandlerRun: Record<LastHandlerRunKey, number>;
  compliance: Record<ComplianceKey, number>;
  blocked: Record<BlockedKey, number>;
}

/**
 * Resource summary with typed counts, built from the API response with {@link toResourceSummary}.
 * Extends {@link CompoundStateSummary} with deployment counts and a total.
 */
export interface ResourceSummary extends CompoundStateSummary {
  totalCount: number;
  isDeploying: { true: number; false: number };
}

/** The resource summary as the API returns it. The schema types the counts as JSON, so they are unknown. */
export type RawResourceSummary = Omit<
  GetDashboardResourceSummaryQuery["resourceSummary"],
  "__typename"
>;

/**
 * Reads a count for every key from a JSON object, with 0 for a missing or non-numeric count.
 *
 * @example toCounts(["true", "false"], { true: 2 }) // { true: 2, false: 0 }
 */
const toCounts = <Key extends string>(keys: Key[], json: unknown) =>
  Object.fromEntries(
    keys.map((key) => {
      const count = isObject(json) ? json[key] : undefined;

      return [key, typeof count === "number" ? count : 0];
    })
  ) as Record<Key, number>;

/**
 * Turns the resource summary from the API into a {@link ResourceSummary} with a count for every state.
 *
 * @example
 * toResourceSummary({ totalCount: 3, isDeploying: { true: 1 }, lastHandlerRun: { failed: 3 }, compliance: {}, blocked: {} })
 * // { totalCount: 3, isDeploying: { true: 1, false: 0 }, lastHandlerRun: { failed: 3, new: 0, skipped: 0, successful: 0 }, ... }
 */
export const toResourceSummary = ({
  totalCount,
  isDeploying,
  lastHandlerRun,
  compliance,
  blocked,
}: RawResourceSummary): ResourceSummary => ({
  totalCount,
  isDeploying: toCounts(["true", "false"], isDeploying),
  lastHandlerRun: toCounts(Object.keys(LAST_HANDLER_RUN) as LastHandlerRunKey[], lastHandlerRun),
  compliance: toCounts(Object.keys(COMPLIANCE) as ComplianceKey[], compliance),
  blocked: toCounts(Object.keys(BLOCKED) as BlockedKey[], blocked),
});

/**
 * A resource with its state, as the resources table selects it through ResourceTableRow_Fragment.
 * The schema types lastHandlerRun and blocked as plain strings, narrow them with {@link toCompoundState}.
 */
export type Resource = ResourceTableRow_FragmentFragment;

/**
 * State fields of a resource: whether it is deploying or an orphan (no longer part of the latest intent),
 * when a handler last processed it, and its compound state.
 */
export type ResourceState = NonNullable<Resource["state"]>;

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

/**
 * Whether a resource details status marks it as an orphan - no longer part of the latest intent
 * (see {@link ResourceState.isOrphan}).
 */
export const isOrphanedStatus = (status: string): boolean => status === "orphaned";

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

export interface VersionedDetails extends BaseDetails {
  version: ParsedNumber;
  resource_version_id: string;
}

/**
 * Interface for filtering resources
 */
export interface Filter {
  type?: string[];
  agent?: string[];
  value?: string[];
  status?: string[];
  serviceEntity?: string[];
  serviceInstance?: string[];
  includeOwned?: boolean;
}

/**
 * Encodes a `serviceInstance` filter value from an instance id and optional label as JSON, so the
 * label can contain any character without colliding with a separator. Falls back to the id as label.
 *
 * @example encodeServiceInstanceFilterValue("abc", "cpe-1") => '{"id":"abc","label":"cpe-1"}'
 * @example encodeServiceInstanceFilterValue("abc") => '{"id":"abc","label":"abc"}'
 */
export const encodeServiceInstanceFilterValue = (id: string, label?: string): string =>
  JSON.stringify({ id, label: label ?? id });

/**
 * Decodes a `serviceInstance` filter value back into its id and display label.
 *
 * @example parseServiceInstanceFilterValue('{"id":"abc","label":"cpe-1"}') => { id: "abc", label: "cpe-1" }
 * @example parseServiceInstanceFilterValue('{"id":"abc","label":"abc"}') => { id: "abc", label: "abc" }
 */
export const parseServiceInstanceFilterValue = (value: string): { id: string; label: string } =>
  JSON.parse(value);

export interface FilterWithDefaultHandling extends Filter {
  disregardDefault?: boolean;
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

export type FilterFromVersion = Omit<
  Filter,
  "status" | "serviceEntity" | "serviceInstance" | "includeOwned"
>;

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

  public static parse(idStr: string): Id | undefined {
    const groups = idStr.match(IdParser.parseIdRegex)?.groups;

    if (!groups) {
      return undefined;
    }

    return {
      entityType: groups.type,
      agentName: groups.hostname,
      attribute: groups.attr,
      attributeValue: groups.value,
    };
  }

  public static getAgentName(idStr: string): Id["agentName"] | undefined {
    return IdParser.parse(idStr)?.agentName;
  }
}
