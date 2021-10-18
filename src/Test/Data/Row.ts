import { Row } from "@/Core";

export const a: Row = {
  id: { full: "instance_id_a", short: "id_a" },
  attributesSummary: {
    candidate: true,
    active: false,
    rollback: true,
  },
  attributes: {
    candidate: null,
    active: {
      a: 123,
      b: false,
    },
    rollback: null,
  },
  createdAt: {
    full: "January 8th 2021, 4:44:27 pm",
    relative: "17 hours ago",
  },
  updatedAt: {
    full: "January 8th 2021, 4:44:27 pm",
    relative: "17 hours ago",
  },
  version: 2,
  instanceSetStateTargets: [],
  environment: "env",
  service_entity: "entity",
  serviceIdentityValue: "instance1",
  deleted: false,
};

export const b: Row = {
  ...a,
  id: { full: "instance_id_b", short: "id_b" },
  serviceIdentityValue: "instance2",
};

export const c: Row = {
  ...a,
  id: { full: "instance_id_c", short: "id_c" },
  serviceIdentityValue: "instance3",
};
