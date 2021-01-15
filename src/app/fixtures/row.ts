import { Row } from "@app/Views/Inventory/RowPresenter";

export const base: Row = {
  id: "1234",
  state: "rejected",
};

export const row2: Row = {
  ...base,
  id: "2345",
};

export const rows = [base, row2];
