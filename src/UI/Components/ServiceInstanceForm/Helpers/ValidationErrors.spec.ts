import {
  getChangedAttributeNames,
  isAtOrBelow,
  isAttributeValidationFailure,
  parseValidationErrors,
} from "./ValidationErrors";

// Verbatim LSM 400 message for a create with invalid attributes (pydantic 2.13).
const message = `Invalid request: 4 validation errors for Svc
vlan_id
  Input should be less than or equal to 4094 [type=less_than_equal, input_value=5000, input_type=int]
    For further information visit https://errors.pydantic.dev/2.13/v/less_than_equal
ip
  Input is not a valid IPv4 address [type=ip_v4_address, input_value='10.0.0.300', input_type=str]
endpoint.1.port
  Input should be a valid integer [type=int_type, input_value='abc', input_type=str]
    For further information visit https://errors.pydantic.dev/2.13/v/int_type
bogus
  Extra inputs are not permitted [type=extra_forbidden, input_value=1, input_type=int]
    For further information visit https://errors.pydantic.dev/2.13/v/extra_forbidden`;

const expectedErrors = [
  { path: "vlan_id", message: "Input should be less than or equal to 4094" },
  { path: "ip", message: "Input is not a valid IPv4 address" },
  { path: "endpoint.1.port", message: "Input should be a valid integer" },
  { path: "bogus", message: "Extra inputs are not permitted" },
];

test("GIVEN parseValidationErrors WHEN the server returns structured validation_errors THEN they are used", () => {
  const details = {
    validation_errors: [
      {
        type: "less_than_equal",
        loc: ["vlan_id"],
        msg: "Input should be less than or equal to 4094",
      },
      { type: "ip_v4_address", loc: ["ip"], msg: "Input is not a valid IPv4 address" },
      { type: "int_type", loc: ["endpoint", 1, "port"], msg: "Input should be a valid integer" },
      { type: "extra_forbidden", loc: ["bogus"], msg: "Extra inputs are not permitted" },
    ],
  };

  expect(parseValidationErrors({ name: "Error", message, details })).toEqual({
    summary: "",
    errors: expectedErrors,
  });
});

test("GIVEN parseValidationErrors WHEN only the pydantic text is returned THEN it is parsed", () => {
  expect(parseValidationErrors(new Error(message))).toEqual({
    summary: "",
    errors: expectedErrors,
  });
});

test("GIVEN parseValidationErrors WHEN the listing follows a sentence THEN that sentence is the summary", () => {
  const patchMessage =
    "Invalid request: Failed to execute edit operation: edit-1 because the given value doesn't match " +
    "the schema of the service entity:\n1 validation error for st\nembedded.0.embedded_b\n" +
    "  Input should be a valid integer [type=int_parsing, input_value='a', input_type=str]";

  expect(parseValidationErrors(new Error(patchMessage))).toEqual({
    summary:
      "Failed to execute edit operation: edit-1 because the given value doesn't match the schema of the service entity",
    errors: [{ path: "embedded.0.embedded_b", message: "Input should be a valid integer" }],
  });
});

test("GIVEN parseValidationErrors WHEN the error is not a validation failure THEN it returns null", () => {
  expect(
    parseValidationErrors(new Error("Invalid request: The attribute attr1 is read-only"))
  ).toBeNull();
  expect(
    parseValidationErrors({ name: "Error", message: "Conflict", details: { other: 1 } })
  ).toBeNull();
});

test("GIVEN isAttributeValidationFailure THEN it is true only for attribute validation failures", () => {
  expect(isAttributeValidationFailure(new Error(message))).toBe(true);
  expect(
    isAttributeValidationFailure(new Error("Invalid request: The attribute attr1 is read-only"))
  ).toBe(false);
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
