import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { AttributeModel, ServiceModel } from "@/Core";
import { MockedDependencyProvider, Service } from "@/Test";
import { multiNestedEditable } from "@/Test/Data/Service/EmbeddedEntity";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { AttributeTable } from "./AttributeTable";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

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

function setup(service: ServiceModel) {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <AttributeTable service={service} />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return component;
}

test("GIVEN AttributeTable WHEN passed no attributes THEN the empty container is shown", async () => {
  const component = setup({
    ...Service.a,
    attributes: [],
    embedded_entities: [],
  });

  render(component);
  expect(screen.getByText("No attributes found for the service")).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN AttributeTable WHEN passed 1 attribute THEN 1 row is shown", async () => {
  const component = setup({
    ...Service.a,
    attributes: [attribute1],
    embedded_entities: [],
  });

  render(component);

  expect(await screen.findByRole("row", { name: "Row-order_id" })).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN AttributeTable WHEN passed 2 attributes THEN 2 rows are shown", async () => {
  const component = setup({
    ...Service.a,
    attributes: [attribute1, attribute2],
    embedded_entities: [],
  });

  render(component);

  expect(await screen.findByRole("row", { name: "Row-order_id" })).toBeVisible();
  expect(await screen.findByRole("row", { name: "Row-service_mtu" })).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN AttributeTable WHEN passed no attributes but some embedded entities THEN the rows are shown", async () => {
  const component = setup({
    ...Service.a,
    attributes: [],
  });

  render(component);

  expect(await screen.findByRole("row", { name: "Row-circuits" })).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN AttributeTable WHEN passed 2 attributes THEN 2 rows are shown", async () => {
  const component = setup({
    ...Service.a,
    attributes: [attribute1, attribute2],
    embedded_entities: [],
  });

  render(component);

  expect(await screen.findByRole("row", { name: "Row-order_id" })).toBeVisible();
  expect(await screen.findByRole("row", { name: "Row-service_mtu" })).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN AttributeTable WHEN passed embedded attributes THEN expendable rows are shown and availalbe to expand/collapse one", async () => {
  const component = setup({
    ...Service.a,
    name: "service_name_a",
    embedded_entities: multiNestedEditable,
  });

  render(component);

  //default embedded entity
  expect(await screen.findByRole("row", { name: "Row-bandwidth" })).toBeVisible();

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

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
