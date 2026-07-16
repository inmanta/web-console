import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceOrderItem } from "@/Slices/Orders/Core/Types";
import { MockedDependencyProvider } from "@/Test";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { OrderInstanceLink } from "./OrderInstanceLink";

const baseRow: ServiceOrderItem = {
  instance_id: "3fa85f64-5717-4562-b3fc-2c963f66afa",
  service_entity: "basic-service",
  config: {},
  action: "create",
  status: {
    state: "completed",
    failure_type: null,
    reason: null,
    direct_dependencies: {},
    validation_compile_id: null,
    instance_state_label: null,
    service_identity_attribute_value: null,
    service_identity_display_name: null,
  },
};

function setup(row: ServiceOrderItem) {
  return (
    <TestMemoryRouter>
      <MockedDependencyProvider>
        <OrderInstanceLink row={row} />
      </MockedDependencyProvider>
    </TestMemoryRouter>
  );
}

test("GIVEN OrderInstanceLink WHEN no service identity is set THEN the raw instance_id is shown as a link", () => {
  render(setup(baseRow));

  expect(screen.getByRole("button", { name: baseRow.instance_id })).toBeVisible();
});

test("GIVEN OrderInstanceLink WHEN service_identity_display_name is set THEN it is shown instead of the raw instance_id", () => {
  const row: ServiceOrderItem = {
    ...baseRow,
    status: { ...baseRow.status, service_identity_display_name: "Parent 1" },
  };

  render(setup(row));

  expect(screen.getByRole("button", { name: "Parent 1" })).toBeVisible();
  expect(screen.queryByText(row.instance_id)).not.toBeInTheDocument();
});

test("GIVEN OrderInstanceLink WHEN only service_identity_attribute_value is set THEN it is shown instead of the raw instance_id", () => {
  const row: ServiceOrderItem = {
    ...baseRow,
    status: { ...baseRow.status, service_identity_attribute_value: "attribute-value" },
  };

  render(setup(row));

  expect(screen.getByRole("button", { name: "attribute-value" })).toBeVisible();
});

test("GIVEN OrderInstanceLink WHEN both service_identity_display_name and service_identity_attribute_value are set THEN the display name takes priority", () => {
  const row: ServiceOrderItem = {
    ...baseRow,
    status: {
      ...baseRow.status,
      service_identity_display_name: "Display Name",
      service_identity_attribute_value: "attribute-value",
    },
  };

  render(setup(row));

  expect(screen.getByRole("button", { name: "Display Name" })).toBeVisible();
  expect(screen.queryByText("attribute-value")).not.toBeInTheDocument();
});

test("GIVEN OrderInstanceLink WHEN a create order item failed before the instance was created THEN the display name is shown as plain text with a warning icon, not a link", () => {
  const row: ServiceOrderItem = {
    ...baseRow,
    action: "create",
    status: {
      ...baseRow.status,
      failure_type: "INVALID_ORDER_ITEM",
      service_identity_display_name: "Parent 1",
    },
  };

  render(setup(row));

  expect(screen.queryByRole("button", { name: "Parent 1" })).not.toBeInTheDocument();
  expect(screen.getByText("Parent 1")).toBeVisible();
});

test("GIVEN OrderInstanceLink WHEN a display name is set THEN copy to clipboard offers both the display name and the raw instance_id", async () => {
  const row: ServiceOrderItem = {
    ...baseRow,
    status: { ...baseRow.status, service_identity_display_name: "Parent 1" },
  };

  render(setup(row));

  await userEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));

  expect(await screen.findByRole("menuitem", { name: "Parent 1" })).toBeVisible();
  expect(await screen.findByRole("menuitem", { name: row.instance_id })).toBeVisible();
});
