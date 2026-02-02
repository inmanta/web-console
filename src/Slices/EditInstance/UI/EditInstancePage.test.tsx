import { act } from "react";
import { useParams } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { cloneDeep } from "lodash";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Service, ServiceInstance, MockedDependencyProvider } from "@/Test";
import { multiNestedEditable } from "@/Test/Data/Service/EmbeddedEntity";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Page } from "./Page";

// Mock usePatch before the test
const mockPatchFn = vi.fn();
vi.mock("@/Data/Queries/Helpers/useQueries", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    usePatch: () => mockPatchFn,
  };
});

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

const mockedUseParams = vi.mocked(useParams);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Page />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("EditInstancePage", () => {
  const instance = "4a4a6d14-8cd0-4a16-bc38-4b768eb004e3";

  const server = setupServer(
    http.get("/lsm/v1/service_catalog/service_name_a", () => {
      return HttpResponse.json({ data: Service.a });
    }),
    http.get("/lsm/v1/service_catalog/service_name_b", () => {
      return HttpResponse.json({ data: Service.b });
    }),
    http.get("/lsm/v1/service_catalog/service_name_c", () => {
      return HttpResponse.json({ data: { ...Service.c, embedded_entities: multiNestedEditable } });
    }),
    http.get("/lsm/v1/service_catalog/service_name_d", () => {
      return HttpResponse.json({ data: Service.d });
    }),
    http.get("/lsm/v1/service_catalog/service_name_all_attrs", () => {
      return HttpResponse.json({ data: Service.ServiceWithAllAttrs });
    }),
    http.get(
      "/lsm/v1/service_inventory/service_name_a/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
      () => {
        return HttpResponse.json({ data: ServiceInstance.a });
      }
    ),
    http.get(
      "/lsm/v1/service_inventory/service_name_b/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
      () => {
        return HttpResponse.json(
          {
            message: "Something went wrong",
          },
          { status: 500 }
        );
      }
    ),
    http.get(
      "/lsm/v1/service_inventory/service_name_c/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
      () => {
        return HttpResponse.json({
          data: ServiceInstance.c,
        });
      }
    ),
    http.get(
      "/lsm/v1/service_inventory/service_name_d/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
      () => {
        return HttpResponse.json({
          data: ServiceInstance.d,
        });
      }
    ),
    http.get(
      "/lsm/v1/service_inventory/service_name_all_attrs/4a4a6d14-8cd0-4a16-bc38-4b768eb004e3",
      () => {
        return HttpResponse.json({
          data: ServiceInstance.allAttrs,
        });
      }
    ),
    http.patch("/lsm/v1/service_inventory/service_name_a/service_instance_id_a", async () => {}),
    http.patch("/lsm/v2/service_inventory/service_name_d/service_instance_id_a", async () => {})
  );

  beforeAll(() => {
    server.listen();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mockPatchFn.mockClear();
  });

  afterAll(() => {
    server.close();
    vi.clearAllMocks();
  });

  test("Edit Instance View shows failed state", async () => {
    mockedUseParams.mockReturnValue({ service: "service_name_b", instance });

    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "EditInstance-Loading" })).toBeInTheDocument();

    expect(await screen.findByRole("region", { name: "EditInstance-Failed" })).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("EditInstance View shows success form", async () => {
    mockedUseParams.mockReturnValue({ service: "service_name_a", instance });

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "EditInstance-Success" })
    ).toBeInTheDocument();

    const bandwidthField = screen.getByText("bandwidth");

    expect(bandwidthField).toBeVisible();

    await userEvent.type(bandwidthField, "2");

    await userEvent.click(screen.getByText(words("confirm")));

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the EditInstance View When changing a v1 embedded entity Then the correct request is fired", async () => {
    mockedUseParams.mockReturnValue({ service: "service_name_a", instance });

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "EditInstance-Success" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "circuits" }));

    await userEvent.click(screen.getByRole("button", { name: "0" }));

    expect(screen.getByLabelText("TextInput-service_id")).toBeDisabled();

    const bandwidthField = screen.getByText("bandwidth");

    expect(bandwidthField).toBeVisible();

    await userEvent.type(bandwidthField, "22");

    await userEvent.click(screen.getByText(words("confirm")));

    expect(mockPatchFn).toHaveBeenCalledWith(
      "/lsm/v1/service_inventory/service_name_a/service_instance_id_a?current_version=3",
      { attributes: { bandwidth: "22" } }
    );

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the EditInstance View When changing a v2 embedded entity Then the correct request  with correct body is fired", async () => {
    mockedUseParams.mockReturnValue({ service: "service_name_d", instance });

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "EditInstance-Success" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "circuits" }));

    await userEvent.click(screen.getByRole("button", { name: "0" }));

    expect(screen.getByLabelText("TextInput-service_id")).toBeDisabled();

    const bandwidthField = screen.getByText("bandwidth");

    expect(bandwidthField).toBeVisible();

    await userEvent.type(bandwidthField, "24");

    await userEvent.click(screen.getByText(words("confirm")));

    if (!ServiceInstance.d.active_attributes) {
      throw Error("Active attributes for this instance should be defined");
    }

    const expectedInstance = cloneDeep(ServiceInstance.d.active_attributes) as Record<
      string,
      unknown
    >;

    expectedInstance.bandwidth = "24";

    const body = {
      edit: [
        {
          edit_id: "service_instance_id_a_version=3",
          operation: "replace",
          target: ".",
          value: expectedInstance,
        },
      ],
      patch_id: expect.any(String),
    };

    expect(mockPatchFn).toHaveBeenCalledWith(
      "/lsm/v2/service_inventory/service_name_d/service_instance_id_a?current_version=3",
      body
    );

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("Given the EditInstance View When changing an embedded entity Then the inputs are displayed correctly", async () => {
    mockedUseParams.mockReturnValue({ service: "service_name_all_attrs", instance });
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "EditInstance-Success" })
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
    const embedded_base = screen.getByLabelText("DictListFieldInput-embedded_base");
    const editableEmbedded_base = screen.getByLabelText("DictListFieldInput-editableEmbedded_base");
    const optionalEmbedded_base = screen.getByLabelText("DictListFieldInput-optionalEmbedded_base");
    const editableOptionalEmbedded_base = screen.getByLabelText(
      "DictListFieldInput-editableOptionalEmbedded_base"
    );

    await userEvent.click(screen.getByRole("button", { name: "embedded_base" }));

    await userEvent.click(screen.getByRole("button", { name: "editableEmbedded_base" }));

    await userEvent.click(screen.getByRole("button", { name: "optionalEmbedded_base" }));

    await userEvent.click(screen.getByRole("button", { name: "editableOptionalEmbedded_base" }));

    expect(within(embedded_base).queryByRole("button", { name: "Add" })).toBeDisabled();
    expect(within(embedded_base).queryByRole("button", { name: "Delete" })).toBeDisabled();

    expect(within(editableEmbedded_base).queryByRole("button", { name: "Add" })).toBeEnabled();
    expect(within(editableEmbedded_base).queryByRole("button", { name: "Delete" })).toBeDisabled();

    expect(within(optionalEmbedded_base).queryByRole("button", { name: "Add" })).toBeDisabled();
    expect(within(optionalEmbedded_base).queryByRole("button", { name: "Delete" })).toBeDisabled();

    expect(
      within(editableOptionalEmbedded_base).queryByRole("button", {
        name: "Add",
      })
    ).toBeEnabled();
    expect(
      within(editableOptionalEmbedded_base).queryByRole("button", {
        name: "Delete",
      })
    ).toBeEnabled();

    //check if direct attributes for embedded entities are correctly displayed
    await userEvent.click(within(embedded_base).getByRole("button", { name: "0" }));

    expect(within(embedded_base).queryByDisplayValue("string")).toBeDisabled();
    expect(within(embedded_base).queryByDisplayValue("editableString")).toBeEnabled();

    expect(within(embedded_base).queryByDisplayValue("string?")).toBeDisabled();
    expect(within(embedded_base).queryByDisplayValue("editableString?")).toBeEnabled();

    expect(within(embedded_base).queryByLabelText("Toggle-bool")).toBeDisabled();
    expect(within(embedded_base).queryByLabelText("Toggle-editableBool")).toBeEnabled();

    expect(within(embedded_base).queryByTestId("bool?-true")).toBeDisabled();
    expect(within(embedded_base).queryByTestId("bool?-false")).toBeDisabled();
    expect(within(embedded_base).queryByTestId("bool?-none")).toBeDisabled();

    expect(within(embedded_base).queryByTestId("editableBool?-true")).toBeEnabled();
    expect(within(embedded_base).queryByTestId("editableBool?-false")).toBeEnabled();
    expect(within(embedded_base).queryByTestId("editableBool?-none")).toBeEnabled();

    expect(within(embedded_base).queryByLabelText("TextFieldInput-string[]")).toHaveClass(
      "is-disabled"
    );
    expect(
      within(embedded_base).queryByLabelText("TextFieldInput-editableString[]")
    ).not.toHaveClass("is-disabled");

    expect(within(embedded_base).queryByLabelText("TextFieldInput-string[]?")).toHaveClass(
      "is-disabled"
    );
    expect(
      within(embedded_base).queryByLabelText("TextFieldInput-editableString[]?")
    ).not.toHaveClass("is-disabled");

    expect(within(embedded_base).queryByTestId("enum-select-toggle")).toHaveClass("pf-m-disabled");
    expect(within(embedded_base).queryByTestId("editableEnum-select-toggle")).not.toHaveClass(
      "pf-m-disabled"
    );

    expect(within(embedded_base).queryByTestId("enum?-select-toggle")).toHaveClass("pf-m-disabled");
    expect(within(embedded_base).queryByTestId("editableEnum?-select-toggle")).not.toHaveClass(
      "pf-m-disabled"
    );

    expect(within(embedded_base).queryByLabelText("TextInput-dict")).toBeDisabled();
    expect(within(embedded_base).queryByLabelText("TextInput-editableDict")).toBeEnabled();

    expect(within(embedded_base).queryByLabelText("TextInput-dict?")).toBeDisabled();
    expect(within(embedded_base).queryByLabelText("TextInput-editableDict?")).toBeEnabled();

    //check controls of nested entities

    const nested_embedded_base = within(embedded_base).getByLabelText(
      "DictListFieldInput-embedded_base.0.embedded"
    );
    const nested_editableEmbedded_base = within(embedded_base).getByLabelText(
      "DictListFieldInput-embedded_base.0.editableEmbedded"
    );
    const nested_optionalEmbedded_base = within(embedded_base).getByLabelText(
      "DictListFieldInput-embedded_base.0.embedded?"
    );
    const nested_editableOptionalEmbedded_base = screen.getByLabelText(
      "DictListFieldInput-embedded_base.0.editableEmbedded?"
    );

    await userEvent.click(within(embedded_base).getByRole("button", { name: "embedded" }));

    await userEvent.click(
      within(embedded_base).getByRole("button", {
        name: "editableEmbedded",
      })
    );

    await userEvent.click(
      within(embedded_base).getByRole("button", {
        name: "embedded?",
      })
    );

    await userEvent.click(
      within(embedded_base).getByRole("button", {
        name: "editableEmbedded?",
      })
    );

    expect(within(nested_embedded_base).queryByRole("button", { name: "Add" })).toBeDisabled();
    expect(within(nested_embedded_base).queryByRole("button", { name: "Delete" })).toBeDisabled();

    expect(
      within(nested_editableEmbedded_base).queryByRole("button", {
        name: "Add",
      })
    ).toBeEnabled();
    expect(
      within(nested_editableEmbedded_base).queryByRole("button", {
        name: "Delete",
      })
    ).toBeDisabled();

    expect(
      within(nested_optionalEmbedded_base).queryByRole("button", {
        name: "Add",
      })
    ).toBeDisabled();
    expect(
      within(nested_optionalEmbedded_base).queryByRole("button", {
        name: "Delete",
      })
    ).toBeDisabled();

    expect(
      within(nested_editableOptionalEmbedded_base).queryByRole("button", {
        name: "Add",
      })
    ).toBeEnabled();
    expect(
      within(nested_editableOptionalEmbedded_base).queryByRole("button", {
        name: "Delete",
      })
    ).toBeEnabled();
  });

  test("Given the EditInstance View When adding new nested embedded entity Then the inputs for it are displayed correctly", async () => {
    mockedUseParams.mockReturnValue({ service: "service_name_all_attrs", instance });
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", { name: "EditInstance-Success" })
    ).toBeInTheDocument();
    //add new entity an verify if all are enabled
    const editableOptionalEmbedded_base = screen.getByLabelText(
      "DictListFieldInput-editableOptionalEmbedded_base"
    );

    await userEvent.click(screen.getByRole("button", { name: "editableOptionalEmbedded_base" }));

    await userEvent.click(within(editableOptionalEmbedded_base).getByText("Add"));

    await userEvent.click(within(editableOptionalEmbedded_base).getByRole("button", { name: "1" }));

    const addedOptionalEmbedded = screen.getByLabelText(
      "DictListFieldInputItem-editableOptionalEmbedded_base.1"
    );

    //check if direct attributes are correctly displayed
    expect(within(addedOptionalEmbedded).queryByText("string")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableString")).toBeEnabled();

    expect(within(addedOptionalEmbedded).queryByText("string?")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableString?")).toBeEnabled();

    expect(within(addedOptionalEmbedded).queryByText("bool")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableBool")).toBeEnabled();

    expect(within(addedOptionalEmbedded).queryByText("bool?")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableBool?")).toBeEnabled();

    expect(within(addedOptionalEmbedded).queryByText("string[]")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableString[]")).toBeEnabled();

    expect(within(addedOptionalEmbedded).queryByText("string[]?")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableString[]?")).toBeEnabled();

    expect(within(addedOptionalEmbedded).queryByText("enum")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableEnum")).toBeEnabled();

    expect(within(addedOptionalEmbedded).queryByText("enum?")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableEnum?")).toBeEnabled();

    expect(within(addedOptionalEmbedded).queryByText("dict")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableDict")).toBeEnabled();

    expect(within(addedOptionalEmbedded).queryByText("dict?")).toBeEnabled();
    expect(within(addedOptionalEmbedded).queryByText("editableDict?")).toBeEnabled();

    const nested_embedded_base = within(addedOptionalEmbedded).getByLabelText(
      "DictListFieldInput-editableOptionalEmbedded_base.1.embedded"
    );
    const nested_editableEmbedded_base = within(addedOptionalEmbedded).getByLabelText(
      "DictListFieldInput-editableOptionalEmbedded_base.1.editableEmbedded"
    );
    const nested_optionalEmbedded_base = within(addedOptionalEmbedded).getByLabelText(
      "DictListFieldInput-editableOptionalEmbedded_base.1.embedded?"
    );
    const nested_editableOptionalEmbedded_base = screen.getByLabelText(
      "DictListFieldInput-editableOptionalEmbedded_base.1.editableEmbedded?"
    );

    await userEvent.click(within(addedOptionalEmbedded).getByRole("button", { name: "embedded" }));

    await userEvent.click(
      within(addedOptionalEmbedded).getByRole("button", {
        name: "editableEmbedded",
      })
    );

    await userEvent.click(
      within(addedOptionalEmbedded).getByRole("button", {
        name: "embedded?",
      })
    );

    await userEvent.click(
      within(addedOptionalEmbedded).getByRole("button", {
        name: "editableEmbedded?",
      })
    );

    expect(within(nested_embedded_base).queryByRole("button", { name: "Add" })).toBeEnabled();
    expect(within(nested_embedded_base).queryByRole("button", { name: "Delete" })).toBeDisabled();

    expect(
      within(nested_editableEmbedded_base).queryByRole("button", {
        name: "Add",
      })
    ).toBeEnabled();
    expect(
      within(nested_editableEmbedded_base).queryByRole("button", {
        name: "Delete",
      })
    ).toBeDisabled();

    expect(
      within(nested_optionalEmbedded_base).queryByRole("button", {
        name: "Add",
      })
    ).toBeEnabled();

    await userEvent.click(within(nested_optionalEmbedded_base).getByText("Add"));

    expect(
      within(nested_optionalEmbedded_base).queryByRole("button", {
        name: "Delete",
      })
    ).toBeEnabled();

    expect(
      within(nested_editableOptionalEmbedded_base).queryByRole("button", {
        name: "Add",
      })
    ).toBeEnabled();

    await userEvent.click(within(nested_editableOptionalEmbedded_base).getByText("Add"));

    expect(
      within(nested_editableOptionalEmbedded_base).queryByRole("button", {
        name: "Delete",
      })
    ).toBeEnabled();
  });

  test("GIVEN the EditInstance View WHEN changing an embedded entity with nested embedded entities THEN the new fields are enabled", async () => {
    mockedUseParams.mockReturnValue({ service: "service_name_c", instance });

    const { component } = setup();

    render(component);

    expect(await screen.findByLabelText("EditInstance-Success")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "embedded" }));

    await userEvent.click(screen.getByText("Add"));

    await userEvent.click(screen.getByRole("button", { name: "0" }));

    await userEvent.click(screen.getAllByText("Add")[1]);

    await userEvent.click(screen.getByRole("button", { name: "embedded_single" }));

    await userEvent.click(screen.getAllByText("Add")[2]);

    const another_embedded_group = screen.getByLabelText(
      "DictListFieldInput-embedded.0.embedded_single.another_embedded"
    );

    await userEvent.click(screen.getByRole("button", { name: "another_embedded" }));

    await userEvent.click(within(another_embedded_group).getByRole("button", { name: "0" }));

    const deep_nested_group = screen.getByLabelText(
      "DictListFieldInput-embedded.0.embedded_single.another_embedded.0.another_deeper_embedded"
    );

    await userEvent.click(within(deep_nested_group).getByText("Add"));

    await userEvent.click(screen.getByRole("button", { name: "another_deeper_embedded" }));

    await userEvent.click(within(deep_nested_group).getByRole("button", { name: "0" }));

    // expect all fields in deep_nested_group to be enabled
    const deep_nested_group_fields = within(deep_nested_group).getAllByRole("textbox");

    deep_nested_group_fields.forEach((field) => {
      expect(field).toBeEnabled();
    });
  });
});
