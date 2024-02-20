import React from "react";
import { Route, Routes } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import {
  BooleanField,
  DictListField,
  EnumField,
  InstanceAttributeModel,
  NestedField,
  TextField,
} from "@/Core";
import * as Test from "@/Test";
import CustomRouter from "@/UI/Routing/CustomRouter";
import history from "@/UI/Routing/history";
import { words } from "@/UI/words";
import { ServiceInstanceForm } from "./ServiceInstanceForm";

const setup = (
  fields: (
    | TextField
    | BooleanField
    | NestedField
    | DictListField
    | EnumField
  )[],
  func: undefined | jest.Mock = undefined,
  isEdit = false,
  originalAttributes: InstanceAttributeModel | undefined = undefined,
) => {
  return (
    <CustomRouter history={history}>
      <Routes>
        <Route
          path="/"
          element={
            <ServiceInstanceForm
              fields={fields}
              onCancel={jest.fn()}
              onSubmit={func ? func : jest.fn()}
              isEdit={isEdit}
              originalAttributes={originalAttributes}
            />
          }
        />
      </Routes>
    </CustomRouter>
  );
};

test("GIVEN ServiceInstanceForm WHEN passed a TextField THEN shows that field", async () => {
  render(setup([Test.Field.text]));

  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    }),
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", {
    name: `TextInput-${Test.Field.text.name}`,
  });
  const value = "test text";
  expect(textBox).toBeVisible();
  await act(async () => {
    await userEvent.type(textBox, value);
  });
  expect(textBox).toHaveValue(value);
});

test("GIVEN ServiceInstanceForm WHEN passed a BooleanField THEN shows that field", async () => {
  render(setup([Test.Field.bool]));
  expect(
    screen.getByRole("generic", {
      name: `BooleanFieldInput-${Test.Field.bool.name}`,
    }),
  ).toBeVisible();

  expect(screen.getAllByRole("radio")).toHaveLength(3);

  const trueRadioButton = screen.getByRole("radio", { name: "True" });
  await act(async () => {
    await userEvent.click(trueRadioButton);
  });

  expect(trueRadioButton).toBeChecked();
});

test("GIVEN ServiceInstanceForm WHEN passed an EnumField THEN shows that field", async () => {
  render(setup([Test.Field.enumField]));

  expect(
    screen.getByRole("generic", {
      name: `EnumFieldInput-${Test.Field.enumField.name}`,
    }),
  ).toBeVisible();

  const select = screen.getByRole("combobox", {
    name: "enum_field-selectFilterInput",
  });
  expect(select).toHaveValue("local");

  await act(async () => {
    await userEvent.click(select);
  });

  const options = screen.getAllByRole("option");
  expect(options).toHaveLength(2);

  await act(async () => {
    await userEvent.click(options[0]);
  });

  expect(select).toHaveValue("ci");
});

test("GIVEN ServiceInstanceForm WHEN passed an EnumField with more than one value THEN shows that field with default prompt", async () => {
  render(setup([Test.Field.enumFieldTwoOptions]));

  const component = screen.getByRole("generic", {
    name: `EnumFieldInput-${Test.Field.enumFieldTwoOptions.name}`,
  });
  expect(component).toBeVisible();

  const placeholder = screen.getByPlaceholderText(
    `Select value for ${Test.Field.enumFieldTwoOptions.name}`,
  );
  expect(placeholder).toBeVisible();

  const select = screen.getByRole("combobox", {
    name: `${Test.Field.enumFieldTwoOptions.name}-selectFilterInput`,
  });

  await act(async () => {
    await userEvent.click(select);
  });

  const options = screen.getAllByRole("option");
  expect(options).toHaveLength(2);
});

test("GIVEN ServiceInstanceForm WHEN passed an EnumField with only one value THEN shows that field with preselected option", async () => {
  render(setup([Test.Field.enumFieldSingleOption]));
  const component = screen.getByRole("generic", {
    name: `EnumFieldInput-${Test.Field.enumFieldSingleOption.name}`,
  });
  expect(component).toBeVisible();

  const select = screen.getByRole("combobox", {
    name: `${Test.Field.enumFieldSingleOption.name}-selectFilterInput`,
  });

  expect(select).toHaveValue("local");

  await act(async () => {
    await userEvent.click(select);
  });

  const option = screen.getByRole("option");
  expect(option).toBeInTheDocument();
});

