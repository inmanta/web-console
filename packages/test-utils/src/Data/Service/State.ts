import { StateModel } from "@inmanta/web-console-core";

const a: StateModel = {
  name: "start",
  label: "info",
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

const b: StateModel = {
  name: "creating",
  label: "info",
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

const c: StateModel = {
  name: "acknowledged",
  label: "info",
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

const d: StateModel = {
  name: "rejected",
  label: "warning",
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

const e: StateModel = {
  name: "terminated",
  label: "warning",
  export_resources: false,
  purge_resources: false,
  deleted: true,
};

export const list = [a, b, c, d, e];

/**
 * A state carrying `web_label` / `web_icon` / `web_description` (issue #7094),
 * mirroring the example seeded on the `basic-service` dev model's `creating` state.
 */
export const withAnnotations: StateModel = {
  name: "creating",
  export_resources: false,
  purge_resources: false,
  deleted: false,
  annotations: {
    web_label: "Creating",
    web_icon: "FaCogs",
    web_description: "The service is being deployed for the first time.",
  },
};

/**
 * A lifecycle with a state for every label, one unlabeled state, and two info states of which
 * only one has a `web_label`.
 */
export const withEachLabel: StateModel[] = [
  { ...a, label: null },
  { ...b, annotations: { web_label: "Creating" } },
  { ...a, name: "update_inprogress" },
  { ...a, name: "up", label: "success", annotations: { web_label: "Up" } },
  d,
  { ...a, name: "failed", label: "danger", annotations: { web_label: "Failed" } },
];

export const nestedEditable: StateModel[] = [
  {
    name: "a",
    label: "success",
    export_resources: false,
    validate_self: null,
    validate_others: null,
    purge_resources: false,
    deleted: false,
    values: {},
  },
  {
    name: "b",
    label: "success",
    export_resources: false,
    validate_self: null,
    validate_others: null,
    purge_resources: false,
    deleted: false,
    values: {},
  },
  {
    name: "c",
    label: "info",
    export_resources: false,
    validate_self: null,
    validate_others: null,
    purge_resources: false,
    deleted: true,
    values: {},
  },
];
