import "@testing-library/jest-dom";
import { Route, Routes } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  BooleanField,
  DictListField,
  EnumField,
  InstanceAttributeModel,
  NestedField,
  TextField,
  Textarea,
} from "@/Core";
import * as Test from "@/Test";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
import { ServiceInstanceForm } from "./ServiceInstanceForm";

const setup = (
  fields: (TextField | BooleanField | NestedField | DictListField | EnumField | Textarea)[],
  func: undefined | ReturnType<typeof vi.fn> = undefined,
  isEdit = false,
  originalAttributes: InstanceAttributeModel | undefined = undefined
) => {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/?env=aaa"]}>
        <MockedDependencyProvider>
          <Routes>
            <Route
              path="/"
              element={
                <ServiceInstanceForm
                  fields={fields}
                  onCancel={vi.fn()}
                  onSubmit={func ? func : vi.fn()}
                  isEdit={isEdit}
                  originalAttributes={originalAttributes}
                  service_entity="service_entity"
                  isDirty={false}
                  setIsDirty={vi.fn()}
                />
              }
            />
          </Routes>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
};

const server = setupServer(
  http.get("/api/v1/parameter/param_name", () => {
    return HttpResponse.json({
      parameter: undefined,
    });
  })
);

beforeAll(() => {
  server.listen();
});

beforeEach(() => {
  server.restoreHandlers();
});

afterAll(() => server.close());

test("GIVEN ServiceInstanceForm WHEN passed a TextField THEN shows that field", async () => {
  const { component } = setup([Test.Field.text]);

  render(component);

  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    })
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", {
    name: `TextInput-${Test.Field.text.name}`,
  });
  const value = "test text";

  expect(textBox).toBeVisible();

  await userEvent.type(textBox, value);

  expect(textBox).toHaveValue(value);
});

test("GIVEN ServiceInstanceForm WHEN passed a TextField with suggestions THEN shows that field", async () => {
  const { component } = setup([Test.Field.textSuggestions]);

  render(component);

  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    })
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", {
    name: `TextInput-${Test.Field.text.name}`,
  });
  const value = "test text";

  expect(textBox).toBeVisible();

  await userEvent.type(textBox, value);

  expect(textBox).toHaveValue(value);
});

test("GIVEN ServiceInstanceForm WHEN passed a TextField with parameter suggestions THEN shows that field", async () => {
  // Provide the server-side API with the request handlers.
  server.use(
    http.get("/api/v1/parameter/param_name", () => {
      return HttpResponse.json({
        parameter: {
          value: "metadata",
          resource_id: "",
          updated: "2024-03-01T09:43:50.447460+00:00",
          metadata: {
            values: ["value1", "value2", "value3"],
          },
          id: "65633cac-5be1-4e7b-8a17-7552290649d5",
          name: "param_name",
          environment: "68518e2f-3e78-42a0-9009-50a35d89dee2",
          source: "inmanta_user",
          expires: false,
        },
      });
    })
  );

  const { component } = setup([Test.Field.textSuggestions2]);

  render(component);

  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    })
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", {
    name: `TextInput-${Test.Field.text.name}`,
  });

  // simulate click on the input to show the suggestions
  await userEvent.click(textBox);

  const suggestions = await screen.findAllByRole("menuitem");

  expect(suggestions).toHaveLength(3);
});

test("GIVEN ServiceInstanceForm WHEN passed a TextField with parameter suggestions AND no parameters could be retrieved THEN shows that field without suggestions", async () => {
  // Provide the server-side API with the request handlers.
  server.use(
    http.get("/api/v1/parameter/param_name", () => {
      return HttpResponse.error();
    })
  );

  const { component } = setup([Test.Field.textSuggestions2]);

  render(component);

  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    })
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", {
    name: `TextInput-${Test.Field.text.name}`,
  });

  // simulate click on the input to show the suggestions
  await userEvent.click(textBox);

  const suggestions = screen.queryAllByRole("menuitem");

  expect(suggestions).toHaveLength(0);
});

