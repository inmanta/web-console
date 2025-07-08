import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider, Service, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { CreateInstance } from "./CreateInstance";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

// Mock usePost before the test
const postMock = vi.hoisted(() => vi.fn());
const getMock = vi.hoisted(() => vi.fn());
vi.mock("@/Data/Queries/Helpers/useQueries", () => ({
  usePost: () => postMock,
  useGet: () => getMock,
  useGetWithOptionalEnv: () => getMock,
  useGetWithoutEnv: () => getMock,
}));

function setup(service) {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <CreateInstance serviceEntity={service} />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("CreateInstance", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
    server.use(
      http.get("/lsm/v1/service_catalog/service_name_a", () => {
        return HttpResponse.json({ data: Service.withIdentity });
      }),
      http.get("/lsm/v1/service_catalog/test_entity", () => {
        return HttpResponse.json({ data: Service.withIdentity });
      }),
      http.get("/lsm/v1/service_inventory/test_entity", () => {
        return HttpResponse.json({
          data: [ServiceInstance.a],
          metadata: {
            total: 1,
            before: 0,
            after: 0,
            page_size: 250,
          },
        });
      })
    );
  });

  afterAll(() => server.close());

  beforeEach(() => {
    postMock.mockClear();
  });

  test("Given the CreateInstance View When creating an instance with attributes Then the correct request is fired", async () => {
    const { component } = setup(Service.a);

    render(component);

    const bandwidthField = screen.getByText("bandwidth");

    expect(bandwidthField).toBeVisible();

    await userEvent.type(bandwidthField, "2");

    const customerLocationsField = screen.getByText("customer_locations");

    await userEvent.type(customerLocationsField, "5");

    const orderIdField = screen.getByText("order_id");

    await userEvent.type(orderIdField, "7007");

    const networkField = screen.getByText("network");

    expect(networkField).toBeValid();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    await userEvent.click(screen.getByText(words("confirm")));
    expect(postMock).toHaveBeenCalledWith(`/lsm/v1/service_inventory/${Service.a.name}`, {
      attributes: {
        bandwidth: "2",
        circuits: [
          {
            csp_endpoint: {
              attributes: null,
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
    });
  });

  //TODO: Fix the test scenario
  // test("Given the CreateInstance View When creating an instance with Inter-service-relations only Then the correct request is fired", async () => {
  //   const postMock = vi.fn();

  //   vi.spyOn(queryModule, "usePost").mockReturnValue(postMock);

  //   const { component } = setup(Service.withRelationsOnly);

  //   render(component);

  //   await screen.findByPlaceholderText("Select an instance of test_entity"); // await for the relation input be rendered

  //   const relationInputField = screen.getByLabelText(
  //     "test_entity-select-toggleFilterInput",
  //   );

  //   fireEvent.change(relationInputField, { target: { value: "a" } });

  //   const options = screen.getAllByRole("option");

  //   expect(options.length).toBe(1);

  //   await userEvent.click(options[0]);

  //   expect(options[0]).toHaveClass("pf-m-selected");

  //   await act(async () => {
  //     const results = await axe(document.body);

  //     expect(results).toHaveNoViolations();
  //   });

  //   await userEvent.click(screen.getByText(words("confirm")));

  //   expect(postMock).toHaveBeenCalledWith(
  //     `/lsm/v1/service_inventory/${Service.withRelationsOnly.name}`,
  //     {
  //       attributes: {
  //         test_entity: ["service_instance_id_a"],
  //       },
  //     },
  //   );
  // });

  test("Given the CreateInstance View When creating entity with default values Then the inputs have correct values set", async () => {
    const { component } = setup(Service.ServiceWithAllAttrs);

    render(component);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    //check if direct attributes have correct default value
    expect(screen.queryByLabelText("TextInput-string")).toHaveValue("default_string");
    expect(screen.queryByLabelText("TextInput-editableString")).toHaveValue("default_string");
    expect(screen.queryByLabelText("TextInput-string?")).toHaveValue("default_string");
    expect(screen.queryByLabelText("TextInput-editableString?")).toHaveValue("default_string");

    expect(screen.queryByLabelText("Toggle-bool")).toBeChecked();
    expect(screen.queryByLabelText("Toggle-editableBool")).toBeChecked();
    expect(screen.queryByTestId("bool?-true")).toBeChecked();
    expect(screen.queryByTestId("editableBool?-true")).toBeChecked();

    expect(screen.queryByLabelText("TextFieldInput-string[]")).toHaveTextContent("1.1.1.1");
    expect(screen.queryByLabelText("TextFieldInput-string[]")).toHaveTextContent("8.8.8.8");
    expect(screen.queryByLabelText("TextFieldInput-editableString[]")).toHaveTextContent("1.1.1.1");
    expect(screen.queryByLabelText("TextFieldInput-editableString[]")).toHaveTextContent("8.8.8.8");
    expect(screen.queryByLabelText("TextFieldInput-string[]?")).toHaveTextContent("1.1.1.1");
    expect(screen.queryByLabelText("TextFieldInput-string[]?")).toHaveTextContent("8.8.8.8");
    expect(screen.queryByLabelText("TextFieldInput-editableString[]?")).toHaveTextContent(
      "1.1.1.1"
    );
    expect(screen.queryByLabelText("TextFieldInput-editableString[]?")).toHaveTextContent(
      "8.8.8.8"
    );

    expect(screen.getByTestId("enum-select-toggle")).toHaveTextContent("OPTION_ONE");
    expect(screen.getByTestId("editableEnum?-select-toggle")).toHaveTextContent("OPTION_ONE");

    expect(screen.getByTestId("editableEnum-select-toggle")).toHaveTextContent("OPTION_ONE");
    expect(screen.getByTestId("enum?-select-toggle")).toHaveTextContent("OPTION_ONE");

    expect(screen.queryByLabelText("TextInput-dict")).toHaveValue('{"default":"value"}');
    expect(screen.queryByLabelText("TextInput-editableDict")).toHaveValue('{"default":"value"}');
    expect(screen.queryByLabelText("TextInput-dict?")).toHaveValue('{"default":"value"}');
    expect(screen.queryByLabelText("TextInput-editableDict?")).toHaveValue('{"default":"value"}');

    //check if embedded entities buttons are correctly displayed
    const embedded_base = screen.getByLabelText("DictListFieldInput-embedded_base");

    await userEvent.click(screen.getByRole("button", { name: "embedded_base" }));

    //check if direct attributes for embedded entities have correct default values

    await userEvent.click(within(embedded_base).getByRole("button", { name: "0" }));

    expect(within(embedded_base).queryByLabelText("TextInput-string")).toHaveValue(
      "default_string"
    );
    expect(within(embedded_base).queryByLabelText("TextInput-editableString")).toHaveValue(
      "default_string"
    );
    expect(within(embedded_base).queryByLabelText("TextInput-string?")).toHaveValue(
      "default_string"
    );
    expect(within(embedded_base).queryByLabelText("TextInput-editableString?")).toHaveValue(
      "default_string"
    );

    expect(within(embedded_base).queryByLabelText("Toggle-bool")).toBeChecked();
    expect(within(embedded_base).queryByLabelText("Toggle-editableBool")).toBeChecked();
    expect(within(embedded_base).queryByTestId("bool?-true")).toBeChecked();
    expect(within(embedded_base).queryByTestId("editableBool?-true")).toBeChecked();

    expect(within(embedded_base).queryByLabelText("TextFieldInput-string[]")).toHaveTextContent(
      "1.1.1.1"
    );
    expect(within(embedded_base).queryByLabelText("TextFieldInput-string[]")).toHaveTextContent(
      "8.8.8.8"
    );
    expect(
      within(embedded_base).queryByLabelText("TextFieldInput-editableString[]")
    ).toHaveTextContent("1.1.1.1");
    expect(
      within(embedded_base).queryByLabelText("TextFieldInput-editableString[]")
    ).toHaveTextContent("8.8.8.8");
    expect(within(embedded_base).queryByLabelText("TextFieldInput-string[]?")).toHaveTextContent(
      "1.1.1.1"
    );
    expect(within(embedded_base).queryByLabelText("TextFieldInput-string[]?")).toHaveTextContent(
      "8.8.8.8"
    );
    expect(
      within(embedded_base).queryByLabelText("TextFieldInput-editableString[]?")
    ).toHaveTextContent("1.1.1.1");
    expect(
      within(embedded_base).queryByLabelText("TextFieldInput-editableString[]?")
    ).toHaveTextContent("8.8.8.8");

    expect(within(embedded_base).getByTestId("enum-select-toggle")).toHaveTextContent("OPTION_ONE");
    expect(within(embedded_base).getByTestId("editableEnum-select-toggle")).toHaveTextContent(
      "OPTION_ONE"
    );
    expect(within(embedded_base).getByTestId("enum?-select-toggle")).toHaveTextContent(
      "OPTION_ONE"
    );
    expect(within(embedded_base).getByTestId("editableEnum?-select-toggle")).toHaveTextContent(
      "OPTION_ONE"
    );

    expect(within(embedded_base).queryByLabelText("TextInput-dict")).toHaveValue(
      '{"default":"value"}'
    );
    expect(within(embedded_base).queryByLabelText("TextInput-editableDict")).toHaveValue(
      '{"default":"value"}'
    );
    expect(within(embedded_base).queryByLabelText("TextInput-dict?")).toHaveValue(
      '{"default":"value"}'
    );
    expect(within(embedded_base).queryByLabelText("TextInput-editableDict?")).toHaveValue(
      '{"default":"value"}'
    );
  });
});