test("GIVEN ServiceInstanceForm and a NestedField WHEN clicking the toggle THEN the nested FlatField is shown", async () => {
  render(setup([Test.Field.nested([Test.Field.text])]));

  const group = screen.getByRole("group", {
    name: "nested_field",
  });

  expect(group).toBeVisible();

  await act(async () => {
    await userEvent.click(
      within(group).getByRole("button", {
        name: words("catalog.callbacks.add"),
      }),
    );
  });

  expect(
    screen.queryByRole("textbox", { name: Test.Field.text.name }),
  ).not.toBeInTheDocument();

  await act(async () => {
    await userEvent.click(
      within(group).getByRole("button", { name: "nested_field" }),
    );
  });

  expect(
    screen.getByRole("textbox", { name: `TextInput-${Test.Field.text.name}` }),
  ).toBeVisible();
});

test("GIVEN ServiceInstanceForm and a DictListField WHEN clicking all toggles open THEN the nested FlatField is shown", async () => {
  render(setup([Test.Field.dictList([Test.Field.text])]));

  const group = screen.getByRole("group", {
    name: "dict_list_field",
  });

  expect(group).toBeVisible();

  expect(
    screen.queryByRole("textbox", { name: Test.Field.text.name }),
  ).not.toBeInTheDocument();

  await act(async () => {
    await userEvent.click(
      within(group).getByRole("button", {
        name: "dict_list_field",
      }),
    );
  });
  await act(async () => {
    await userEvent.click(within(group).getByRole("button", { name: "0" }));
  });

  expect(
    screen.getByRole("textbox", { name: `TextInput-${Test.Field.text.name}` }),
  ).toBeVisible();
});

test("GIVEN ServiceInstanceForm and a nested DictListField WHEN in EDIT mode, new items should be enabled.", async () => {
  const originalAttributes = {
    nested_dict_list_field: [
      { dict_list_field: [{ text_field_disabled: "a" }] },
    ],
  };

  render(
    setup(
      [Test.Field.nestedDictList([Test.Field.textDisabled])],
      undefined,
      true,
      originalAttributes,
    ),
  );

  const group = screen.getByRole("group", {
    name: "nested_dict_list_field",
  });

  expect(group).toBeVisible();

  expect(
    screen.queryByRole("textbox", { name: Test.Field.textDisabled.name }),
  ).not.toBeInTheDocument();

  await act(async () => {
    await userEvent.click(
      within(group).getByRole("button", {
        name: "nested_dict_list_field",
      }),
    );
  });
  await act(async () => {
    await userEvent.click(within(group).getByRole("button", { name: "0" }));
  });

  expect(
    screen.queryByRole("textbox", {
      name: `TextInput-${Test.Field.textDisabled.name}`,
    }),
  ).not.toBeInTheDocument();

  const nestedGroup = screen.getByRole("group", {
    name: "dict_list_field",
  });

  expect(nestedGroup).toBeVisible();

  await act(async () => {
    await userEvent.click(
      within(nestedGroup).getByRole("button", {
        name: "dict_list_field",
      }),
    );
  });
  await act(async () => {
    await userEvent.click(
      within(nestedGroup).getByRole("button", { name: "0" }),
    );
  });

  const disabledNestedTextField = within(nestedGroup).getByRole("textbox", {
    name: `TextInput-${Test.Field.textDisabled.name}`,
  });

  expect(disabledNestedTextField).toBeDisabled();

  await act(async () => {
    await userEvent.click(
      within(nestedGroup).getByRole("button", { name: "Add" }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(nestedGroup).getByRole("button", { name: "1" }),
    );
  });

  const nestedTextFields = screen.getAllByRole("textbox", {
    name: `TextInput-${Test.Field.textDisabled.name}`,
  });

  expect(nestedTextFields[0]).toBeDisabled();
  expect(nestedTextFields[1]).toBeEnabled();
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

  await act(async () => {
    await userEvent.type(
      screen.getByRole("textbox", { name: `TextInput-${fields[0].name}` }),
      "test text",
    );
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("radio", { name: words("true") }));
  });

  const group = screen.getByRole("group", {
    name: "nested_field",
  });
  await act(async () => {
    await userEvent.click(
      within(group).getByRole("button", {
        name: words("catalog.callbacks.add"),
      }),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: nestedField.name }),
    );
  });
  await act(async () => {
    await userEvent.type(
      screen.getByRole("textbox", {
        name: `TextInput-${nestedField.fields[0].name}`,
      }),
      "test text 2",
    );
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: dictListField.name }),
    );
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "0" }));
  });
  await act(async () => {
    await userEvent.type(
      screen.getByRole("textbox", {
        name: `TextInput-${dictListField.fields[0].name}`,
      }),
      "test text 3",
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: words("confirm") }),
    );
  });

  expect(submitCb).toBeCalled();
  expect(submitCb).toHaveBeenCalledWith(
    {
      [Test.Field.text.name]: "test text",
      [Test.Field.bool.name]: true,
      [nestedField.name]: { [nestedField.fields[0].name]: "test text 2" },
      [dictListField.name]: [{ [dictListField.fields[0].name]: "test text 3" }],
    },
    expect.any(Function),
  );
});
