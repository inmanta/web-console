import { StateModel } from "@/Core";

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
