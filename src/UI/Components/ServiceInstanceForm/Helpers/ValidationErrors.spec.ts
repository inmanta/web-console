import {
  getAttributeValidationErrors,
  getChangedAttributeNames,
  isAtOrBelow,
  isAttributeValidationFailure,
} from "./ValidationErrors";

// The start of LSM's message for a create with invalid attributes; the form reads the details only.
const message = "Invalid request: 3 validation errors for Svc\nvlan_id\n  ...";

const attributeDetails = {
  attribute_validation_errors: [
    {
      type: "less_than_equal",
      loc: ["vlan_id"],
      msg: "Input should be less than or equal to 4094",
    },
    { type: "int_type", loc: ["endpoint", 1, "port"], msg: "Input should be a valid integer" },
    { type: "extra_forbidden", loc: ["bogus"], msg: "Extra inputs are not permitted" },
  ],
};

// Core's own argument validation of a malformed request, which is not about the attributes.
const argumentDetails = {
  validation_errors: [
    { type: "dict_type", loc: ["attributes"], msg: "Input should be a valid dictionary" },
  ],
};

test("GIVEN getAttributeValidationErrors WHEN the server returns attribute_validation_errors THEN they are used", () => {
  expect(
    getAttributeValidationErrors({ name: "Error", message, details: attributeDetails })
  ).toEqual([
    { path: "vlan_id", message: "Input should be less than or equal to 4094" },
    { path: "endpoint.1.port", message: "Input should be a valid integer" },
    { path: "bogus", message: "Extra inputs are not permitted" },
  ]);
});

test("GIVEN getAttributeValidationErrors WHEN the server returns no attribute_validation_errors THEN it returns none", () => {
  expect(getAttributeValidationErrors(new Error(message))).toEqual([]);
  expect(
    getAttributeValidationErrors({ name: "Error", message, details: argumentDetails })
  ).toEqual([]);
});

test("GIVEN isAttributeValidationFailure THEN it is true only when the server returns attribute_validation_errors", () => {
  expect(isAttributeValidationFailure({ name: "Error", message, details: attributeDetails })).toBe(
    true
  );
  expect(isAttributeValidationFailure(new Error(message))).toBe(false);
  expect(isAttributeValidationFailure({ name: "Error", message, details: argumentDetails })).toBe(
    false
  );
});

test("GIVEN getChangedAttributeNames THEN it returns the top-level attributes that differ in either state", () => {
  const before = { vlan_id: 1, endpoint: [{ port: 1 }], removed: "a" };
  const after = { vlan_id: 1, endpoint: [{ port: 2 }], added: "b" };

  expect(getChangedAttributeNames(before, after)).toEqual(["endpoint", "removed", "added"]);
  expect(getChangedAttributeNames(before, { ...before })).toEqual([]);
});

test("GIVEN isAtOrBelow THEN it matches the path itself and its descendants only", () => {
  expect(isAtOrBelow("endpoint", "endpoint")).toBe(true);
  expect(isAtOrBelow("endpoint.1.port", "endpoint")).toBe(true);
  expect(isAtOrBelow("endpoints", "endpoint")).toBe(false);
});
