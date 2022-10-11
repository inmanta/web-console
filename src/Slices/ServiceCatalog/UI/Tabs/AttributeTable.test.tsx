import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttributeModel } from "@/Core";
import { Service } from "@/Test";
import { multiNestedEditable } from "@/Test/Data/Service/EmbeddedEntity";
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
      scrollIntoView={jest.fn}
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
      scrollIntoView={jest.fn}
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
      scrollIntoView={jest.fn}
    />
  );

  expect(
    await screen.findByRole("row", { name: "Row-order_id" })
  ).toBeVisible();
  expect(
    await screen.findByRole("row", { name: "Row-service_mtu" })
  ).toBeVisible();
});

test("GIVEN AttributeTable WHEN passed no attributes but some embedded entities THEN the rows are shown", async () => {
  render(
    <AttributeTable
      service={{
        ...Service.a,
        attributes: [],
      }}
      scrollIntoView={jest.fn}
    />
  );

  expect(
    await screen.findByRole("row", { name: "Row-circuits" })
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
      scrollIntoView={jest.fn}
    />
  );

  expect(
    await screen.findByRole("row", { name: "Row-order_id" })
  ).toBeVisible();
  expect(
    await screen.findByRole("row", { name: "Row-service_mtu" })
  ).toBeVisible();
});

test("GIVEN AttributeTable WHEN passed embedded attributes THEN expendable rows are shown and availalbe to expand/collapse one", async () => {
  render(
    <AttributeTable
      service={{
        ...Service.a,
        name: "service_name_a",
        embedded_entities: multiNestedEditable,
      }}
      scrollIntoView={jest.fn}
    />
  );

  //default embedded entity
  expect(
    await screen.findByRole("row", { name: "Row-bandwidth" })
  ).toBeVisible();

  //scenario to expand and hide one child
  const toggleButton = await screen.findByRole("button", {
    name: "Toggle-embedded",
  });
  //show embedded entity
  await userEvent.click(toggleButton);
  const row = await screen.findByRole("row", {
    name: "Row-embedded$embedded_single",
  });

  expect(row).toBeVisible();
  //collapse embedded entity
  await userEvent.click(toggleButton);
  expect(row).not.toBeVisible();
});
