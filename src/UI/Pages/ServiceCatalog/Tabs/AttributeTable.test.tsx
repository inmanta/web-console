import React from "react";
import { render, screen, within } from "@testing-library/react";
import { AttributeModel } from "@/Core";
import { AttributeTable } from "./AttributeTable";

const attribute1: AttributeModel = {
  name: "order_id",
  type: "int",
  description: "The order ID of the service",
  modifier: "rw",
  default_value_set: false,
  default_value: null,
};

const attribute2: AttributeModel = {
  name: "service_mtu",
  type: "int",
  description: "The MTU that must be configured at the service provider",
  modifier: "rw",
  default_value_set: false,
  default_value: null,
};

test("GIVEN AttributeTable WHEN passed no attributes THEN the empty container is shown", () => {
  render(<AttributeTable attributes={[]} />);
  expect(screen.getByText("No attributes found for the service")).toBeVisible();
});

test("GIVEN AttributeTable WHEN passed 1 attribute THEN 1 row is shown", () => {
  render(<AttributeTable attributes={[attribute1]} />);
  const body = screen.getByRole("rowgroup", { name: "TableBody" });
  const rows = within(body).getAllByRole("row");
  expect(rows.length).toEqual(1);
});

test("GIVEN AttributeTable WHEN passed 2 attributes THEN 2 rows are shown", () => {
  render(<AttributeTable attributes={[attribute1, attribute2]} />);
  const body = screen.getByRole("rowgroup", { name: "TableBody" });
  const rows = within(body).getAllByRole("row");
  expect(rows.length).toEqual(2);
});
