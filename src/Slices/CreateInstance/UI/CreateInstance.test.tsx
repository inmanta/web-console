import React, { act } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import {
  CommandManagerResolverImpl,
  CommandResolverImpl,
  defaultAuthContext,
  getStoreInstance,
  QueryManagerResolverImpl,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  Service,
  ServiceInstance,
  StaticScheduler,
} from "@/Test";
import { InterServiceRelations } from "@/Test/Data/Service";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { CreateInstance } from "./CreateInstance";
expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup(service) {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredApiHelper();

  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );

  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper, defaultAuthContext),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
        }}
      >
        <StoreProvider store={store}>
          <CreateInstance serviceEntity={service} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Given the CreateInstance View When creating an instance with attributes Then the correct request is fired", async () => {
  const { component, apiHelper } = setup(Service.a);

  render(component);

  const bandwidthField = screen.getByText("bandwidth");

  expect(bandwidthField).toBeVisible();

  await act(async () => {
    await userEvent.type(bandwidthField, "2");
  });

  const customerLocationsField = screen.getByText("customer_locations");

  await act(async () => {
    await userEvent.type(customerLocationsField, "5");
  });

  const orderIdField = screen.getByText("order_id");

  await act(async () => {
    await userEvent.type(orderIdField, "7007");
  });

  const networkField = screen.getByText("network");

  expect(networkField).toBeValid();

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await act(async () => {
    await userEvent.click(screen.getByText(words("confirm")));
  });

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: `/lsm/v1/service_inventory/${Service.a.name}`,
    body: {
      attributes: {
        bandwidth: "2",
        circuits: [
          {
            csp_endpoint: {
              attributes: "",
              cloud_service_provider: "",
              ipx_access: null,
              region: "",
            },
            customer_endpoint: {
              encapsulation: "",
              inner_vlan: null,
              ipx_access: null,
              outer_vlan: null,
            },
            service_id: null,
          },
        ],
        customer_locations: "5",
        iso_release: "",
        network: "local",
        order_id: "12347007",
      },
    },
    environment: "env",
  });
});

test("Given the CreateInstance View When creating an instance with Inter-service-relations only Then the correct request is fired", async () => {
  const { component, apiHelper } = setup(Service.withRelationsOnly);

  render(component);

  await act(async () => {
    apiHelper.resolve(Either.right({ data: Service.withIdentity }));
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] }),
    );
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] }),
    );
  });

  const relationInputField = screen.getByPlaceholderText(
    words("common.serviceInstance.relations")("test_entity"),
  );

  await act(async () => {
    await userEvent.type(relationInputField, "a");
  });

  await act(async () => {
    apiHelper.resolve(Either.right({ data: [ServiceInstance.a] }));
  });

  const options = await screen.findAllByRole("option");

  expect(options.length).toBe(1);

  await act(async () => {
    await userEvent.click(options[0]);
  });

  expect(options[0]).toHaveClass("pf-m-selected");

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await act(async () => {
    await userEvent.click(screen.getByText(words("confirm")));
  });

  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: `/lsm/v1/service_inventory/${Service.withRelationsOnly.name}`,
    body: {
      attributes: {
        test_entity: ["service_instance_id_a"],
      },
    },
    environment: "env",
  });
});

