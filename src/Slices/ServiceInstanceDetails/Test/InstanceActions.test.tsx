import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { words } from "@/UI";
import { instanceData, serviceModel } from "./mockData";
import { defaultServer, serverFailedActions } from "./mockServer";
import { setupServiceInstanceDetails } from "./mockSetup";

const mockedUsedNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();

  return {
    ...actual,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe("Page Actions - Success", () => {
  const server = defaultServer;

  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  it("Deploy actions - deploys the instance's resources through deploy_filtered", async () => {
    let body: unknown;

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setupServiceInstanceDetails());

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    // The Deploy split button sits beside the Actions menu. It stays disabled until the service
    // catalog settles, so the confirm dialog always offers the full scope set.
    const deployButton = screen.getByRole("button", {
      name: words("resources.compoundStateSummary.deploy"),
    });
    await waitFor(() => expect(deployButton).toBeEnabled());
    await userEvent.click(deployButton);

    const dialog = await screen.findByRole("dialog");

    expect(
      within(dialog).getByText(words("resources.resourceActions.confirm.instance.title"))
    ).toBeVisible();

    await userEvent.click(
      within(dialog).getByRole("button", { name: words("resources.compoundStateSummary.deploy") })
    );

    await waitFor(() =>
      expect(body).toEqual({
        filter: { isOrphan: false, serviceInstance: [instanceData.id] },
        agent_trigger_method: "push_incremental_deploy",
      })
    );
  });

  it("Deploy actions - offers the owned-services scope when the service type owns entities", async () => {
    let body: unknown;

    server.use(
      http.get("/lsm/v1/service_catalog/mobileCore", () =>
        HttpResponse.json({ data: { ...serviceModel, owned_entities: ["l2Connect"] } })
      ),
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setupServiceInstanceDetails());

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    const deployButton = screen.getByRole("button", {
      name: words("resources.compoundStateSummary.deploy"),
    });
    await waitFor(() => expect(deployButton).toBeEnabled());
    await userEvent.click(deployButton);

    const dialog = await screen.findByRole("dialog");

    // The catalog declares an owned entity, so the dialog offers the wider "owned services" scope.
    await userEvent.click(
      within(dialog).getByRole("radio", {
        name: new RegExp(words("resources.resourceActions.confirm.owned.title"), "i"),
      })
    );

    await userEvent.click(
      within(dialog).getByRole("button", { name: words("resources.compoundStateSummary.deploy") })
    );

    await waitFor(() =>
      expect(body).toEqual({
        filter: { isOrphan: false, serviceInstance: [instanceData.id], includeOwned: true },
        agent_trigger_method: "push_incremental_deploy",
      })
    );
  });

  it.each`
    scenario                    | deployment_progress
    ${"an explicit zero total"} | ${{ deployed: 0, waiting: 0, failed: 0, total: 0 }}
    ${"no deployment progress"} | ${null}
  `(
    "Deploy actions - disables the split button when the instance has no resources ($scenario)",
    async ({ deployment_progress }) => {
      server.use(
        http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab", () =>
          HttpResponse.json({ data: { ...instanceData, deployment_progress } })
        )
      );

      render(setupServiceInstanceDetails());

      expect(
        await screen.findByRole("region", { name: "Instance-Details-Success" })
      ).toBeInTheDocument();

      // The service type owns nothing and the instance reports no resources, so nothing to act on.
      await waitFor(() =>
        expect(
          screen.getByRole("button", { name: words("resources.compoundStateSummary.deploy") })
        ).toBeDisabled()
      );
    }
  );

  it("Deploy actions - disables the split button when the instance is deleted", async () => {
    server.use(
      http.get("/lsm/v1/service_inventory/mobileCore/1d96a1ab", () =>
        HttpResponse.json({ data: { ...instanceData, deleted: true } })
      )
    );

    render(setupServiceInstanceDetails());

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    // The instance still has resources, but a deleted instance can't be deployed or repaired.
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: words("resources.compoundStateSummary.deploy") })
      ).toBeDisabled()
    );
  });

  it("Deploy actions - keeps the split button disabled while the service catalog is loading", async () => {
    // The catalog never answers, so serviceModelQuery stays pending for the whole test.
    server.use(http.get("/lsm/v1/service_catalog/mobileCore", () => new Promise(() => {})));

    render(setupServiceInstanceDetails());

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    // The scope set can't be built until the catalog settles, so the button stays disabled.
    // (The happy path - it enables once the catalog is present - is covered by the deploy test above.)
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: words("resources.compoundStateSummary.deploy") })
      ).toBeDisabled()
    );
  });

  it("Expert actions - Force State", async () => {
    const component = setupServiceInstanceDetails(true);

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    // expect to find the expert actions dropdown
    const expertDropdown = screen.getByRole("button", {
      name: "Expert-Actions-Toggle",
    });

    await userEvent.click(expertDropdown);

    // expect 21 menu items (1 for the destroy action, and 20 others for state options)
    expect(screen.getAllByRole("menuitem")).toHaveLength(21);

    const stateUp = screen.getByRole("menuitem", { name: "up" });

    await userEvent.click(stateUp);

    const confirmButton = screen.getByRole("button", {
      name: /yes/i,
    });

    const operationsSelect = screen.getByRole("combobox");

    await userEvent.click(operationsSelect);

    const options = screen.getAllByRole("option");

    expect(options).toHaveLength(6);

    await userEvent.selectOptions(operationsSelect, options[1]);

    expect(operationsSelect).toHaveValue("clear candidate");

    await userEvent.click(confirmButton);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByTestId("error-toast-expert-state-message")).toBeNull();
  });

  it("Expert actions - Destroy", async () => {
    const component = setupServiceInstanceDetails(true);

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    // expect to find the expert actions dropdown
    const expertDropdown = screen.getByRole("button", {
      name: "Expert-Actions-Toggle",
    });

    await userEvent.click(expertDropdown);

    const destroyAction = screen.getByRole("menuitem", {
      name: /destroy/i,
    });

    await userEvent.click(destroyAction);

    const confirmButton = screen.getByRole("button", {
      name: /yes/i,
    });

    await userEvent.click(confirmButton);

    expect(screen.queryByTestId("error-toast-expert-state-message")).toBeNull();
    await waitFor(() =>
      expect(mockedUsedNavigate).toHaveBeenCalledWith(
        "/console/lsm/catalog/mobileCore/inventory?env=c85c0a64-ed45-4cba-bdc5-703f65a225f7"
      )
    );
  });

  it("Expert actions - collapses the toggle when an action opens its modal", async () => {
    render(setupServiceInstanceDetails(true));

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    const expertDropdown = screen.getByRole("button", {
      name: "Expert-Actions-Toggle",
    });

    // opening the dropdown expands the toggle
    await userEvent.click(expertDropdown);
    expect(expertDropdown).toHaveAttribute("aria-expanded", "true");

    // selecting a state target opens the modal and must collapse the toggle,
    // so it does not stay highlighted behind the modal
    await userEvent.click(screen.getByRole("menuitem", { name: "up" }));
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(expertDropdown).toHaveAttribute("aria-expanded", "false");

    // the same must hold for the destroy action
    await userEvent.click(screen.getByRole("button", { name: /no/i }));
    await userEvent.click(expertDropdown);
    expect(expertDropdown).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(screen.getByRole("menuitem", { name: /destroy/i }));
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(expertDropdown).toHaveAttribute("aria-expanded", "false");
  });

  it("Normal Instance Actions Enabled - delete action", async () => {
    const component = setupServiceInstanceDetails();

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /expert actions/i })).not.toBeInTheDocument();

    // expect to find action dropdown
    const actionDropdown = screen.getByRole("button", {
      name: "Actions-Toggle",
    });

    await userEvent.click(actionDropdown);

    const actions = screen.getAllByRole("menuitem");

    expect(actions).toHaveLength(6);

    actions.forEach((action) => {
      expect(action).toBeEnabled();
    });

    // delete instance
    await userEvent.click(actions[3]);

    // the on_delete transfer carries a web_confirm annotation, which replaces the default prompt
    expect(
      screen.getByText(/delete this service and all its resources\? this cannot be undone\.?/i)
    ).toBeVisible();

    const confirmButton = screen.getByRole("button", {
      name: /yes/i,
    });

    await userEvent.click(confirmButton);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByTestId("error-toast-expert-state-message")).toBeNull();
  });

  it("Normal Instance Actions Enabled - update state action", async () => {
    const component = setupServiceInstanceDetails();

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /expert actions/i })).not.toBeInTheDocument();

    // expect to find action dropdown
    const actionDropdown = screen.getByRole("button", {
      name: "Actions-Toggle",
    });

    await userEvent.click(actionDropdown);

    const updateStartState = screen.getByRole("menuitem", {
      name: /update_start/i,
    });

    // update state instance
    await userEvent.click(updateStartState);

    const confirmButton = screen.getByRole("button", {
      name: /yes/i,
    });

    // the on_update transfer carries a web_confirm annotation, which replaces the default prompt
    expect(
      screen.getByText(/apply the updated attributes to the running service\?/i)
    ).toBeVisible();

    await userEvent.click(confirmButton);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByTestId("error-toast-expert-state-message")).toBeNull();
  });

  it("Normal Instance Actions Enabled - set-state transfer with web_button_* annotations (issue #7093)", async () => {
    const component = setupServiceInstanceDetails();

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Actions-Toggle" }));

    // web_button_label overrides the raw target-state name ("setting_start"), and
    // the transfer's web_icon is rendered on the item
    const pushSettings = screen.getByRole("menuitem", { name: "Push settings" });

    expect(pushSettings).toBeVisible();
    expect(pushSettings).toContainElement(screen.getByTestId("FaSlidersH"));

    // web_button_variant: "warning" does not apply the danger styling reserved for "danger"
    expect(pushSettings.closest("li")).not.toHaveClass("pf-m-danger");

    await userEvent.click(pushSettings);

    // the transfer's own web_confirm annotation still replaces the default prompt
    expect(screen.getByText(/push the current settings to the running service\?/i)).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: /no/i }));
  });

  it("Normal Instance Actions Enabled - web_advanced_state demotes a transfer into the Advanced disclosure (issue #7095)", async () => {
    server.use(
      http.get("/lsm/v1/service_catalog/mobileCore", () => {
        return HttpResponse.json({
          data: {
            ...serviceModel,
            lifecycle: {
              ...serviceModel.lifecycle,
              transfers: [
                ...serviceModel.lifecycle.transfers,
                {
                  source: "up",
                  target: "maintenance",
                  error: null,
                  on_update: false,
                  on_delete: false,
                  api_set_state: true,
                  resource_based: false,
                  auto: false,
                  validate: false,
                  config_name: null,
                  description: "up to maintenance",
                  target_operation: null,
                  error_operation: null,
                  annotations: {
                    web_button_label: "Enter maintenance mode",
                    web_advanced_state: true,
                  },
                },
              ],
            },
          },
        });
      })
    );

    render(setupServiceInstanceDetails());

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    const actionDropdown = screen.getByRole("button", { name: "Actions-Toggle" });

    await userEvent.click(actionDropdown);

    // decluttered: not shown directly in the primary Set-state group
    expect(
      screen.queryByRole("menuitem", { name: "Enter maintenance mode" })
    ).not.toBeInTheDocument();

    const advancedToggle = screen.getByRole("menuitem", { name: "Advanced" });

    await userEvent.click(advancedToggle);

    // expanding the disclosure only reveals it in place, it doesn't collapse the outer dropdown
    expect(actionDropdown).toHaveAttribute("aria-expanded", "true");

    const maintenanceItem = screen.getByRole("menuitem", { name: "Enter maintenance mode" });

    await userEvent.click(maintenanceItem);

    // reachable and still triggers the same confirm modal as any other state transfer
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(actionDropdown).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(screen.getByRole("button", { name: /yes/i }));

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Normal Instance Actions - sends the user provided message on state transfer", async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post("/lsm/v1/service_inventory/mobileCore/1d96a1ab/state", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;

        return HttpResponse.json({ status: 200 });
      })
    );

    render(setupServiceInstanceDetails());

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Actions-Toggle" }));
    await userEvent.click(screen.getByRole("menuitem", { name: /update_start/i }));

    // the message field is prefilled with the default console message
    const messageField = screen.getByLabelText("state-transfer-message-input");

    expect(messageField).toHaveValue(words("instanceDetails.API.message.update")(null));

    // the user replaces it with a custom message
    await userEvent.clear(messageField);
    await userEvent.type(messageField, "Custom transfer reason");

    await userEvent.click(screen.getByRole("button", { name: /yes/i }));

    await waitFor(() => expect(capturedBody).not.toBeNull());

    expect(capturedBody).toEqual({
      message: "Custom transfer reason",
      current_version: instanceData.version,
      target_state: "update_start",
    });
  });

  it("Expert actions - sends the user provided message on force state", async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post(
        "/lsm/v1/service_inventory/mobileCore/1d96a1ab/expert/state",
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;

          return HttpResponse.json({ status: 200 });
        }
      )
    );

    render(setupServiceInstanceDetails(true));

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Expert-Actions-Toggle" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "up" }));

    // the message field is prefilled with the default console message
    const messageField = screen.getByLabelText("expert-state-transfer-message-input");

    expect(messageField).toHaveValue(words("instanceDetails.API.message.update")(null));

    // the user provides a custom message and selects an operation
    await userEvent.clear(messageField);
    await userEvent.type(messageField, "Forcing back up");

    await userEvent.selectOptions(screen.getByRole("combobox"), "clear candidate");

    await userEvent.click(screen.getByRole("button", { name: /yes/i }));

    await waitFor(() => expect(capturedBody).not.toBeNull());

    expect(capturedBody).toEqual({
      message: "Forcing back up",
      current_version: instanceData.version,
      target_state: "up",
      operation: "clear candidate",
    });
  });
});

