import { Row } from "@/Core";

const Id = (id: string) => ({ full: id, short: id });

export const base: Row = {
  id: Id("0001"),
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
};

export const row2: Row = {
  ...base,
  id: Id("0002"),
  serviceIdentityValue: "instance2",
};

export const row3: Row = {
  ...base,
  id: Id("0003"),
  serviceIdentityValue: "instance3",
};

export const rows = [base, row2];
