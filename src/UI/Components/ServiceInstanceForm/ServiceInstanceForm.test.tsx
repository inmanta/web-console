import { TextInputTypes } from "@patternfly/react-core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ServiceInstanceForm } from "./ServiceInstanceForm";
import { Field } from "@/Core";

const flatFieldText: Field = {
  kind: "Flat",
  name: "flat_field_text",
  description: "description",
  isOptional: true,
  defaultValue: "",
  inputType: TextInputTypes.text,
  type: "string?",
};

const flatFieldBool: Field = {
  kind: "Flat",
  name: "flat_field_boolean",
  isOptional: true,
  defaultValue: null,
  inputType: "bool",
  type: "bool?",
  description: "desc",
};

test("GIVEN ServiceInstanceForm WHEN passed a FlatField (text) THEN shows that field", () => {
  render(
    <ServiceInstanceForm
      fields={[flatFieldText]}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );
  expect(
    screen.getByRole("generic", {
      name: `FlatFieldInput-${flatFieldText.name}`,
    })
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", { name: flatFieldText.name });
  const value = "test text";
  expect(textBox).toBeVisible();
  userEvent.type(textBox, value);
  expect(textBox).toHaveValue(value);
});

test("GIVEN ServiceInstanceForm WHEN passed a FlatField (boolean) THEN shows that field", () => {
  render(
    <ServiceInstanceForm
      fields={[flatFieldBool]}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );
  expect(
    screen.getByRole("generic", {
      name: `FlatFieldInput-${flatFieldBool.name}`,
    })
  ).toBeVisible();

  expect(screen.getAllByRole("radio")).toHaveLength(3);

  const trueRadioButton = screen.getByRole("radio", { name: "True" });
  userEvent.click(trueRadioButton);
  expect(trueRadioButton).toBeChecked();
});

test("GIVEN ServiceInstanceForm and a NestedField WHEN clicking the toggle THEN the nested FlatField is shown", () => {
  const fields: Field[] = [
    {
      kind: "Nested",
      name: "nested_field",
      description: "description",
      isOptional: true,
      fields: [flatFieldText],
    },
  ];

  render(
    <ServiceInstanceForm
      fields={fields}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );

  const group = screen.getByRole("generic", {
    name: "NestedFieldInput-nested_field",
  });

  expect(group).toBeVisible();

  expect(
    screen.queryByRole("textbox", { name: flatFieldText.name })
  ).not.toBeInTheDocument();
  userEvent.click(within(group).getByRole("button", { name: "nested_field" }));
  expect(
    screen.getByRole("textbox", { name: flatFieldText.name })
  ).toBeVisible();
});

test("GIVEN ServiceInstanceForm and a DictListField WHEN clicking all toggles open THEN the nested FlatField is shown", () => {
  const fields: Field[] = [
    {
      kind: "DictList",
      name: "dict_list_field",
      description: "description",
      isOptional: true,
      min: 1,
      max: 2,
      fields: [flatFieldText],
    },
  ];

  render(
    <ServiceInstanceForm
      fields={fields}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );

  const group = screen.getByRole("generic", {
    name: "DictListFieldInput-dict_list_field",
  });

  expect(group).toBeVisible();

  expect(
    screen.queryByRole("textbox", { name: flatFieldText.name })
  ).not.toBeInTheDocument();
  userEvent.click(
    within(group).getByRole("button", {
      name: "dict_list_field",
    })
  );
  userEvent.click(within(group).getByRole("button", { name: "1" }));
  expect(
    screen.getByRole("textbox", { name: flatFieldText.name })
  ).toBeVisible();
});

test("GIVEN ServiceInstanceForm WHEN clicking the submit button THEN callback is executed with fields & formState", () => {
  const fields: Field[] = [flatFieldText, flatFieldBool];
  const submitCb = jest.fn();

  render(
    <ServiceInstanceForm
      fields={fields}
      onCancel={jest.fn()}
      onSubmit={submitCb}
    />
  );

  userEvent.type(
    screen.getByRole("textbox", { name: "flat_field_text" }),
    "test text"
  );
  userEvent.click(screen.getByRole("radio", { name: "True" }));

  userEvent.click(screen.getByRole("button", { name: "Confirm" }));
  expect(submitCb).toBeCalled();
  expect(submitCb).toHaveBeenCalledWith(fields, {
    [flatFieldText.name]: "test text",
    [flatFieldBool.name]: true,
  });
});
