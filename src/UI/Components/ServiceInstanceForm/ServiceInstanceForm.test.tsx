import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as Test from "@/Test";
import { words } from "../../words";
import { ServiceInstanceForm } from "./ServiceInstanceForm";

test("GIVEN ServiceInstanceForm WHEN passed a TextField THEN shows that field", () => {
  render(
    <ServiceInstanceForm
      fields={[Test.Field.text]}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );
  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    })
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", { name: Test.Field.text.name });
  const value = "test text";
  expect(textBox).toBeVisible();
  userEvent.type(textBox, value);
  expect(textBox).toHaveValue(value);
});

test("GIVEN ServiceInstanceForm WHEN passed a BooleanField THEN shows that field", () => {
  render(
    <ServiceInstanceForm
      fields={[Test.Field.bool]}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );
  expect(
    screen.getByRole("generic", {
      name: `BooleanFieldInput-${Test.Field.bool.name}`,
    })
  ).toBeVisible();

  expect(screen.getAllByRole("radio")).toHaveLength(3);

  const trueRadioButton = screen.getByRole("radio", { name: "True" });
  userEvent.click(trueRadioButton);
  expect(trueRadioButton).toBeChecked();
});

test("GIVEN ServiceInstanceForm WHEN passed an EnumField THEN shows that field", () => {
  render(
    <ServiceInstanceForm
      fields={[Test.Field.enumField]}
      onCancel={jest.fn()}
      onSubmit={jest.fn()}
    />
  );
  expect(
    screen.getByRole("generic", {
      name: `EnumFieldInput-${Test.Field.enumField.name}`,
    })
  ).toBeVisible();

  const select = screen.getByRole("button", {
    name: "enum_field-select-toggle",
  });
  expect(select).toHaveTextContent("local");
  userEvent.click(select);

  const dropdown = screen.getByRole("listbox", {
    name: "enum_field-select-input",
  });

  const options = within(dropdown).getAllByRole("option");
  expect(options).toHaveLength(2);

  userEvent.click(options[0]);
  expect(select).toHaveTextContent("ci");
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
  userEvent.click(
    within(group).getByRole("button", { name: words("catalog.callbacks.add") })
  );
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

test("GIVEN ServiceInstanceForm WHEN clicking the submit button THEN callback is executed with formState", () => {
  const nestedField = Test.Field.nested([
    { ...Test.Field.text, name: "flat_field_text_2" },
  ]);
  const dictListField = Test.Field.dictList([
    { ...Test.Field.text, name: "flat_field_text_3" },
  ]);
  const fields = [Test.Field.text, Test.Field.bool, nestedField, dictListField];
  const submitCb = jest.fn();

  render(
    <ServiceInstanceForm
      fields={fields}
      onCancel={jest.fn()}
      onSubmit={submitCb}
    />
  );

  userEvent.type(
    screen.getByRole("textbox", { name: fields[0].name }),
    "test text"
  );
  userEvent.click(screen.getByRole("radio", { name: "True" }));
  const group = screen.getByRole("generic", {
    name: "NestedFieldInput-nested_field",
  });
  userEvent.click(
    within(group).getByRole("button", { name: words("catalog.callbacks.add") })
  );
  userEvent.click(screen.getByRole("button", { name: nestedField.name }));
  userEvent.type(
    screen.getByRole("textbox", { name: nestedField.fields[0].name }),
    "test text 2"
  );

  userEvent.click(screen.getByRole("button", { name: dictListField.name }));
  userEvent.click(screen.getByRole("button", { name: "1" }));
  userEvent.type(
    screen.getByRole("textbox", { name: dictListField.fields[0].name }),
    "test text 3"
  );

  userEvent.click(screen.getByRole("button", { name: "Confirm" }));
  expect(submitCb).toBeCalled();
  expect(submitCb).toHaveBeenCalledWith({
    [Test.Field.text.name]: "test text",
    [Test.Field.bool.name]: true,
    [nestedField.name]: { [nestedField.fields[0].name]: "test text 2" },
    [dictListField.name]: [{ [dictListField.fields[0].name]: "test text 3" }],
  });
});
