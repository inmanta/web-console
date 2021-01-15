import { Row } from "@app/Views/Inventory/RowPresenter";

export const base: Row = {
  id: "0001",
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
  id: "0002",
};

export const row3: Row = {
  ...base,
  id: "0003",
};

export const rows = [base, row2];
