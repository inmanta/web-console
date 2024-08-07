import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { cloneDeep } from "lodash";
import { Either } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  ServiceInstanceStateHelper,
  ServiceInstanceQueryManager,
  CommandResolverImpl,
} from "@/Data";
import {
  DynamicQueryManagerResolverImpl,
  Service,
  StaticScheduler,
  ServiceInstance,
  MockEnvironmentModifier,
  DynamicCommandManagerResolverImpl,
  DeferredApiHelper,
  dependencies,
} from "@/Test";
import { multiNestedEditable } from "@/Test/Data/Service/EmbeddedEntity";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { TriggerInstanceUpdateCommandManager } from "@S/EditInstance/Data";
import { EditInstancePage } from "./EditInstancePage";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

/**
 * @note This configuration for the two last tests cases.
 * Because of redundant data with same id, we need to disable the duplicate-id-aria rule.
 * The fields are already tested in the previous tests.
 * The id's and aria-labels are set using the field name.
 *
 * Todo: Remove this configuration when the test data is updated.
 */
const axeLimited = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
    "duplicate-id-aria": { enabled: false },
  },
});

function setup(entity = "a", multiNested = false) {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      ServiceInstanceQueryManager(
        apiHelper,
        ServiceInstanceStateHelper(store),
        scheduler,
      ),
    ]),
  );

  const service = multiNested
    ? { ...Service[entity], embedded_entities: multiNestedEditable }
    : Service[entity];

  const commandManager = TriggerInstanceUpdateCommandManager(apiHelper);
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolverImpl([commandManager]),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentModifier: new MockEnvironmentModifier(),
        }}
      >
        <StoreProvider store={store}>
          <EditInstancePage
            serviceEntity={service}
            instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Edit Instance View shows failed state", async () => {
  const { component, apiHelper } = setup();

  render(component);

  expect(
    await screen.findByRole("region", { name: "EditInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("region", { name: "EditInstance-Failed" }),
  ).toBeInTheDocument();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("EditInstance View shows success form", async () => {
  const { component, apiHelper } = setup();

  render(component);
  const { service_entity, id, version } = ServiceInstance.a;

  expect(
    await screen.findByRole("region", { name: "EditInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.a }));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Success" }),
  ).toBeInTheDocument();

  const bandwidthField = screen.getByText("bandwidth");

  expect(bandwidthField).toBeVisible();

  await act(async () => {
    await userEvent.type(bandwidthField, "2");
  });
  await act(async () => {
    await userEvent.click(screen.getByText(words("confirm")));
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "PATCH",
    url: `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`,
    body: {
      attributes: {
        bandwidth: "2",
      },
    },
    environment: "env",
  });

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given the EditInstance View When changing a v1 embedded entity Then the correct request is fired", async () => {
  const { component, apiHelper } = setup();

  render(component);
  const { service_entity, id, version } = ServiceInstance.a;

  expect(
    await screen.findByRole("region", { name: "EditInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.a }));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "circuits" }));
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "0" }));
  });

  expect(screen.getByLabelText("TextInput-service_id")).toBeDisabled();

  const bandwidthField = screen.getByText("bandwidth");

  expect(bandwidthField).toBeVisible();

  await act(async () => {
    await userEvent.type(bandwidthField, "22");
  });
  await act(async () => {
    await userEvent.click(screen.getByText(words("confirm")));
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "PATCH",
    url: `/lsm/v1/service_inventory/${service_entity}/${id}?current_version=${version}`,
    body: {
      attributes: {
        bandwidth: "22",
      },
    },
    environment: "env",
  });

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given the EditInstance View When changing a v2 embedded entity Then the correct request  with correct body is fired", async () => {
  const { component, apiHelper } = setup("d");

  render(component);
  const { service_entity, id, version } = ServiceInstance.d;

  expect(
    await screen.findByRole("region", { name: "EditInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.d }));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "circuits" }));
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "0" }));
  });

  expect(screen.getByLabelText("TextInput-service_id")).toBeDisabled();

  const bandwidthField = screen.getByText("bandwidth");

  expect(bandwidthField).toBeVisible();

  await act(async () => {
    await userEvent.type(bandwidthField, "24");
  });
  await act(async () => {
    await userEvent.click(screen.getByText(words("confirm")));
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);

  if (!ServiceInstance.d.active_attributes) {
    throw Error("Active attributes for this instance should be defined");
  }

  const expectedInstance = cloneDeep(
    ServiceInstance.d.active_attributes,
  ) as Record<string, unknown>;

  expectedInstance.bandwidth = "24";

  //cast type for pending Request
  const patchId = (
    apiHelper.pendingRequests[0] as {
      body: {
        patch_id;
      };
    }
  ).body.patch_id;

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "PATCH",
    url: `/lsm/v2/service_inventory/${service_entity}/${id}?current_version=${version}`,
    body: {
      edit: [
        {
          edit_id: `${service_entity}_version=${version}`,
          operation: "replace",
          target: ".",
          value: expectedInstance,
        },
      ],
      patch_id: patchId,
    },
    environment: "env",
  });

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given the EditInstance View When changing an embedded entity Then the inputs are displayed correctly", async () => {
  const { component, apiHelper } = setup("ServiceWithAllAttrs");

  render(component);

  expect(
    await screen.findByRole("region", { name: "EditInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.allAttrs }));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Success" }),
  ).toBeInTheDocument();

  //check if direct attributes are correctly displayed
  expect(screen.queryByText("string")).not.toBeInTheDocument();
  expect(screen.queryByText("editableString")).toBeEnabled();

  expect(screen.queryByText("string?")).not.toBeInTheDocument();
  expect(screen.queryByText("editableString?")).toBeEnabled();

  expect(screen.queryByText("bool")).not.toBeInTheDocument();
  expect(screen.queryByText("editableBool")).toBeEnabled();

  expect(screen.queryByText("bool?")).not.toBeInTheDocument();
  expect(screen.queryByText("editableBool?")).toBeEnabled();

  expect(screen.queryByText("string[]")).not.toBeInTheDocument();
  expect(screen.queryByText("editableString[]")).toBeEnabled();

  expect(screen.queryByText("string[]?")).not.toBeInTheDocument();
  expect(screen.queryByText("editableString[]?")).toBeEnabled();

  expect(screen.queryByText("enum")).not.toBeInTheDocument();
  expect(screen.queryByText("editableEnum")).toBeEnabled();

  expect(screen.queryByText("enum?")).not.toBeInTheDocument();
  expect(screen.queryByText("editableEnum?")).toBeEnabled();

  expect(screen.queryByText("dict")).not.toBeInTheDocument();
  expect(screen.queryByText("editableDict")).toBeEnabled();

  expect(screen.queryByText("dict?")).not.toBeInTheDocument();
  expect(screen.queryByText("editableDict?")).toBeEnabled();

  //check if embedded entities buttons are correctly displayed
  const embedded_base = screen.getByLabelText(
    "DictListFieldInput-embedded_base",
  );
  const editableEmbedded_base = screen.getByLabelText(
    "DictListFieldInput-editableEmbedded_base",
  );
  const optionalEmbedded_base = screen.getByLabelText(
    "DictListFieldInput-optionalEmbedded_base",
  );
  const editableOptionalEmbedded_base = screen.getByLabelText(
    "DictListFieldInput-editableOptionalEmbedded_base",
  );

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "embedded_base" }),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "editableEmbedded_base" }),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "optionalEmbedded_base" }),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "editableOptionalEmbedded_base" }),
    );
  });

  expect(within(embedded_base).queryByText("Add")).toBeDisabled();
  expect(within(embedded_base).queryByText("Delete")).toBeDisabled();

  expect(within(editableEmbedded_base).queryByText("Add")).toBeEnabled();
  expect(within(editableEmbedded_base).queryByText("Delete")).toBeDisabled();

  expect(within(optionalEmbedded_base).queryByText("Add")).toBeDisabled();
  expect(within(optionalEmbedded_base).queryByText("Delete")).toBeDisabled();

  expect(
    within(editableOptionalEmbedded_base).queryByText("Add"),
  ).toBeEnabled();
  expect(
    within(editableOptionalEmbedded_base).queryByText("Delete"),
  ).toBeEnabled();

  //check if direct attributes for embedded entities are correctly displayed

  await act(async () => {
    await userEvent.click(
      within(embedded_base).getByRole("button", { name: "0" }),
    );
  });
  expect(within(embedded_base).queryByDisplayValue("string")).toBeDisabled();
  expect(
    within(embedded_base).queryByDisplayValue("editableString"),
  ).toBeEnabled();

  expect(within(embedded_base).queryByDisplayValue("string?")).toBeDisabled();
  expect(
    within(embedded_base).queryByDisplayValue("editableString?"),
  ).toBeEnabled();

  expect(within(embedded_base).queryByLabelText("Toggle-bool")).toBeDisabled();
  expect(
    within(embedded_base).queryByLabelText("Toggle-editableBool"),
  ).toBeEnabled();

  expect(within(embedded_base).queryByTestId("bool?-true")).toBeDisabled();
  expect(within(embedded_base).queryByTestId("bool?-false")).toBeDisabled();
  expect(within(embedded_base).queryByTestId("bool?-none")).toBeDisabled();

  expect(
    within(embedded_base).queryByTestId("editableBool?-true"),
  ).toBeEnabled();
  expect(
    within(embedded_base).queryByTestId("editableBool?-false"),
  ).toBeEnabled();
  expect(
    within(embedded_base).queryByTestId("editableBool?-none"),
  ).toBeEnabled();

  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-string[]"),
  ).toHaveClass("is-disabled");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-editableString[]"),
  ).not.toHaveClass("is-disabled");

  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-string[]?"),
  ).toHaveClass("is-disabled");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-editableString[]?"),
  ).not.toHaveClass("is-disabled");

  expect(within(embedded_base).queryByTestId("enum-select-toggle")).toHaveClass(
    "pf-m-disabled",
  );
  expect(
    within(embedded_base).queryByTestId("editableEnum-select-toggle"),
  ).not.toHaveClass("pf-m-disabled");

  expect(
    within(embedded_base).queryByTestId("enum?-select-toggle"),
  ).toHaveClass("pf-m-disabled");
  expect(
    within(embedded_base).queryByTestId("editableEnum?-select-toggle"),
  ).not.toHaveClass("pf-m-disabled");

  expect(
    within(embedded_base).queryByLabelText("TextInput-dict"),
  ).toBeDisabled();
  expect(
    within(embedded_base).queryByLabelText("TextInput-editableDict"),
  ).toBeEnabled();

  expect(
    within(embedded_base).queryByLabelText("TextInput-dict?"),
  ).toBeDisabled();
  expect(
    within(embedded_base).queryByLabelText("TextInput-editableDict?"),
  ).toBeEnabled();

  //check controls of nested entities

  const nested_embedded_base = within(embedded_base).getByLabelText(
    "DictListFieldInput-embedded_base.0.embedded",
  );
  const nested_editableEmbedded_base = within(embedded_base).getByLabelText(
    "DictListFieldInput-embedded_base.0.editableEmbedded",
  );
  const nested_optionalEmbedded_base = within(embedded_base).getByLabelText(
    "DictListFieldInput-embedded_base.0.embedded?",
  );
  const nested_editableOptionalEmbedded_base = screen.getByLabelText(
    "DictListFieldInput-embedded_base.0.editableEmbedded?",
  );

  await act(async () => {
    await userEvent.click(
      within(embedded_base).getByRole("button", { name: "embedded" }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(embedded_base).getByRole("button", {
        name: "editableEmbedded",
      }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(embedded_base).getByRole("button", {
        name: "embedded?",
      }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(embedded_base).getByRole("button", {
        name: "editableEmbedded?",
      }),
    );
  });

  expect(within(nested_embedded_base).queryByText("Add")).toBeDisabled();
  expect(within(nested_embedded_base).queryByText("Delete")).toBeDisabled();

  expect(within(nested_editableEmbedded_base).queryByText("Add")).toBeEnabled();
  expect(
    within(nested_editableEmbedded_base).queryByText("Delete"),
  ).toBeDisabled();

  expect(
    within(nested_optionalEmbedded_base).queryByText("Add"),
  ).toBeDisabled();
  expect(
    within(nested_optionalEmbedded_base).queryByText("Delete"),
  ).toBeDisabled();

  expect(
    within(nested_editableOptionalEmbedded_base).queryByText("Add"),
  ).toBeEnabled();
  expect(
    within(nested_editableOptionalEmbedded_base).queryByText("Delete"),
  ).toBeEnabled();

  await act(async () => {
    const results = await axeLimited(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("Given the EditInstance View When adding new nested embedded entity Then the inputs for it are displayed correctly", async () => {
  const { component, apiHelper } = setup("ServiceWithAllAttrs");

  render(component);

  expect(
    await screen.findByRole("region", { name: "EditInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.allAttrs }));

  expect(
    await screen.findByRole("generic", { name: "EditInstance-Success" }),
  ).toBeInTheDocument();
  //add new entity an verify if all are enabled
  const editableOptionalEmbedded_base = screen.getByLabelText(
    "DictListFieldInput-editableOptionalEmbedded_base",
  );

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "editableOptionalEmbedded_base" }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(editableOptionalEmbedded_base).getByText("Add"),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(editableOptionalEmbedded_base).getByRole("button", { name: "1" }),
    );
  });
  const addedOptionalEmbedded = screen.getByLabelText(
    "DictListFieldInputItem-editableOptionalEmbedded_base.1",
  );

  //check if direct attributes are correctly displayed
  expect(within(addedOptionalEmbedded).queryByText("string")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableString"),
  ).toBeEnabled();

  expect(within(addedOptionalEmbedded).queryByText("string?")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableString?"),
  ).toBeEnabled();

  expect(within(addedOptionalEmbedded).queryByText("bool")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableBool"),
  ).toBeEnabled();

  expect(within(addedOptionalEmbedded).queryByText("bool?")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableBool?"),
  ).toBeEnabled();

  expect(within(addedOptionalEmbedded).queryByText("string[]")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableString[]"),
  ).toBeEnabled();

  expect(within(addedOptionalEmbedded).queryByText("string[]?")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableString[]?"),
  ).toBeEnabled();

  expect(within(addedOptionalEmbedded).queryByText("enum")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableEnum"),
  ).toBeEnabled();

  expect(within(addedOptionalEmbedded).queryByText("enum?")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableEnum?"),
  ).toBeEnabled();

  expect(within(addedOptionalEmbedded).queryByText("dict")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableDict"),
  ).toBeEnabled();

  expect(within(addedOptionalEmbedded).queryByText("dict?")).toBeEnabled();
  expect(
    within(addedOptionalEmbedded).queryByText("editableDict?"),
  ).toBeEnabled();

  const nested_embedded_base = within(addedOptionalEmbedded).getByLabelText(
    "DictListFieldInput-editableOptionalEmbedded_base.1.embedded",
  );
  const nested_editableEmbedded_base = within(
    addedOptionalEmbedded,
  ).getByLabelText(
    "DictListFieldInput-editableOptionalEmbedded_base.1.editableEmbedded",
  );
  const nested_optionalEmbedded_base = within(
    addedOptionalEmbedded,
  ).getByLabelText(
    "DictListFieldInput-editableOptionalEmbedded_base.1.embedded?",
  );
  const nested_editableOptionalEmbedded_base = screen.getByLabelText(
    "DictListFieldInput-editableOptionalEmbedded_base.1.editableEmbedded?",
  );

  await act(async () => {
    await userEvent.click(
      within(addedOptionalEmbedded).getByRole("button", { name: "embedded" }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(addedOptionalEmbedded).getByRole("button", {
        name: "editableEmbedded",
      }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(addedOptionalEmbedded).getByRole("button", {
        name: "embedded?",
      }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(addedOptionalEmbedded).getByRole("button", {
        name: "editableEmbedded?",
      }),
    );
  });

  expect(within(nested_embedded_base).queryByText("Add")).toBeEnabled();
  expect(within(nested_embedded_base).queryByText("Delete")).toBeDisabled();

  expect(within(nested_editableEmbedded_base).queryByText("Add")).toBeEnabled();
  expect(
    within(nested_editableEmbedded_base).queryByText("Delete"),
  ).toBeDisabled();

  expect(within(nested_optionalEmbedded_base).queryByText("Add")).toBeEnabled();
  await act(async () => {
    await userEvent.click(
      within(nested_optionalEmbedded_base).getByText("Add"),
    );
  });
  expect(
    within(nested_optionalEmbedded_base).queryByText("Delete"),
  ).toBeEnabled();

  expect(
    within(nested_editableOptionalEmbedded_base).queryByText("Add"),
  ).toBeEnabled();
  await act(async () => {
    await userEvent.click(
      within(nested_editableOptionalEmbedded_base).getByText("Add"),
    );
  });

  expect(
    within(nested_editableOptionalEmbedded_base).queryByText("Delete"),
  ).toBeEnabled();

  await act(async () => {
    const results = await axeLimited(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN the EditInstance View WHEN changing an embedded entity with nested embedded entities THEN the new fields are enabled", async () => {
  const { component, apiHelper } = setup("a", true);

  render(component);

  expect(
    await screen.findByRole("region", { name: "EditInstance-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: ServiceInstance.a }));
  });

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "embedded" }));
  });

  await act(async () => {
    await userEvent.click(screen.getByText("Add"));
  });

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "0" }));
  });

  await act(async () => {
    await userEvent.click(screen.getAllByText("Add")[1]);
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "embedded_single" }),
    );
  });

  await act(async () => {
    await userEvent.click(screen.getAllByText("Add")[2]);
  });

  const another_embedded_group = screen.getByLabelText(
    "DictListFieldInput-embedded.0.embedded_single.another_embedded",
  );

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "another_embedded" }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(another_embedded_group).getByRole("button", { name: "0" }),
    );
  });

  const deep_nested_group = screen.getByLabelText(
    "DictListFieldInput-embedded.0.embedded_single.another_embedded.0.another_deeper_embedded",
  );

  await act(async () => {
    await userEvent.click(within(deep_nested_group).getByText("Add"));
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "another_deeper_embedded" }),
    );
  });

  await act(async () => {
    await userEvent.click(
      within(deep_nested_group).getByRole("button", { name: "0" }),
    );
  });

  // expect all fields in deep_nested_group to be enabled
  const deep_nested_group_fields =
    within(deep_nested_group).getAllByRole("textbox");

  deep_nested_group_fields.forEach((field) => {
    expect(field).toBeEnabled();
  });
});
