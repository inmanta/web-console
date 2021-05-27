import { StateModel } from "@/Core";

export const a: StateModel = {
  name: "start",
  label: "info",
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

export const b: StateModel = {
  name: "creating",
  label: "info",
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

export const c: StateModel = {
  name: "acknowledged",
  label: "info",
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

export const d: StateModel = {
  name: "rejected",
  label: "warning",
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

export const e: StateModel = {
  name: "terminated",
  label: "warning",
  export_resources: false,
  purge_resources: false,
  deleted: true,
};

export const list = [a, b, c, d, e];
