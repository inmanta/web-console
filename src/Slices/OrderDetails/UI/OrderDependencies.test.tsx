import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ServiceOrderItem } from "@/Slices/Orders/Core/Types";
import { OrderDependencies } from "./OrderDependencies";

const dependencyItem: ServiceOrderItem = {
  instance_id: "3fa85f64-5717-4562-b3fc-2c963f66afa",
  service_entity: "child-service",
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

test("GIVEN OrderDependencies WHEN the matching order item has no service identity THEN the raw instance_id is shown", () => {
  render(
    <OrderDependencies
      dependencies={{ [dependencyItem.instance_id]: "completed" }}
      orderItems={[dependencyItem]}
    />
  );

  expect(screen.getByText(dependencyItem.instance_id)).toBeVisible();
});

test("GIVEN OrderDependencies WHEN the matching order item has a service_identity_display_name THEN it is shown instead of the raw instance_id", () => {
  const item: ServiceOrderItem = {
    ...dependencyItem,
    status: { ...dependencyItem.status, service_identity_display_name: "Parent 1" },
  };

  render(
    <OrderDependencies dependencies={{ [item.instance_id]: "completed" }} orderItems={[item]} />
  );

  expect(screen.getByText("Parent 1")).toBeVisible();
  expect(screen.queryByText(item.instance_id)).not.toBeInTheDocument();
});

test("GIVEN OrderDependencies WHEN no order item matches the dependency's instance_id THEN the raw instance_id is shown", () => {
  render(
    <OrderDependencies dependencies={{ "unknown-instance-id": "completed" }} orderItems={[]} />
  );

  expect(screen.getByText("unknown-instance-id")).toBeVisible();
});

test("GIVEN OrderDependencies WHEN a display name is set THEN copy to clipboard offers both the display name and the raw instance_id", async () => {
  const item: ServiceOrderItem = {
    ...dependencyItem,
    status: { ...dependencyItem.status, service_identity_display_name: "Parent 1" },
  };

  render(
    <OrderDependencies dependencies={{ [item.instance_id]: "completed" }} orderItems={[item]} />
  );

  await userEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));

  expect(await screen.findByRole("menuitem", { name: "Parent 1" })).toBeVisible();
  expect(await screen.findByRole("menuitem", { name: item.instance_id })).toBeVisible();
});
