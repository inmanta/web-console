import { StateModel } from '@/Core';

const a: StateModel = {
  name: 'start',
  label: 'info',
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

const b: StateModel = {
  name: 'creating',
  label: 'info',
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

const c: StateModel = {
  name: 'acknowledged',
  label: 'info',
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

const d: StateModel = {
  name: 'rejected',
  label: 'warning',
  export_resources: false,
  purge_resources: false,
  deleted: false,
};

const e: StateModel = {
  name: 'terminated',
  label: 'warning',
  export_resources: false,
  purge_resources: false,
  deleted: true,
};

export const list = [a, b, c, d, e];

export const nestedEditable: StateModel[] = [
  {
    name: 'a',
    label: 'success',
    export_resources: false,
    validate_self: null,
    validate_others: null,
    purge_resources: false,
    deleted: false,
    values: {},
  },
  {
    name: 'b',
    label: 'success',
    export_resources: false,
    validate_self: null,
    validate_others: null,
    purge_resources: false,
    deleted: false,
    values: {},
  },
  {
    name: 'c',
    label: 'info',
    export_resources: false,
    validate_self: null,
    validate_others: null,
    purge_resources: false,
    deleted: true,
    values: {},
  },
];
