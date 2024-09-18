import { act } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { defaultServer } from "./mockServer";
import { setupServiceInstanceDetails } from "./mockSetup";

describe("Page Actions", () => {
  const server = defaultServer;

  // Establish API mocking before all tests.
  beforeAll(() => server.listen());

  // Reset any request handlers that we may add during the tests,
  // so they don't affect other tests.
  afterEach(() => {
    server.resetHandlers();
    server.events.removeAllListeners();
  });

  // Clean up after the tests are finished.
  afterAll(() => server.close());

  it("Expert actions", async () => {
    const component = setupServiceInstanceDetails(true);

    render(component);

    server.events.on("request:start", ({ request }) => {
      if (request.method === "DELETE") {
        expect(request.url).toBe(
          "/lsm/v2/service_inventory/mobileCore/1d96a1ab/expert?current_version=4",
        );
      }
      if (request.method === "POST") {
        expect(request.url).toBe(
          "/lsm/v1/service_inventory/mobileCore/1d96a1ab/expert/state?current_version=4",
        );
      }
    });

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" }),
    ).toBeInTheDocument();

    // expect to find the expert actions dropdown
    const expertDropdown = screen.getByRole("button", {
      name: /expert actions/i,
    });

    await act(async () => {
      await userEvent.click(expertDropdown);
    });

    // expect 16 menu items (1 for the  destroy, and 15 state options)
    expect(screen.getAllByRole("menuitem")).toHaveLength(16);

    const stateUp = screen.getByRole("menuitem", { name: "up" });

    await act(async () => {
      await userEvent.click(stateUp);
    });

    await act(async () => {
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
    });

    const destroyAction = screen.getByRole("menuitem", {
      name: /destroy/i,
    });

    await act(async () => {
      await userEvent.click(destroyAction);
    });

    await act(async () => {
      const confirmButton = screen.getByRole("button", {
        name: /yes/i,
      });

      await userEvent.click(confirmButton);
    });

    // expect to be redirected on success destroy (TODO) #5958
  });

  it("Normal Instance Actions Enabled", async () => {
    const component = setupServiceInstanceDetails();

    render(component);

    server.events.on("request:start", ({ request }) => {
      if (request.method === "DELETE") {
        expect(request.url).toBe(
          "/lsm/v2/service_inventory/mobileCore/1d96a1ab?current_version=4",
        );
      }
      if (request.method === "POST") {
        expect(request.url).toBe(
          "/lsm/v1/service_inventory/mobileCore/1d96a1ab/state?current_version=4",
        );
      }
    });

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Loading" }),
    ).toBeInTheDocument();

    expect(
      await screen.findByRole("region", { name: "Instance-Details-Success" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /expert actions/i }),
    ).not.toBeInTheDocument();

    // expect to find action dropdown
    const actionDropdown = screen.getByRole("button", {
      name: /actions/i,
    });

    await act(async () => {
      await userEvent.click(actionDropdown);
    });

    const actions = screen.getAllByRole("menuitem");

    expect(actions).toHaveLength(5);

    actions.forEach((action) => {
      expect(action).toBeEnabled();
    });

    // delete instance
    await act(async () => {
      await userEvent.click(actions[3]);
    });

    expect(
      screen.getByText(
        /are you sure you want to delete instance core1 of service entity mobilecore\?/i,
      ),
    ).toBeVisible();

    await act(async () => {
      const confirmButton = screen.getByRole("button", {
        name: /yes/i,
      });

      await userEvent.click(confirmButton);
    });

    await act(async () => {
      await userEvent.click(actionDropdown);
    });

    const availableState = screen.getByRole("menuitem", {
      name: /update_start/i,
    });

    // update state instance
    await act(async () => {
      await userEvent.click(availableState);
    });

    await act(async () => {
      const confirmButton = screen.getByRole("button", {
        name: /yes/i,
      });

      expect(
        screen.getByText(
          /are you sure you want to set state of instance core1 to update_start\?/i,
        ),
      ).toBeVisible();

      await userEvent.click(confirmButton);
    });
  });
});