test("Given the CreateInstance View When creating an instance with Inter-service-relations only Then the correct request is fired", async () => {
  const { component, apiHelper } = setup(Service.withRelationsOnly);

  render(component);

  await act(async () => {
    apiHelper.resolve(Either.right({ data: Service.withIdentity }));
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] }),
    );
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] }),
    );
  });

  const relationInputField = screen.getByPlaceholderText(
    words("common.serviceInstance.relations")("test_entity"),
  );

  await act(async () => {
    await userEvent.type(relationInputField, "a");
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=250&filter.id_or_service_identity=a`,
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: [ServiceInstance.a] }));
  });
  await act(async () => {
    await userEvent.type(relationInputField, "{selectall}{backspace}ab");
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=250&filter.id_or_service_identity=ab`,
    environment: "env",
  });
  await act(async () => {
    apiHelper.resolve(Either.right({ data: [] }));
  });

  await act(async () => {
    await userEvent.type(relationInputField, "{backspace}{backspace}");
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=250&filter.id_or_service_identity=`,
    environment: "env",
  });
});

test("Given the CreateInstance View When creating an instance with Inter-service-relations only Then the correct request is fired", async () => {
  const { component, apiHelper } = setup(Service.withRelationsOnly);

  render(component);

  await act(async () => {
    apiHelper.resolve(Either.right({ data: Service.withIdentity }));
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] }),
    );
  });
  await act(async () => {
    apiHelper.resolve(
      Either.right({ data: [ServiceInstance.a, ServiceInstance.b] }),
    );
  });

  const relationInputField = screen.getByPlaceholderText(
    words("common.serviceInstance.relations")("test_entity"),
  );

  await act(async () => {
    await userEvent.type(relationInputField, "a");
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=250&filter.id_or_service_identity=a`,
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right({ data: [ServiceInstance.a] }));
  });
  await act(async () => {
    await userEvent.type(relationInputField, "{selectall}{backspace}ab");
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=250&filter.id_or_service_identity=ab`,
    environment: "env",
  });
  await act(async () => {
    apiHelper.resolve(Either.right({ data: [] }));
  });

  await act(async () => {
    await userEvent.type(relationInputField, "{backspace}{backspace}");
  });
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/lsm/v1/service_inventory/${InterServiceRelations.editable.entity_type}?include_deployment_progress=False&limit=250&filter.id_or_service_identity=`,
    environment: "env",
  });
});

