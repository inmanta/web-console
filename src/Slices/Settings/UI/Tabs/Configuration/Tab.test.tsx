import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { EnvironmentSettings, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Tab } from "./Tab";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={["/?env=env"]}>
        <MockedDependencyProvider>
          <Tab environmentId="env" />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
describe("ConfigurationTab", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });

  beforeEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("GIVEN ConfigurationTab THEN shows all settings", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-agent_trigger_method_on_auto_deploy",
    });

    expect(
      within(row).getByRole("cell", {
        name: "agent_trigger_method_on_auto_deploy",
      })
    ).toBeVisible();

    expect(
      within(row).getByRole("combobox", {
        name: "EnumInput-agent_trigger_method_on_auto_deployFilterInput",
      })
    ).toBeVisible();

    expect(within(row).getByRole("button", { name: "SaveAction" })).toBeVisible();

    expect(within(row).getByRole("button", { name: "ResetAction" })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing a dict field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      }),
      http.post("/api/v2/environment_settings/autostart_agent_map", () => {
        return HttpResponse.json();
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-autostart_agent_map",
    });

    const newEntryRow = within(row).getByRole("row", { name: "Row-newEntry" });
    const newKeyInput = within(newEntryRow).getByRole("textbox", {
      name: "editEntryKey",
    });
    const newValueInput = within(newEntryRow).getByRole("textbox", {
      name: /editentryvalue/i,
    });

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.type(newKeyInput, "testKey");
    await userEvent.type(newValueInput, "testValue");

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing an enum field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-agent_trigger_method_on_auto_deploy",
    });

    await userEvent.click(
      within(row).getByRole("combobox", {
        name: "EnumInput-agent_trigger_method_on_auto_deployFilterInput",
      })
    );

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("option", {
        name: /push_full_deploy/i,
      })
    );

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing a boolean field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-auto_deploy",
    });

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.click(
      within(row).getByRole<HTMLInputElement>("switch", {
        name: "Toggle-auto_deploy",
      })
    );

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing a number field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-autostart_agent_deploy_interval",
    });

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.click(within(row).getByRole("button", { name: "plus" }));

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing a positiveFloat field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-recompile_backoff",
    });

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.click(within(row).getByRole("button", { name: "plus" }));

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing a string field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-auto_full_compile",
    });
    const textbox = within(row).getByRole("textbox", {
      name: "string input",
    });

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.type(textbox, "testString");

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WITH protected dict setting THEN disables editing", async () => {
    const overridenDefinition = {
      ...EnvironmentSettings.base.definition,
      autostart_agent_map: {
        ...EnvironmentSettings.base.definition.autostart_agent_map,
        protected: true,
        protected_by: "project.yml",
      },
    };

    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: EnvironmentSettings.base.settings,
            definition: overridenDefinition,
          },
        });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-autostart_agent_map",
    });

    // Wait for the protected message to appear, indicating the component is properly loaded
    await screen.findByText("This setting is protected by project.yml, and cannot be changed.");

    const newEntryRow = within(row).getByRole("row", { name: "Row-newEntry" });
    const newKeyInput = within(newEntryRow).getByRole("textbox", {
      name: "editEntryKey",
    });
    const newValueInput = within(newEntryRow).getByRole("textbox", {
      name: /editentryvalue/i,
    });

    expect(newKeyInput).toBeDisabled();
    expect(newValueInput).toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WITH protected enum field THEN disables editing", async () => {
    const overridenDefinition = {
      ...EnvironmentSettings.base.definition,
      agent_trigger_method_on_auto_deploy: {
        ...EnvironmentSettings.base.definition.agent_trigger_method_on_auto_deploy,
        protected: true,
        protected_by: "project.yml",
      },
    };
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: EnvironmentSettings.base.settings,
            definition: overridenDefinition,
          },
        });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-agent_trigger_method_on_auto_deploy",
    });

    await userEvent.click(
      within(row).getByRole("combobox", {
        name: "EnumInput-agent_trigger_method_on_auto_deployFilterInput",
      })
    );

    // Check that the toggle button (which contains the combobox) is disabled by CSS class
    const toggle = within(row).getByTestId("EnumInput-agent_trigger_method_on_auto_deploy-toggle");
    expect(toggle).toHaveClass("pf-m-disabled");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WITH protected boolean field THEN disables editing", async () => {
    const overridenDefinition = {
      ...EnvironmentSettings.base.definition,
      auto_deploy: {
        ...EnvironmentSettings.base.definition.auto_deploy,
        protected: true,
        protected_by: "config.yml",
      },
    };

    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: EnvironmentSettings.base.settings,
            definition: overridenDefinition,
          },
        });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-auto_deploy",
    });

    // Wait for the protected message to appear
    await screen.findByText("This setting is protected by config.yml, and cannot be changed.");

    const toggle = within(row).getByRole("switch", {
      name: "Toggle-auto_deploy",
    });

    expect(toggle).toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WITH protected integer field THEN disables editing", async () => {
    const overridenDefinition = {
      ...EnvironmentSettings.base.definition,
      autostart_agent_interval: {
        ...EnvironmentSettings.base.definition.autostart_agent_interval,
        protected: true,
        protected_by: "environment.yml",
      },
    };

    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: EnvironmentSettings.base.settings,
            definition: overridenDefinition,
          },
        });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-autostart_agent_interval",
    });

    // Wait for the protected message to appear
    await screen.findByText("This setting is protected by environment.yml, and cannot be changed.");

    const numberInput = within(row).getByRole("spinbutton", {
      name: "number input",
    });
    const minusButton = within(row).getByRole("button", { name: "minus" });
    const plusButton = within(row).getByRole("button", { name: "plus" });

    expect(numberInput).toBeDisabled();
    expect(minusButton).toBeDisabled();
    expect(plusButton).toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WITH protected positive float field THEN disables editing", async () => {
    const overridenDefinition = {
      ...EnvironmentSettings.base.definition,
      recompile_backoff: {
        ...EnvironmentSettings.base.definition.recompile_backoff,
        protected: true,
        protected_by: "project.yml",
      },
    };

    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: EnvironmentSettings.base.settings,
            definition: overridenDefinition,
          },
        });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-recompile_backoff",
    });

    // Wait for the protected message to appear
    await screen.findByText("This setting is protected by project.yml, and cannot be changed.");

    const numberInput = within(row).getByRole("spinbutton", {
      name: "number input",
    });
    const minusButton = within(row).getByRole("button", { name: "minus" });
    const plusButton = within(row).getByRole("button", { name: "plus" });

    expect(numberInput).toBeDisabled();
    expect(minusButton).toBeDisabled();
    expect(plusButton).toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WITH protected string field THEN disables editing", async () => {
    const overridenDefinition = {
      ...EnvironmentSettings.base.definition,
      auto_full_compile: {
        ...EnvironmentSettings.base.definition.auto_full_compile,
        protected: true,
        protected_by: "server.conf",
      },
    };

    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({
          data: {
            settings: EnvironmentSettings.base.settings,
            definition: overridenDefinition,
          },
        });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-auto_full_compile",
    });

    // Wait for the protected message to appear
    await screen.findByText("This setting is protected by server.conf, and cannot be changed.");

    const textInput = within(row).getByRole("textbox", {
      name: "string input",
    });

    expect(textInput).toBeDisabled();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing a boolean field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-auto_deploy",
    });

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.click(
      within(row).getByRole<HTMLInputElement>("switch", {
        name: "Toggle-auto_deploy",
      })
    );

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing an integer field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-autostart_agent_interval",
    });

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.click(within(row).getByRole("button", { name: "plus" }));

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing a positive float field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-recompile_backoff",
    });

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.click(within(row).getByRole("button", { name: "plus" }));

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab WHEN editing a string field THEN shows warning icon", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-auto_full_compile",
    });
    const textbox = within(row).getByRole("textbox", {
      name: "string input",
    });

    expect(within(row).queryByRole("generic", { name: "Warning" })).not.toBeInTheDocument();

    await userEvent.type(textbox, "testString");

    expect(within(row).getByTestId("Warning")).toBeInTheDocument();

    await act(async () => {
      const results = await axe(document.body);
      expect(results).toHaveNoViolations();
    });
  });

  test("ConfigurationTab can display unknown setting types as strings", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-an_unknown_setting_type",
    });

    const field = within(row).getByRole("textbox", { name: "string input" });

    expect(field).toBeInTheDocument();
    expect(field).toHaveValue("false");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab and boolean input WHEN changing boolean value and saving THEN update is performed", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      }),
      http.post("/api/v2/environment_settings/auto_deploy", () => {
        return HttpResponse.json();
      }),
      http.get("/api/v2/environment_settings/auto_deploy", () => {
        return HttpResponse.json({ data: EnvironmentSettings.auto_deploy });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-auto_deploy",
    });

    const toggle = within(row).getByRole<HTMLInputElement>("switch", {
      name: "Toggle-auto_deploy",
    });

    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);

    expect(toggle).toBeChecked();

    await userEvent.click(within(row).getByRole("button", { name: "SaveAction" }), {
      skipHover: true,
    });

    fireEvent(document, new Event("settings-update"));
    expect(await screen.findByText(words("settings.update"))).toBeVisible();

    expect(toggle).toBeChecked();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab and boolean input WHEN clicking reset THEN delete is performed", async () => {
    let counter = 0;
    server.use(
      http.get("/api/v2/environment_settings", () => {
        if (counter === 0) {
          return HttpResponse.json({ data: EnvironmentSettings.base });
        }
        return HttpResponse.json({ data: EnvironmentSettings.auto_deploy });
      }),
      http.delete("/api/v2/environment_settings/auto_deploy", () => {
        counter++;
        return HttpResponse.json();
      }),
      http.get("/api/v2/environment_settings/auto_deploy", () => {
        return HttpResponse.json({ data: EnvironmentSettings.auto_deploy });
      })
    );

    const { component } = setup();

    render(component);

    const row = await screen.findByRole("row", {
      name: "Row-auto_deploy",
    });

    const toggle = within(row).getByRole<HTMLInputElement>("switch", {
      name: "Toggle-auto_deploy",
    });

    expect(toggle).not.toBeChecked();

    await userEvent.click(within(row).getByRole("button", { name: "ResetAction" }), {
      skipHover: true,
    });

    const updatedRow = await screen.findByRole("row", {
      name: "Row-auto_deploy",
    });
    expect(
      within(updatedRow).getByRole<HTMLInputElement>("switch", {
        name: "Toggle-auto_deploy",
      })
    ).toBeChecked();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ConfigurationTab and dict input WHEN adding an entry and saving THEN entry is locked in", async () => {
    server.use(
      http.get("/api/v2/environment_settings", () => {
        return HttpResponse.json({ data: EnvironmentSettings.base });
      }),
      http.post("/api/v2/environment_settings/autostart_agent_map", () => {
        return HttpResponse.json();
      }),
      http.get("/api/v2/environment_settings/autostart_agent_map", () => {
        return HttpResponse.json({
          data: EnvironmentSettings.autostart_agent_map({ testKey: "testValue" }),
        });
      })
    );

    const { component } = setup();

    render(component);

    const row = screen.getByRole("row", {
      name: "Row-autostart_agent_map",
    });

    const newEntryRow = within(row).getByRole("row", { name: "Row-newEntry" });
    const newKeyInput = within(newEntryRow).getByRole("textbox", {
      name: "editEntryKey",
    });

    await userEvent.type(newKeyInput, "testKey");

    const newValueInput = within(newEntryRow).getByRole("textbox", {
      name: "editEntryValue",
    });

    await userEvent.type(newValueInput, "testValue");

    await userEvent.click(within(row).getByRole("button", { name: "SaveAction" }), {
      skipHover: true,
    });

    expect(within(row).getByRole("row", { name: "Row-testKey" })).toBeInTheDocument();
    expect(newKeyInput).toHaveValue("");
    expect(newValueInput).toHaveValue("");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