describe("Page Actions - Failed", () => {
  const server = serverFailedActions;

  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  it("Expert actions - Force State", async () => {
    const component = setupServiceInstanceDetails(true);

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    // expect to find the expert actions dropdown
    const expertDropdown = screen.getByRole("button", {
      name: "Expert-Actions-Toggle",
    });

    await userEvent.click(expertDropdown);

    // expect 21 menu items (1 for the destroy action, and 20 others for state options)
    expect(screen.getAllByRole("menuitem")).toHaveLength(21);

    const stateUp = screen.getByRole("menuitem", { name: "up" });

    await userEvent.click(stateUp);

    const confirmButton = screen.getByRole("button", {
      name: /yes/i,
    });

    const operationsSelect = screen.getByRole("combobox");

    await userEvent.click(operationsSelect);

    const options = screen.getAllByRole("option");

    expect(options).toHaveLength(6);

    await userEvent.selectOptions(operationsSelect, options[1]);

    expect(operationsSelect).toHaveValue("clear candidate");

    await userEvent.click(confirmButton);

    expect(screen.getByRole("dialog")).toBeVisible();
    const errorToast = screen.getByTestId("error-toast-actions-error-message");

    expect(errorToast).toBeVisible();
  });

  it("Expert actions - Destroy", async () => {
    const component = setupServiceInstanceDetails(true);

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    // expect to find the expert actions dropdown
    const expertDropdown = screen.getByRole("button", {
      name: "Expert-Actions-Toggle",
    });

    await userEvent.click(expertDropdown);

    const destroyAction = screen.getByRole("menuitem", {
      name: /destroy/i,
    });

    await userEvent.click(destroyAction);

    const confirmButton = screen.getByRole("button", {
      name: /yes/i,
    });

    await userEvent.click(confirmButton);

    expect(screen.getByRole("dialog")).toBeVisible();
    const errorToast = screen.getByTestId("error-toast-actions-error-message");

    expect(errorToast).toBeVisible();

    await waitFor(() => expect(mockedUsedNavigate).not.toHaveBeenCalled());
  });

  it("Normal Instance Actions Enabled - delete action", async () => {
    const component = setupServiceInstanceDetails();

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /expert actions/i })).not.toBeInTheDocument();

    // expect to find action dropdown
    const actionDropdown = screen.getByRole("button", {
      name: "Actions-Toggle",
    });

    await userEvent.click(actionDropdown);

    const actions = screen.getAllByRole("menuitem");

    expect(actions).toHaveLength(6);

    actions.forEach((action) => {
      expect(action).toBeEnabled();
    });

    // delete instance
    await userEvent.click(actions[3]);

    // the on_delete transfer carries a web_confirm annotation, which replaces the default prompt
    expect(
      screen.getByText(/delete this service and all its resources\? this cannot be undone\.?/i)
    ).toBeVisible();

    const confirmButton = screen.getByRole("button", {
      name: /yes/i,
    });

    await userEvent.click(confirmButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const errorToast = screen.getByTestId("error-toast-actions-error-message");

    expect(errorToast).toBeVisible();
  });

  it("Normal Instance Actions Enabled - update state action", async () => {
    const component = setupServiceInstanceDetails();

    render(component);

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" })
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" })
    ).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: /expert actions/i })).not.toBeInTheDocument();

    // expect to find action dropdown
    const actionDropdown = screen.getByRole("button", {
      name: "Actions-Toggle",
    });

    await userEvent.click(actionDropdown);

    const updateStartState = screen.getByRole("menuitem", {
      name: /update_start/i,
    });

    // update state instance
    await userEvent.click(updateStartState);

    const confirmButton = screen.getByRole("button", {
      name: /yes/i,
    });

    // the on_update transfer carries a web_confirm annotation, which replaces the default prompt
    expect(
      screen.getByText(/apply the updated attributes to the running service\?/i)
    ).toBeVisible();

    await userEvent.click(confirmButton);

    const errorToast = screen.getByTestId("error-toast-actions-error-message");

    expect(errorToast).toBeVisible();
  });
});
