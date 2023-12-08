import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  CommandManagerResolverImpl,
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
  QueryResolverImpl,
  ServiceInstanceQueryManager,
  ServiceInstanceStateHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  MockEnvironmentModifier,
  Service,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { DuplicateInstancePage } from "./DuplicateInstancePage";

function setup(entity = "a") {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      ServiceInstanceQueryManager(
        apiHelper,
        ServiceInstanceStateHelper(store),
        scheduler,
      ),
    ]),
  );

  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper, authHelper),
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
          <DuplicateInstancePage
            serviceEntity={Service[entity]}
            instanceId={"4a4a6d14-8cd0-4a16-bc38-4b768eb004e3"}
          />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Duplicate Instance View shows failed state", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "DuplicateInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "DuplicateInstance-Failed" }),
  ).toBeInTheDocument();
});

test("DuplicateInstance View shows success form", async () => {
  const { component, apiHelper } = setup();
  render(component);
  const { service_entity } = ServiceInstance.a;

  expect(
    await screen.findByRole("generic", { name: "DuplicateInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.a }));

  expect(
    await screen.findByRole("generic", { name: "DuplicateInstance-Success" }),
  ).toBeInTheDocument();

  const bandwidthField = screen.getByText("bandwidth");
  expect(bandwidthField).toBeVisible();

  await act(async () => {
    await userEvent.type(bandwidthField, "3");
  });
  await act(async () => {
    await userEvent.click(screen.getByText(words("confirm")));
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: `/lsm/v1/service_inventory/${service_entity}`,
    body: {
      attributes: {
        bandwidth: "3",
        circuits: [
          {
            csp_endpoint: {
              attributes: {
                owner_account_id: "666023226898",
              },
              cloud_service_provider: "AWS",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312922,
              outer_vlan: 1234,
            },
            service_id: 9489784960,
          },
          {
            csp_endpoint: {
              attributes: {
                owner_account_id: "666023226898",
              },
              cloud_service_provider: "AWS",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312923,
              outer_vlan: 1234,
            },
            service_id: 5527919402,
          },
        ],
        customer_locations: "",
        iso_release: "",
        network: "local",
        order_id: 9764848531585,
      },
    },
    environment: "env",
  });
});

test("Given the DuplicateInstance View When changing a embedded entity Then the correct request is fired", async () => {
  const { component, apiHelper } = setup();
  render(component);
  const { service_entity } = ServiceInstance.a;

  expect(
    await screen.findByRole("generic", { name: "DuplicateInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.a }));

  expect(
    await screen.findByRole("generic", { name: "DuplicateInstance-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "circuits" }));
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "1" }));
  });

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "csp_endpoint" }));
  });

  const bandwidthField = screen.getByText("bandwidth");
  expect(bandwidthField).toBeVisible();

  const firstCloudServiceProviderField = screen.getAllByText(
    "cloud_service_provider",
  )[0];

  await act(async () => {
    await userEvent.type(firstCloudServiceProviderField, "2");
  });

  await act(async () => {
    await userEvent.type(bandwidthField, "22");
  });
  await act(async () => {
    await userEvent.click(screen.getByText(words("confirm")));
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: `/lsm/v1/service_inventory/${service_entity}`,
    body: {
      attributes: {
        bandwidth: "22",
        circuits: [
          {
            csp_endpoint: {
              attributes: {
                owner_account_id: "666023226898",
              },
              cloud_service_provider: "AWS",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312922,
              outer_vlan: 1234,
            },
            service_id: 9489784960,
          },
          {
            csp_endpoint: {
              attributes: {
                owner_account_id: "666023226898",
              },
              cloud_service_provider: "AWS2",
              ipx_access: [1000010782, 1000013639],
              region: "us-east-1",
            },
            customer_endpoint: {
              encapsulation: "qinq",
              inner_vlan: 567,
              ipx_access: 1000312923,
              outer_vlan: 1234,
            },
            service_id: 5527919402,
          },
        ],
        customer_locations: "",
        iso_release: "",
        network: "local",
        order_id: 9764848531585,
      },
    },
    environment: "env",
  });
});

