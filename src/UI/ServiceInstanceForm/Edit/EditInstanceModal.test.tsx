import { render, screen } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { EditInstanceModal } from "./EditInstanceModal";
import { InventoryContext } from "@/UI/Pages/ServiceInventory";

describe("EditInstanceModal", () => {
  const instance = {
    id: "id1",
    state: "up",
    version: 10,
    service_entity: "test-service",
    environment: "env",
    candidate_attributes: null,
    active_attributes: { attr1: "some value" },
    rollback_attributes: null,
    instanceSetStateTargets: [],
  };
  const attributes = [
    {
      name: "attr1",
      type: "string",
      description: "name",
      modifier: "rw+",
      default_value_set: false,
    },
  ];

  it("Shows edit modal", async () => {
    render(<EditInstanceModal instance={instance} />);
    expect(await screen.findByText("Edit")).toBeVisible();
  });
  it("Shows form when clicking on modal button", async () => {
    render(
      <InventoryContext.Provider
        value={{
          attributes: attributes,
          environmentId: "envId1",
          inventoryUrl: "/inv",
          setErrorMessage: () => {
            return;
          },
          refresh: () => {
            return;
          },
        }}
      >
        <EditInstanceModal instance={instance} />
      </InventoryContext.Provider>
    );
    const modalButton = await screen.findByText("Edit");
    userEvent.click(modalButton);
    expect(await screen.findByText("Confirm")).toBeVisible();
    expect(await screen.findByText("Cancel")).toBeVisible();
  });
  it("Closes modal when cancelled", async () => {
    render(
      <InventoryContext.Provider
        value={{
          attributes: attributes,
          environmentId: "envId1",
          inventoryUrl: "/inv",
          setErrorMessage: () => {
            return;
          },
          refresh: () => {
            return;
          },
        }}
      >
        <EditInstanceModal instance={instance} />
      </InventoryContext.Provider>
    );
    const modalButton = await screen.findByText("Edit");
    userEvent.click(modalButton);
    const noButton = await screen.findByText("Cancel");
    userEvent.click(noButton);
    expect(screen.queryByText("Confirm")).not.toBeInTheDocument();
  });
});
