import React from "react";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  BooleanField,
  DictListField,
  EnumField,
  NestedField,
  TextField,
} from "@/Core";
import * as Test from "@/Test";
import { ServiceInstanceForm } from "./ServiceInstanceForm";

const setup = (
  fields: (
    | TextField
    | BooleanField
    | NestedField
    | DictListField
    | EnumField
  )[],
  func: undefined | jest.Mock = undefined
) => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ServiceInstanceForm
              fields={fields}
              onCancel={jest.fn()}
              onSubmit={func ? func : jest.fn()}
            />
          }
        />
      </Routes>
    </Router>
  );
};
test("GIVEN ServiceInstanceForm WHEN passed a TextField THEN shows that field", async () => {
  render(setup([Test.Field.text]));

  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    })
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", { name: Test.Field.text.name });
  const value = "test text";
  expect(textBox).toBeVisible();
  await userEvent.type(textBox, value);
  expect(textBox).toHaveValue(value);
});

test("GIVEN ServiceInstanceForm WHEN passed a BooleanField THEN shows that field", async () => {
  render(setup([Test.Field.bool]));
  expect(
    screen.getByRole("generic", {
      name: `BooleanFieldInput-${Test.Field.bool.name}`,
    })
  ).toBeVisible();

  expect(screen.getAllByRole("radio")).toHaveLength(3);

  const trueRadioButton = screen.getByRole("radio", { name: "True" });
  await userEvent.click(trueRadioButton);
  expect(trueRadioButton).toBeChecked();
});

test("GIVEN ServiceInstanceForm WHEN passed an EnumField THEN shows that field", async () => {
  render(setup([Test.Field.enumField]));

  expect(
    screen.getByRole("generic", {
      name: `EnumFieldInput-${Test.Field.enumField.name}`,
    })
  ).toBeVisible();

  const select = screen.getByRole("button", {
    name: "enum_field-select-toggle",
  });
  expect(select).toHaveTextContent("local");
  await userEvent.click(select);

  const dropdown = screen.getByRole("listbox", {
    name: "enum_field-select-input",
  });

  const options = within(dropdown).getAllByRole("option");
  expect(options).toHaveLength(2);

  await userEvent.click(options[0]);
  expect(select).toHaveTextContent("ci");
});

test("GIVEN ServiceInstanceForm WHEN passed an EnumField with more than one value THEN shows that field with default prompt", async () => {
  render(setup([Test.Field.enumFieldTwoOptions]));

  const component = screen.getByRole("generic", {
    name: `EnumFieldInput-${Test.Field.enumFieldTwoOptions.name}`,
  });
  expect(component).toBeVisible();

  const preselectedOption = screen.getByText(
    `Select value for ${Test.Field.enumFieldTwoOptions.name}`
  );
  expect(preselectedOption).toBeVisible();

  const select = screen.getByRole("button", {
    name: `${Test.Field.enumFieldTwoOptions.name}-select-toggle`,
  });
  await userEvent.click(select);

  const dropdown = screen.getByRole("listbox", {
    name: `${Test.Field.enumFieldTwoOptions.name}-select-input`,
  });

  const options = within(dropdown).getAllByRole("option");
  expect(options).toHaveLength(2);
});

test("GIVEN ServiceInstanceForm WHEN passed an EnumField with only one value THEN shows that field with preselected option", async () => {
  render(setup([Test.Field.enumFieldSingleOption]));
  const component = screen.getByRole("generic", {
    name: `EnumFieldInput-${Test.Field.enumFieldSingleOption.name}`,
  });
  expect(component).toBeVisible();

  const preselectedOption = screen.getByText(
    Test.Field.enumFieldSingleOption.options.local as string
  );
  expect(preselectedOption).toBeVisible();
  const select = screen.getByRole("button", {
    name: `${Test.Field.enumFieldSingleOption.name}-select-toggle`,
  });
  await userEvent.click(select);

  const dropdown = screen.getByRole("listbox", {
    name: `${Test.Field.enumFieldSingleOption.name}-select-input`,
  });

  const option = within(dropdown).getByRole("option");
  expect(option).toBeInTheDocument();
});

test("GIVEN ServiceInstanceForm and a NestedField WHEN clicking the toggle THEN the nested FlatField is shown", async () => {
  render(setup([Test.Field.nested([Test.Field.text])]));

  const group = screen.getByRole("group", {
    name: "nested_field",
  });

  expect(group).toBeVisible();

  expect(
    screen.queryByRole("textbox", { name: Test.Field.text.name })
  ).not.toBeInTheDocument();
  await userEvent.click(
    within(group).getByRole("button", { name: "nested_field" })
  );
  expect(
    screen.getByRole("textbox", { name: Test.Field.text.name })
  ).toBeVisible();
});

test("GIVEN ServiceInstanceForm and a DictListField WHEN clicking all toggles open THEN the nested FlatField is shown", async () => {
  render(setup([Test.Field.dictList([Test.Field.text])]));

  const group = screen.getByRole("group", {
    name: "dict_list_field",
  });

  expect(group).toBeVisible();

  expect(
    screen.queryByRole("textbox", { name: Test.Field.text.name })
  ).not.toBeInTheDocument();
  await userEvent.click(
    within(group).getByRole("button", {
      name: "dict_list_field",
    })
  );
  await userEvent.click(within(group).getByRole("button", { name: "1" }));
  expect(
    screen.getByRole("textbox", { name: Test.Field.text.name })
  ).toBeVisible();
});

test("GIVEN ServiceInstanceForm WHEN clicking the submit button THEN callback is executed with formState", async () => {
  const nestedField = Test.Field.nested([
    { ...Test.Field.text, name: "flat_field_text_2" },
  ]);
  const dictListField = Test.Field.dictList([
    { ...Test.Field.text, name: "flat_field_text_3" },
  ]);
  const fields = [Test.Field.text, Test.Field.bool, nestedField, dictListField];
  const submitCb = jest.fn();
  render(setup(fields, submitCb));

  await userEvent.type(
    screen.getByRole("textbox", { name: fields[0].name }),
    "test text"
  );
  await userEvent.click(screen.getByRole("radio", { name: "True" }));

  await userEvent.click(screen.getByRole("button", { name: nestedField.name }));
  await userEvent.type(
    screen.getByRole("textbox", { name: nestedField.fields[0].name }),
    "test text 2"
  );

  await userEvent.click(
    screen.getByRole("button", { name: dictListField.name })
  );
  await userEvent.click(screen.getByRole("button", { name: "1" }));
  await userEvent.type(
    screen.getByRole("textbox", { name: dictListField.fields[0].name }),
    "test text 3"
  );

  await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
  expect(submitCb).toBeCalled();
  expect(submitCb).toHaveBeenCalledWith(
    {
      [Test.Field.text.name]: "test text",
      [Test.Field.bool.name]: true,
      [nestedField.name]: { [nestedField.fields[0].name]: "test text 2" },
      [dictListField.name]: [{ [dictListField.fields[0].name]: "test text 3" }],
    },
    expect.any(Function)
  );
});
