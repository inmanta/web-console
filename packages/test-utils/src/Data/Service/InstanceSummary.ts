import { InstanceSummary } from "@inmanta/web-console-core";

export const a: InstanceSummary = {
  by_label: {
    no_label: 2,
    success: 2,
    info: 2,
    warning: 2,
    danger: 2,
  },
  by_state: {},
  total: 10,
};

/**
 * Instance counts for the `State.withEachLabel` lifecycle, with instances in every state but
 * `rejected`.
 */
export const withEachLabel: InstanceSummary = {
  by_label: {
    no_label: 1,
    success: 4,
    info: 3,
    warning: 0,
    danger: 2,
  },
  by_state: { start: 1, creating: 1, update_inprogress: 2, up: 4, rejected: 0, failed: 2 },
  total: 10,
};