test("GIVEN ServiceInstanceForm WHEN passed a BooleanField THEN shows that field", async () => {
  const { component } = setup([Test.Field.bool]);

  render(component);

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
  const { component } = setup([Test.Field.enumField]);

  render(component);

  expect(
    screen.getByRole("generic", {
      name: `EnumFieldInput-${Test.Field.enumField.name}`,
    })
  ).toBeVisible();

  const select = screen.getByTestId(`${Test.Field.enumField.name}-select-toggle`);

  expect(select).toHaveTextContent("local");

  await userEvent.click(select);

  const options = screen.getAllByRole("option");

  expect(options).toHaveLength(2);

  await userEvent.click(options[0]);

  expect(select).toHaveTextContent("ci");
});

test("GIVEN ServiceInstanceForm WHEN passed an EnumField with more than one value THEN shows that field with default prompt", async () => {
  const { component } = setup([Test.Field.enumFieldTwoOptions]);

  render(component);

  const field = screen.getByRole("generic", {
    name: `EnumFieldInput-${Test.Field.enumFieldTwoOptions.name}`,
  });

  expect(field).toBeVisible();

  const placeholder = screen.getByText(`Select value for ${Test.Field.enumFieldTwoOptions.name}`);

  expect(placeholder).toBeVisible();

  const select = screen.getByTestId(`${Test.Field.enumFieldTwoOptions.name}-select-toggle`);

  await userEvent.click(select);

  const options = screen.getAllByRole("option");

  expect(options).toHaveLength(2);
});

test("GIVEN ServiceInstanceForm WHEN passed an EnumField with only one value THEN shows that field with preselected option", async () => {
  const { component } = setup([Test.Field.enumFieldSingleOption]);

  render(component);

  const field = screen.getByRole("generic", {
    name: `EnumFieldInput-${Test.Field.enumFieldSingleOption.name}`,
  });

  expect(field).toBeVisible();

  const select = screen.getByTestId(`${Test.Field.enumFieldSingleOption.name}-select-toggle`);

  expect(select).toHaveTextContent("local");

  await userEvent.click(select);

  const option = screen.getByRole("option");

  expect(option).toBeInTheDocument();
});

test("GIVEN ServiceInstanceForm and a NestedField WHEN clicking the toggle THEN the nested FlatField is shown", async () => {
  const { component } = setup([Test.Field.nested([Test.Field.text])]);

  render(component);

  const group = screen.getByRole("group", {
    name: "nested_field",
  });

  expect(group).toBeVisible();

  await userEvent.click(
    within(group).getByRole("button", {
      name: words("add"),
    })
  );

  expect(screen.queryByRole("textbox", { name: Test.Field.text.name })).not.toBeInTheDocument();

  await userEvent.click(within(group).getByRole("button", { name: "nested_field" }));

  expect(screen.getByRole("textbox", { name: `TextInput-${Test.Field.text.name}` })).toBeVisible();
});
test("GIVEN ServiceInstanceForm and a NestedField WHEN rendering optional inputs THEN the form structure is correct", async () => {
  //simplified version of form state that was causing bug on production
  const { component } = setup([
    {
      kind: "Nested",
      name: "nested_field",
      description: "description",
      isOptional: true,
      isDisabled: false,
      fields: [
        {
          kind: "Nested",
          name: "double_nested_field",
          description: "description",
          isOptional: true,
          isDisabled: false,
          fields: [
            {
              kind: "Boolean",
              name: "boolean_field",
              description: "description",
              isOptional: true,
              isDisabled: false,
              defaultValue: null,
              type: "bool?",
            },
            {
              kind: "Boolean",
              name: "boolean_field_2",
              description: "description",
              isOptional: true,
              isDisabled: false,
              defaultValue: true,
              type: "bool?",
            },
          ],
        },
      ],
    },
  ]);

  render(component);

  const group = screen.getByRole("group", {
    name: "nested_field",
  });

  expect(group).toBeVisible();

  await userEvent.click(
    within(group).getByRole("button", {
      name: words("add"),
    })
  );

  await userEvent.click(within(group).getByRole("button", { name: "nested_field" }));

  const nestedGroup = screen.getByRole("group", {
    name: "double_nested_field",
  });

  expect(nestedGroup).toBeVisible();

  expect(
    screen.queryByRole("generic", {
      name: "BooleanFieldInput-boolean_field",
    })
  ).not.toBeInTheDocument();

  expect(
    screen.queryByRole("generic", {
      name: "BooleanFieldInput-boolean_field_2",
    })
  ).not.toBeInTheDocument();

  await userEvent.click(
    within(nestedGroup).getByRole("button", {
      name: words("add"),
    })
  );

  await userEvent.click(within(group).getByRole("button", { name: "double_nested_field" }));

  expect(
    screen.getByRole("generic", {
      name: "BooleanFieldInput-boolean_field_2",
    })
  ).toBeVisible();

  expect(
    screen.getByRole("generic", {
      name: "BooleanFieldInput-boolean_field_2",
    })
  ).toBeVisible();
});

