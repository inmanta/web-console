import { Row } from "UserInterface/Inventory/TablePresenter";

const Id = (id: string) => ({ full: id, short: id });

export const base: Row = {
  id: Id("0001"),
  state: "rejected",
  attributes: {
    candidate: true,
    active: false,
    rollback: true,
  },
  createdAt: {
    full: "January 8th 2021, 4:44:27 pm",
    relative: "17 hours ago",
  },
  updatedAt: {
    full: "January 8th 2021, 4:44:27 pm",
    relative: "17 hours ago",
  },
};

export const row2: Row = {
  ...base,
  id: Id("0002"),
};

export const row3: Row = {
  ...base,
  id: Id("0003"),
};

export const rows = [base, row2];