test("Given the CreateInstance View When creating entity with default values Then the inputs have correct values set", async () => {
  const { component } = setup(Service.ServiceWithAllAttrs);

  render(component);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  //check if direct attributes have correct default value
  expect(screen.queryByLabelText("TextInput-string")).toHaveValue(
    "default_string",
  );
  expect(screen.queryByLabelText("TextInput-editableString")).toHaveValue(
    "default_string",
  );
  expect(screen.queryByLabelText("TextInput-string?")).toHaveValue(
    "default_string",
  );
  expect(screen.queryByLabelText("TextInput-editableString?")).toHaveValue(
    "default_string",
  );

  expect(screen.queryByLabelText("Toggle-bool")).toBeChecked();
  expect(screen.queryByLabelText("Toggle-editableBool")).toBeChecked();
  expect(screen.queryByTestId("bool?-true")).toBeChecked();
  expect(screen.queryByTestId("editableBool?-true")).toBeChecked();

  expect(screen.queryByLabelText("TextFieldInput-string[]")).toHaveTextContent(
    "1.1.1.1",
  );
  expect(screen.queryByLabelText("TextFieldInput-string[]")).toHaveTextContent(
    "8.8.8.8",
  );
  expect(
    screen.queryByLabelText("TextFieldInput-editableString[]"),
  ).toHaveTextContent("1.1.1.1");
  expect(
    screen.queryByLabelText("TextFieldInput-editableString[]"),
  ).toHaveTextContent("8.8.8.8");
  expect(screen.queryByLabelText("TextFieldInput-string[]?")).toHaveTextContent(
    "1.1.1.1",
  );
  expect(screen.queryByLabelText("TextFieldInput-string[]?")).toHaveTextContent(
    "8.8.8.8",
  );
  expect(
    screen.queryByLabelText("TextFieldInput-editableString[]?"),
  ).toHaveTextContent("1.1.1.1");
  expect(
    screen.queryByLabelText("TextFieldInput-editableString[]?"),
  ).toHaveTextContent("8.8.8.8");

  expect(screen.getByTestId("enum-select-toggle")).toHaveTextContent(
    "OPTION_ONE",
  );
  expect(screen.getByTestId("editableEnum?-select-toggle")).toHaveTextContent(
    "OPTION_ONE",
  );

  expect(screen.getByTestId("editableEnum-select-toggle")).toHaveTextContent(
    "OPTION_ONE",
  );
  expect(screen.getByTestId("enum?-select-toggle")).toHaveTextContent(
    "OPTION_ONE",
  );

  expect(screen.queryByLabelText("TextInput-dict")).toHaveValue(
    '{"default":"value"}',
  );
  expect(screen.queryByLabelText("TextInput-editableDict")).toHaveValue(
    '{"default":"value"}',
  );
  expect(screen.queryByLabelText("TextInput-dict?")).toHaveValue(
    '{"default":"value"}',
  );
  expect(screen.queryByLabelText("TextInput-editableDict?")).toHaveValue(
    '{"default":"value"}',
  );

  //check if embedded entities buttons are correctly displayed
  const embedded_base = screen.getByLabelText(
    "DictListFieldInput-embedded_base",
  );

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: "embedded_base" }),
    );
  });

  //check if direct attributes for embedded entities have correct default values

  await act(async () => {
    await userEvent.click(
      within(embedded_base).getByRole("button", { name: "0" }),
    );
  });
  expect(
    within(embedded_base).queryByLabelText("TextInput-string"),
  ).toHaveValue("default_string");
  expect(
    within(embedded_base).queryByLabelText("TextInput-editableString"),
  ).toHaveValue("default_string");
  expect(
    within(embedded_base).queryByLabelText("TextInput-string?"),
  ).toHaveValue("default_string");
  expect(
    within(embedded_base).queryByLabelText("TextInput-editableString?"),
  ).toHaveValue("default_string");

  expect(within(embedded_base).queryByLabelText("Toggle-bool")).toBeChecked();
  expect(
    within(embedded_base).queryByLabelText("Toggle-editableBool"),
  ).toBeChecked();
  expect(within(embedded_base).queryByTestId("bool?-true")).toBeChecked();
  expect(
    within(embedded_base).queryByTestId("editableBool?-true"),
  ).toBeChecked();

  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-string[]"),
  ).toHaveTextContent("1.1.1.1");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-string[]"),
  ).toHaveTextContent("8.8.8.8");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-editableString[]"),
  ).toHaveTextContent("1.1.1.1");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-editableString[]"),
  ).toHaveTextContent("8.8.8.8");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-string[]?"),
  ).toHaveTextContent("1.1.1.1");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-string[]?"),
  ).toHaveTextContent("8.8.8.8");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-editableString[]?"),
  ).toHaveTextContent("1.1.1.1");
  expect(
    within(embedded_base).queryByLabelText("TextFieldInput-editableString[]?"),
  ).toHaveTextContent("8.8.8.8");

  expect(
    within(embedded_base).getByTestId("enum-select-toggle"),
  ).toHaveTextContent("OPTION_ONE");
  expect(
    within(embedded_base).getByTestId("editableEnum-select-toggle"),
  ).toHaveTextContent("OPTION_ONE");
  expect(
    within(embedded_base).getByTestId("enum?-select-toggle"),
  ).toHaveTextContent("OPTION_ONE");
  expect(
    within(embedded_base).getByTestId("editableEnum?-select-toggle"),
  ).toHaveTextContent("OPTION_ONE");

  expect(within(embedded_base).queryByLabelText("TextInput-dict")).toHaveValue(
    '{"default":"value"}',
  );
  expect(
    within(embedded_base).queryByLabelText("TextInput-editableDict"),
  ).toHaveValue('{"default":"value"}');
  expect(within(embedded_base).queryByLabelText("TextInput-dict?")).toHaveValue(
    '{"default":"value"}',
  );
  expect(
    within(embedded_base).queryByLabelText("TextInput-editableDict?"),
  ).toHaveValue('{"default":"value"}');
});