test("GIVEN ServiceInstanceForm and a DictListField WHEN clicking all toggles open THEN the nested FlatField is shown", async () => {
  const { component } = setup([Test.Field.dictList([Test.Field.text])]);

  render(component);

  const group = screen.getByRole("group", {
    name: "dict_list_field",
  });

  expect(group).toBeVisible();

  expect(screen.queryByRole("textbox", { name: Test.Field.text.name })).not.toBeInTheDocument();

  await userEvent.click(
    within(group).getByRole("button", {
      name: "dict_list_field",
    })
  );

  await userEvent.click(within(group).getByRole("button", { name: "0" }));

  expect(screen.getByRole("textbox", { name: `TextInput-${Test.Field.text.name}` })).toBeVisible();
});

test("GIVEN ServiceInstanceForm and a nested DictListField WHEN in EDIT mode, new items should be enabled.", async () => {
  const originalAttributes = {
    nested_dict_list_field: [{ dict_list_field: [{ text_field_disabled: "a" }] }],
  };

  const { component } = setup(
    [Test.Field.nestedDictList([Test.Field.textDisabled])],
    undefined,
    true,
    originalAttributes
  );

  render(component);

  const group = screen.getByRole("group", {
    name: "nested_dict_list_field",
  });

  expect(group).toBeVisible();

  expect(
    screen.queryByRole("textbox", { name: Test.Field.textDisabled.name })
  ).not.toBeInTheDocument();

  await userEvent.click(
    within(group).getByRole("button", {
      name: "nested_dict_list_field",
    })
  );

  await userEvent.click(within(group).getByRole("button", { name: "0" }));

  expect(
    screen.queryByRole("textbox", {
      name: `TextInput-${Test.Field.textDisabled.name}`,
    })
  ).not.toBeInTheDocument();

  const nestedGroup = screen.getByRole("group", {
    name: "dict_list_field",
  });

  expect(nestedGroup).toBeVisible();

  await userEvent.click(
    within(nestedGroup).getByRole("button", {
      name: "dict_list_field",
    })
  );

  await userEvent.click(within(nestedGroup).getByRole("button", { name: "0" }));

  const disabledNestedTextField = within(nestedGroup).getByRole("textbox", {
    name: `TextInput-${Test.Field.textDisabled.name}`,
  });

  expect(disabledNestedTextField).toBeDisabled();

  await userEvent.click(within(nestedGroup).getByRole("button", { name: "Add" }));

  await userEvent.click(within(nestedGroup).getByRole("button", { name: "1" }));

  const nestedTextFields = screen.getAllByRole("textbox", {
    name: `TextInput-${Test.Field.textDisabled.name}`,
  });

  expect(nestedTextFields[0]).toBeDisabled();
  expect(nestedTextFields[1]).toBeEnabled();
});

