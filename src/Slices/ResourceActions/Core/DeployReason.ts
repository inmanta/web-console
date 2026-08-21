import { ResourceAction } from "./Domain";

export type DeployReasonKind = "event" | "timer" | "operator" | "release" | "unknown";

/**
 * The human-readable reason string carried by a resource action, if any.
 *
 * The orchestrator records the reason of a deploy in the `reason` kwarg of one
 * of the action's log messages (typically the "Start run because ..." message).
 *
 * @param {ResourceAction} action - The resource action.
 * @returns {string | undefined} The raw reason string, or undefined.
 */
export const getDeployReasonText = (action: ResourceAction): string | undefined => {
  const message = (action.messages ?? []).find((msg) => typeof msg.kwargs?.reason === "string");

  return message ? (message.kwargs.reason as string) : undefined;
};

/**
 * Classifies a resource action into a coarse deploy-reason category, used to
 * pick an icon for the changelog table.
 *
 * @param {ResourceAction} action - The resource action.
 * @returns {DeployReasonKind} The classified reason.
 */
export const classifyDeployReason = (action: ResourceAction): DeployReasonKind => {
  const reason = getDeployReasonText(action)?.toLowerCase();

  if (!reason) {
    return "unknown";
  }

  if (reason.includes("new version") || reason.includes("released")) {
    return "release";
  }

  if (reason.includes("event")) {
    return "event";
  }

  if (
    reason.includes("more than") ||
    reason.includes("interval") ||
    reason.includes("repair") ||
    reason.includes("periodic")
  ) {
    return "timer";
  }

  if (
    reason.includes("user") ||
    reason.includes("operator") ||
    reason.includes("manual") ||
    reason.includes("call to trigger") ||
    reason.includes("triggered")
  ) {
    return "operator";
  }

  return "unknown";
};
