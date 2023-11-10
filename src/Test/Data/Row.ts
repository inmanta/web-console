import { Row } from "@/Core";

export const a: Row = {
  id: { full: "service_instance_id_a", short: "id_a" },
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
  createdAt: "2021-01-11T12:55:25.961567",
  updatedAt: "2021-01-11T12:55:25.961567",
  version: 2,
  instanceSetStateTargets: [],
  environment: "env",
  service_entity: "entity",
  serviceIdentityValue: "instance1",
  deleted: false,
};

export const b: Row = {
  ...a,
  id: { full: "service_instance_id_b", short: "id_b" },
  serviceIdentityValue: "instance2",
};

export const c: Row = {
  ...a,
  id: { full: "service_instance_id_c", short: "id_c" },
  serviceIdentityValue: "instance3",
};
