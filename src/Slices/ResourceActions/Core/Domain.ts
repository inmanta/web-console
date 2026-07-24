/**
 * A single log message attached to a resource action.
 *
 * Mirrors the message shape returned by the `get_resource_actions` API and is
 * identical to the messages exposed on the per-resource logs endpoint.
 */
export interface ResourceActionMessage {
  level: string;
  msg: string;
  args: unknown[];
  kwargs: Record<string, unknown>;
  timestamp: string;
}

/**
 * A resource action as returned by the `get_resource_actions` API
 * (`/api/v2/resource_actions`). Each entry represents one deployment (or other
 * action) of one or more resource versions.
 */
export interface ResourceAction {
  environment: string;
  version: number;
  resource_version_ids: string[];
  action_id: string;
  action: string;
  started: string;
  finished: string | null;
  messages: ResourceActionMessage[] | null;
  status: string | null;
  changes: Record<string, unknown> | null;
  change: string | null;
  send_event: boolean | null;
}

/**
 * Filters supported server-side by the `get_resource_actions` API.
 *
 * `outcome` holds the deploy outcomes (`change` values) to include; it is
 * translated to the API's `exclude_changes` parameter (the complement).
 *
 * Note: the API does not (yet) support filtering by deploy type (action) or
 * deploy reason. Those columns are displayed but not filterable until the
 * backend gains the corresponding query parameters.
 */
export interface ResourceActionFilter {
  resource_type?: string;
  agent?: string;
  value?: string;
  outcome?: string[];
}

/**
 * Possible values of the `change` field, i.e. the outcome of a deployment.
 */
export const changeTypes = ["nochange", "created", "purged", "updated"] as const;
