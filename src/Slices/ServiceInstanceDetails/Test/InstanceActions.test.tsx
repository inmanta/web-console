import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { words } from "@/UI";
import { instanceData } from "./mockData";
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

    // expect 20 menu items (1 for the destroy action, and 19 others for state options)
    expect(screen.getAllByRole("menuitem")).toHaveLength(20);

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

    expect(actions).toHaveLength(5);

    actions.forEach((action) => {
      expect(action).toBeEnabled();
    });

    // delete instance
    await userEvent.click(actions[3]);

    expect(
      screen.getByText(
        /are you sure you want to delete instance core1 of service entity mobilecore\?/i
      )
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

    expect(
      screen.getByText(/are you sure you want to set state of instance core1 to update_start\?/i)
    ).toBeVisible();

    await userEvent.click(confirmButton);

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByTestId("error-toast-expert-state-message")).toBeNull();
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

    // expect 20 menu items (1 for the destroy action, and 19 others for state options)
    expect(screen.getAllByRole("menuitem")).toHaveLength(20);

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

    expect(actions).toHaveLength(5);

    actions.forEach((action) => {
      expect(action).toBeEnabled();
    });

    // delete instance
    await userEvent.click(actions[3]);

    expect(
      screen.getByText(
        /are you sure you want to delete instance core1 of service entity mobilecore\?/i
      )
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

    expect(
      screen.getByText(/are you sure you want to set state of instance core1 to update_start\?/i)
    ).toBeVisible();

    await userEvent.click(confirmButton);

    const errorToast = screen.getByTestId("error-toast-actions-error-message");

    expect(errorToast).toBeVisible();
  });
});
