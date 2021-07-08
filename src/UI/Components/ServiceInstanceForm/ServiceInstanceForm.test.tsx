import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ServiceInstanceForm } from "./ServiceInstanceForm";
import { Field } from "@/Core";
import * as Test from "@/Test";

test("GIVEN ServiceInstanceForm WHEN passed a FlatField (text) THEN shows that field", () => {
  render(
    <ServiceInstanceForm
      fields={[Test.Field.text]}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );
  expect(
    screen.getByRole("generic", {
      name: `FlatFieldInput-${Test.Field.text.name}`,
    })
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", { name: Test.Field.text.name });
  const value = "test text";
  expect(textBox).toBeVisible();
  userEvent.type(textBox, value);
  expect(textBox).toHaveValue(value);
});

test("GIVEN ServiceInstanceForm WHEN passed a FlatField (boolean) THEN shows that field", () => {
  render(
    <ServiceInstanceForm
      fields={[Test.Field.bool]}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );
  expect(
    screen.getByRole("generic", {
      name: `FlatFieldInput-${Test.Field.bool.name}`,
    })
  ).toBeVisible();

  expect(screen.getAllByRole("radio")).toHaveLength(3);

  const trueRadioButton = screen.getByRole("radio", { name: "True" });
  userEvent.click(trueRadioButton);
  expect(trueRadioButton).toBeChecked();
});

test("GIVEN ServiceInstanceForm and a NestedField WHEN clicking the toggle THEN the nested FlatField is shown", () => {
  render(
    <ServiceInstanceForm
      fields={[Test.Field.nested([Test.Field.text])]}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );

  const group = screen.getByRole("generic", {
    name: "NestedFieldInput-nested_field",
  });

  expect(group).toBeVisible();

  expect(
    screen.queryByRole("textbox", { name: Test.Field.text.name })
  ).not.toBeInTheDocument();
  userEvent.click(within(group).getByRole("button", { name: "nested_field" }));
  expect(
    screen.getByRole("textbox", { name: Test.Field.text.name })
  ).toBeVisible();
});

test("GIVEN ServiceInstanceForm and a DictListField WHEN clicking all toggles open THEN the nested FlatField is shown", () => {
  render(
    <ServiceInstanceForm
      fields={[Test.Field.dictList([Test.Field.text])]}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );

  const group = screen.getByRole("generic", {
    name: "DictListFieldInput-dict_list_field",
  });

  expect(group).toBeVisible();

  expect(
    screen.queryByRole("textbox", { name: Test.Field.text.name })
  ).not.toBeInTheDocument();
  userEvent.click(
    within(group).getByRole("button", {
      name: "dict_list_field",
    })
  );
  userEvent.click(within(group).getByRole("button", { name: "1" }));
  expect(
    screen.getByRole("textbox", { name: Test.Field.text.name })
  ).toBeVisible();
});

test("GIVEN ServiceInstanceForm WHEN clicking the submit button THEN callback is executed with fields & formState", () => {
  const fields: Field[] = [Test.Field.text, Test.Field.bool];
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
    [Test.Field.text.name]: "test text",
    [Test.Field.bool.name]: true,
  });
});
