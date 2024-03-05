import React from "react";
import "@testing-library/jest-dom";
import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  BooleanField,
  DictListField,
  EnumField,
  InstanceAttributeModel,
  NestedField,
  TextField,
} from "@/Core";
import {
  getStoreInstance,
  QueryResolverImpl,
  QueryManagerResolverImpl,
} from "@/Data";
import * as Test from "@/Test";
import { DeferredApiHelper, StaticScheduler, dependencies } from "@/Test";
import { DependencyProvider } from "@/UI";
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
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );

  const component = (
    <CustomRouter history={history}>
      <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
        <StoreProvider store={store}>
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
        </StoreProvider>
      </DependencyProvider>
    </CustomRouter>
  );

  return { component, apiHelper, scheduler };
};

function createQuerryWrapper(children: React.ReactNode) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

test("GIVEN ServiceInstanceForm WHEN passed a TextField THEN shows that field", async () => {
  const { component } = setup([Test.Field.text]);
  render(component);

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

test("GIVEN ServiceInstanceForm WHEN passed a TextField with suggestions THEN shows that field", async () => {
  const { component } = setup([Test.Field.textSuggestions]);
  render(component);

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

test("GIVEN ServiceInstanceForm WHEN passed a TextField with parameter suggestions THEN shows that field", async () => {
  // Provide the server-side API with the request handlers.
  const server = setupServer(
    http.get("/api/v1/parameter/:id", ({ params }) => {
      expect(params.id).toEqual("param_name");

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
          source: "user",
          expires: false,
        },
      });
    }),
  );
  // Start the interception.
  server.listen();

  const { component } = setup([Test.Field.textSuggestions2]);
  render(createQuerryWrapper(component));

  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    }),
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", {
    name: `TextInput-${Test.Field.text.name}`,
  });

  // simulate click on the input to show the suggestions
  await act(async () => {
    await userEvent.click(textBox);
  });

  const suggestions = screen.getAllByRole("menuitem");
  expect(suggestions).toHaveLength(3);

  server.close();
});

test("GIVEN ServiceInstanceForm WHEN passed a TextField with parameter suggestions AND no parameters could be retrieved THEN shows that field without suggestions", async () => {
  // Provide the server-side API with the request handlers.
  const server = setupServer(
    http.get("/api/v1/parameter/:id", ({ params }) => {
      expect(params.id).toEqual("param_name");

      return HttpResponse.error();
    }),
  );
  // Start the interception.
  server.listen();

  const { component } = setup([Test.Field.textSuggestions2]);
  render(createQuerryWrapper(component));

  expect(
    screen.getByRole("generic", {
      name: `TextFieldInput-${Test.Field.text.name}`,
    }),
  ).toBeVisible();

  const textBox = screen.getByRole("textbox", {
    name: `TextInput-${Test.Field.text.name}`,
  });

  // simulate click on the input to show the suggestions
  await act(async () => {
    await userEvent.click(textBox);
  });

  const suggestions = screen.queryAllByRole("menuitem");
  expect(suggestions).toHaveLength(0);

  server.close();
});

test("GIVEN ServiceInstanceForm WHEN passed a BooleanField THEN shows that field", async () => {
  const { component } = setup([Test.Field.bool]);
  render(component);

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
  const { component } = setup([Test.Field.enumField]);
  render(component);

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
  const { component } = setup([Test.Field.enumFieldTwoOptions]);
  render(component);

  const field = screen.getByRole("generic", {
    name: `EnumFieldInput-${Test.Field.enumFieldTwoOptions.name}`,
  });
  expect(field).toBeVisible();

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
  const { component } = setup([Test.Field.enumFieldSingleOption]);
  render(component);

  const field = screen.getByRole("generic", {
    name: `EnumFieldInput-${Test.Field.enumFieldSingleOption.name}`,
  });
  expect(field).toBeVisible();

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
  const { component } = setup([Test.Field.nested([Test.Field.text])]);
  render(component);

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
  const { component } = setup([Test.Field.dictList([Test.Field.text])]);
  render(component);

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

  const { component } = setup(
    [Test.Field.nestedDictList([Test.Field.textDisabled])],
    undefined,
    true,
    originalAttributes,
  );
  render(component);

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

  const { component } = setup(fields, submitCb);
  render(component);

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
