import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { defaultServer, serverFailedActions } from "./mockServer";
import { setupServiceInstanceDetails } from "./mockSetup";

const mockedUsedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

describe("Page Actions - Success", () => {
  const server = defaultServer;

  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => {
    server.resetHandlers();
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

    // expect 16 menu items (1 for the  destroy, and 15 state options)
    expect(screen.getAllByRole("menuitem")).toHaveLength(16);

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
        "/console/lsm/catalog/mobileCore/inventory?env=aaa"
      )
    );
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
});

describe("Page Actions - Failed", () => {
  const server = serverFailedActions;

  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => {
    server.resetHandlers();
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

    // expect 16 menu items (1 for the  destroy, and 15 state options)
    expect(screen.getAllByRole("menuitem")).toHaveLength(16);

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
    expect(screen.getByTestId("error-toast-expert-state-message")).toBeVisible();
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
    expect(screen.getByTestId("error-toast-expert-destroy-message")).toBeVisible();

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

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByTestId("error-toast-delete-instance-message")).toBeVisible();
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

    expect(screen.getByTestId("error-toast-state-transfer-message")).toBeVisible();
  });
});