test("Given the DuplicateInstance View When changing an embedded entity Then the inputs are displayed correctly", async () => {
  const { component, apiHelper } = setup("ServiceWithAllAttrs");
  render(component);

  expect(
    await screen.findByRole("generic", { name: "DuplicateInstance-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right({ data: ServiceInstance.allAttrs }));

  expect(
    await screen.findByRole("generic", { name: "DuplicateInstance-Success" }),
  ).toBeInTheDocument();

  //check if direct attributes are correctly displayed
  expect(screen.queryByText("editableString")).toBeEnabled();
  expect(screen.queryByText("editableString?")).toBeEnabled();
  expect(screen.queryByText("editableBool")).toBeEnabled();
  expect(screen.queryByText("editableBool?")).toBeEnabled();
  expect(screen.queryByText("editableString[]")).toBeEnabled();
  expect(screen.queryByText("editableString[]?")).toBeEnabled();
  expect(screen.queryByText("editableEnum")).toBeEnabled();
  expect(screen.queryByText("editableEnum?")).toBeEnabled();
  expect(screen.queryByText("editableDict")).toBeEnabled();
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

  expect(within(embedded_base).queryByText("Add")).toBeEnabled();
  expect(within(embedded_base).queryByText("Delete")).toBeDisabled();

  expect(within(editableEmbedded_base).queryByText("Add")).toBeEnabled();
  expect(within(editableEmbedded_base).queryByText("Delete")).toBeDisabled();

  expect(within(optionalEmbedded_base).queryByText("Add")).toBeEnabled();
  expect(within(optionalEmbedded_base).queryByText("Delete")).toBeEnabled();

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
  expect(within(embedded_base).queryByDisplayValue("string")).toBeEnabled();
  expect(
    within(embedded_base).queryByDisplayValue("editableString"),
  ).toBeEnabled();

  expect(within(embedded_base).queryByDisplayValue("string?")).toBeEnabled();
  expect(
    within(embedded_base).queryByDisplayValue("editableString?"),
  ).toBeEnabled();

  expect(within(embedded_base).queryByLabelText("Toggle-bool")).toBeEnabled();
  expect(
    within(embedded_base).queryByLabelText("Toggle-editableBool"),
  ).toBeEnabled();

  expect(within(embedded_base).queryByTestId("bool?-true")).toBeEnabled();
  expect(within(embedded_base).queryByTestId("bool?-false")).toBeEnabled();
  expect(within(embedded_base).queryByTestId("bool?-none")).toBeEnabled();

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
  ).not.toHaveClass("is-disabled");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-editableString[]"),
  ).not.toHaveClass("is-disabled");

  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-string[]?"),
  ).not.toHaveClass("is-disabled");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-editableString[]?"),
  ).not.toHaveClass("is-disabled");

  expect(
    within(embedded_base).queryByTestId("enum-select-toggle"),
  ).not.toHaveClass("pf-m-disabled");
  expect(
    within(embedded_base).queryByTestId("editableEnum-select-toggle"),
  ).not.toHaveClass("pf-m-disabled");

  expect(
    within(embedded_base).queryByTestId("enum?-select-toggle"),
  ).not.toHaveClass("pf-m-disabled");
  expect(
    within(embedded_base).queryByTestId("editableEnum?-select-toggle"),
  ).not.toHaveClass("pf-m-disabled");

  expect(
    within(embedded_base).queryByLabelText("TextInput-dict"),
  ).toBeEnabled();
  expect(
    within(embedded_base).queryByLabelText("TextInput-editableDict"),
  ).toBeEnabled();

  expect(
    within(embedded_base).queryByLabelText("TextInput-dict?"),
  ).toBeEnabled();
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

  expect(within(nested_embedded_base).queryByText("Add")).toBeEnabled();
  expect(within(nested_embedded_base).queryByText("Delete")).toBeDisabled();

  expect(within(nested_editableEmbedded_base).queryByText("Add")).toBeEnabled();
  expect(
    within(nested_editableEmbedded_base).queryByText("Delete"),
  ).toBeDisabled();

  expect(within(nested_optionalEmbedded_base).queryByText("Add")).toBeEnabled();
  expect(
    within(nested_optionalEmbedded_base).queryByText("Delete"),
  ).toBeEnabled();

  expect(
    within(nested_editableOptionalEmbedded_base).queryByText("Add"),
  ).toBeEnabled();
  expect(
    within(nested_editableOptionalEmbedded_base).queryByText("Delete"),
  ).toBeEnabled();
});
