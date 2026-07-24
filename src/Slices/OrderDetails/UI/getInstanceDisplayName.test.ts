import { ServiceOrderItem } from "@/Slices/Orders/Core/Types";
import { getInstanceDisplayName } from "./getInstanceDisplayName";

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

test("GIVEN getInstanceDisplayName WHEN row is undefined THEN it returns null", () => {
  expect(getInstanceDisplayName(undefined)).toBeNull();
});

test("GIVEN getInstanceDisplayName WHEN neither service identity field is set THEN it returns null", () => {
  expect(getInstanceDisplayName(baseRow)).toBeNull();
});

test("GIVEN getInstanceDisplayName WHEN service_identity_attribute_value is set THEN it returns the attribute value", () => {
  const row: ServiceOrderItem = {
    ...baseRow,
    status: { ...baseRow.status, service_identity_attribute_value: "attribute-value" },
  };

  expect(getInstanceDisplayName(row)).toBe("attribute-value");
});

test("GIVEN getInstanceDisplayName WHEN only service_identity_display_name is set THEN it returns null, not the display name (regression)", () => {
  const row: ServiceOrderItem = {
    ...baseRow,
    status: { ...baseRow.status, service_identity_display_name: "Parent 1" },
  };

  expect(getInstanceDisplayName(row)).toBeNull();
});

test("GIVEN getInstanceDisplayName WHEN both service_identity_display_name and service_identity_attribute_value are set THEN it returns the attribute value, not the display name (regression)", () => {
  const row: ServiceOrderItem = {
    ...baseRow,
    status: {
      ...baseRow.status,
      service_identity_display_name: "Display Name",
      service_identity_attribute_value: "attribute-value",
    },
  };

  expect(getInstanceDisplayName(row)).toBe("attribute-value");
});
