import React from "react";
import { render, screen } from "@testing-library/react";
import { AttributeModel } from "@/Core";
import { Service } from "@/Test";
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
  render(
    <AttributeTable
      service={{ ...Service.a, attributes: [], embedded_entities: [] }}
    />
  );
  expect(screen.getByText("No attributes found for the service")).toBeVisible();
});

test("GIVEN AttributeTable WHEN passed 1 attribute THEN 1 row is shown", async () => {
  render(
    <AttributeTable
      service={{
        ...Service.a,
        attributes: [attribute1],
        embedded_entities: [],
      }}
    />
  );
  expect(
    await screen.findByRole("row", { name: "Row-order_id" })
  ).toBeVisible();
});

test("GIVEN AttributeTable WHEN passed 2 attributes THEN 2 rows are shown", async () => {
  render(
    <AttributeTable
      service={{
        ...Service.a,
        attributes: [attribute1, attribute2],
        embedded_entities: [],
      }}
    />
  );

  expect(
    await screen.findByRole("row", { name: "Row-order_id" })
  ).toBeVisible();
  expect(
    await screen.findByRole("row", { name: "Row-service_mtu" })
  ).toBeVisible();
});