test("GIVEN ServiceInstanceForm WHEN Deleting an item that isn't the last index, removes the correct item", async () => {
  const dictListField = Test.Field.dictList([{ ...Test.Field.text, name: "flat_field" }]);
  const fields = [dictListField];
  const originalAttributes = {
    dict_list_field: [
      { flat_field: "flat_field_text_1" },
      { flat_field: "flat_field_text_2" },
      { flat_field: "flat_field_text_3" },
    ],
  };

  const { component } = setup(fields, undefined, true, originalAttributes);

  render(component);

  const group = screen.getByRole("group", {
    name: "dict_list_field",
  });

  expect(group).toBeVisible();

  await userEvent.click(screen.getByRole("button", { name: dictListField.name }));

  // Open all the collapsible sections
  await userEvent.click(screen.getByRole("button", { name: "0" }));
  await userEvent.click(screen.getByRole("button", { name: "1" }));
  await userEvent.click(screen.getByRole("button", { name: "2" }));

  const textBoxes = screen.getAllByRole("textbox");

  expect(textBoxes).toHaveLength(3);
  expect(textBoxes[0]).toHaveValue("flat_field_text_1");

  // the delete button should be enabled, as for this list, the minimum is 1
  expect(screen.getAllByRole("button", { name: words("delete") })[0]).toBeEnabled();

  // Delete the second item of the list.
  await userEvent.click(within(group).getAllByRole("button", { name: words("delete") })[1]);

  const updatedTextBoxes = screen.getAllByRole("textbox");

  expect(updatedTextBoxes).toHaveLength(2);
  expect(updatedTextBoxes[0]).toHaveValue("flat_field_text_1");
  expect(updatedTextBoxes[1]).toHaveValue("flat_field_text_3");

  // Delete another item of the list.
  await userEvent.click(within(group).getAllByRole("button", { name: words("delete") })[0]);

  const updatedTextBoxes2 = screen.getAllByRole("textbox");

  expect(updatedTextBoxes2).toHaveLength(1);
  expect(updatedTextBoxes2[0]).toHaveValue("flat_field_text_3");

  // The delete button should now be disabled, as the minimum is 1
  expect(screen.getAllByRole("button", { name: words("delete") })[0]).toBeDisabled();
});

test("GIVEN ServiceInstanceForm WHEN clicking the submit button THEN callback is executed with formState", async () => {
  const nestedField = Test.Field.nested([{ ...Test.Field.text, name: "flat_field_text_2" }]);
  const dictListField = Test.Field.dictList([{ ...Test.Field.text, name: "flat_field_text_3" }]);
  const fields = [Test.Field.text, Test.Field.bool, nestedField, dictListField];
  const submitCb = vi.fn();

  const { component } = setup(fields, submitCb);

  render(component);

  await userEvent.type(
    screen.getByRole("textbox", { name: `TextInput-${fields[0].name}` }),
    "test text"
  );

  await userEvent.click(screen.getByRole("radio", { name: words("true") }));

  const group = screen.getByRole("group", {
    name: "nested_field",
  });

  await userEvent.click(
    within(group).getByRole("button", {
      name: words("add"),
    })
  );

  await userEvent.click(screen.getByRole("button", { name: nestedField.name }));

  await userEvent.type(
    screen.getByRole("textbox", {
      name: `TextInput-${nestedField.fields[0].name}`,
    }),
    "test text 2"
  );

  await userEvent.click(screen.getByRole("button", { name: dictListField.name }));

  await userEvent.click(screen.getByRole("button", { name: "0" }));

  await userEvent.type(
    screen.getByRole("textbox", {
      name: `TextInput-${dictListField.fields[0].name}`,
    }),
    "test text 3"
  );

  await userEvent.click(screen.getByText(words("confirm")));

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

test.each`
  input                  | label                             | newValue
  ${Test.Field.textArea} | ${"TextareaInput-textarea_field"} | ${"new text"}
  ${Test.Field.text}     | ${"TextInput-text_field"}         | ${"new text"}
`(
  "Given ServiceInstanceForm and InputField WHEN updating the input THEN current value is correctly displayed",
  async ({ input, label, newValue }) => {
    const { component } = setup([input], undefined, false, undefined);

    render(component);

    expect(screen.getByLabelText(label)).toHaveValue("");

    await userEvent.type(screen.getByLabelText(label), newValue);

    expect(screen.getByLabelText(label)).toHaveValue(newValue);
  }
);

test.each`
  input                  | label                             | value          | newValue
  ${Test.Field.textArea} | ${"TextareaInput-textarea_field"} | ${"test text"} | ${"new text"}
  ${Test.Field.text}     | ${"TextInput-text_field"}         | ${"test text"} | ${"new text"}
`(
  "Given ServiceInstanceForm and InputField WHEN updating the input THEN current value is correctly displayed",
  async ({ input, label, value, newValue }) => {
    const originalAttributes = {
      [input.name]: value,
    };
    const { component } = setup([input], undefined, false, originalAttributes);

    render(component);

    expect(screen.getByLabelText(label)).toHaveValue(value);

    await userEvent.clear(screen.getByLabelText(label));
    await userEvent.type(screen.getByLabelText(label), "{selectAll}{backspace}" + newValue);

    expect(screen.getByLabelText(label)).toHaveValue(newValue);
  }
);
