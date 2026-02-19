import { Field } from "@/Test";
import { createFormState } from "@/UI/Components";
import { sanitizeAttributes } from "./sanitizeAttributes";

test("GIVEN sanitizeAttributes WHEN passed DictListFields THEN sanitizes all fields", () => {
  const fields = [Field.dictList([Field.text, Field.bool])];
  const formState = createFormState(fields);
  const sanitized = sanitizeAttributes(fields, formState);

  expect(sanitized).toMatchObject({
    dict_list_field: [
      {
        text_field: null,
        boolean_field: null,
      },
    ],
  });
});

test("GIVEN sanitizeAttributes WHEN passed boolean field with default value false THEN preserves false value", () => {
  const booleanFieldWithDefault = {
    kind: "Boolean" as const,
    name: "should_deploy_fail",
    description: "Boolean field with default false",
    isOptional: false,
    isDisabled: false,
    defaultValue: false,
    type: "bool",
  };

  const fields = [booleanFieldWithDefault];
  const formState = { should_deploy_fail: false }; // Form state where user didn't change the default
  const sanitized = sanitizeAttributes(fields, formState);

  expect(sanitized).toMatchObject({
    should_deploy_fail: false,
  });
});

test("GIVEN sanitizeAttributes WHEN passed boolean field with default value true THEN preserves true value", () => {
  const booleanFieldWithDefault = {
    kind: "Boolean" as const,
    name: "enable_feature",
    description: "Boolean field with default true",
    isOptional: false,
    isDisabled: false,
    defaultValue: true,
    type: "bool",
  };

  const fields = [booleanFieldWithDefault];
  const formState = { enable_feature: true }; // Form state where user didn't change the default
  const sanitized = sanitizeAttributes(fields, formState);

  expect(sanitized).toMatchObject({
    enable_feature: true,
  });
});

test("GIVEN sanitizeAttributes WHEN boolean field value is undefined THEN converts to null", () => {
  const booleanField = {
    kind: "Boolean" as const,
    name: "undefined_bool",
    description: "Boolean field with undefined value",
    isOptional: false,
    isDisabled: false,
    defaultValue: false,
    type: "bool",
  };

  const fields = [booleanField];
  const formState = { undefined_bool: undefined }; // Form state where value is undefined
  const sanitized = sanitizeAttributes(fields, formState);

  expect(sanitized).toMatchObject({
    undefined_bool: null, // Should convert undefined to null
  });
});

test("GIVEN sanitizeAttributes WHEN boolean field value is null THEN preserves null", () => {
  const booleanField = {
    kind: "Boolean" as const,
    name: "null_bool",
    description: "Boolean field with null value",
    isOptional: true,
    isDisabled: false,
    defaultValue: null,
    type: "bool?",
  };

  const fields = [booleanField];
  const formState = { null_bool: null }; // Form state where value is null
  const sanitized = sanitizeAttributes(fields, formState);

  expect(sanitized).toMatchObject({
    null_bool: null, // Should preserve null
  });
});

test("GIVEN sanitizeAttributes WHEN InterServiceRelation field value is empty string THEN converts to null", () => {
  const interServiceRelationField = {
    kind: "InterServiceRelation" as const,
    name: "related_service",
    description: "Related service field",
    isOptional: true,
    isDisabled: false,
    serviceEntity: "test_entity",
  };

  const fields = [interServiceRelationField];
  const formState = { related_service: "" }; // Form state where value is empty string
  const sanitized = sanitizeAttributes(fields, formState);

  expect(sanitized).toMatchObject({
    related_service: null, // Should convert empty string to null
  });
});

test("GIVEN sanitizeAttributes WHEN InterServiceRelation field value is null THEN preserves null", () => {
  const interServiceRelationField = {
    kind: "InterServiceRelation" as const,
    name: "related_service",
    description: "Related service field",
    isOptional: true,
    isDisabled: false,
    serviceEntity: "test_entity",
  };

  const fields = [interServiceRelationField];
  const formState = { related_service: null }; // Form state where value is null
  const sanitized = sanitizeAttributes(fields, formState);

  expect(sanitized).toMatchObject({
    related_service: null, // Should preserve null
  });
});

test("GIVEN sanitizeAttributes WHEN InterServiceRelation field value is valid string THEN preserves value", () => {
  const interServiceRelationField = {
    kind: "InterServiceRelation" as const,
    name: "related_service",
    description: "Related service field",
    isOptional: true,
    isDisabled: false,
    serviceEntity: "test_entity",
  };

  const fields = [interServiceRelationField];
  const formState = { related_service: "service-instance-id-123" }; // Form state where value is a valid string
  const sanitized = sanitizeAttributes(fields, formState);

  expect(sanitized).toMatchObject({
    related_service: "service-instance-id-123", // Should preserve valid string value
  });
});
