import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import {
  DummyStateHelper,
  DummySubscriptionHelper,
  InstantApiHelper,
  rows,
  tablePresenter,
} from "@/Test";
import { ServicesContext } from "@/UI/ServicesContext";
import { DataManagerImpl } from "../Data/DataManagerImpl";
import { getStoreInstance } from "../Store";
import { StoreProvider } from "easy-peasy";
import { StateHelperImpl } from "@/UI/Data/StateHelperImpl";

test("InventoryTable can be expanded", async () => {
  // Arrange
  const dataManager = new DataManagerImpl(
    new DummyStateHelper(),
    new DummySubscriptionHelper(
      new InstantApiHelper({
        kind: "Success",
        resources: [
          { resource_id: "resource_id_1", resource_state: "resource_state" },
        ],
      })
    )
  );
  render(
    <ServicesContext.Provider value={{ dataManager }}>
      <InventoryTable rows={rows} tablePresenter={tablePresenter} />
    </ServicesContext.Provider>
  );
  const testid = `details_${rows[0].id.short}`;

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);

  // Assert
  expect(await screen.findByTestId(testid)).toBeVisible();
});

test("ServiceInventory can show resources for instance", async () => {
  const store = getStoreInstance();
  const dataManager = new DataManagerImpl(
    new StateHelperImpl(store),
    new DummySubscriptionHelper(
      new InstantApiHelper({
        kind: "Success",
        resources: [
          { resource_id: "resource_id_1", resource_state: "resource_state" },
        ],
      })
    )
  );
  render(
    <ServicesContext.Provider value={{ dataManager }}>
      <StoreProvider store={store}>
        <InventoryTable rows={rows} tablePresenter={tablePresenter} />
      </StoreProvider>
    </ServicesContext.Provider>
  );

  fireEvent.click(screen.getAllByRole("button")[0]);
  fireEvent.click(screen.getByRole("button", { name: "Resources" }));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable" })
  ).toBeInTheDocument();

  expect(screen.getByText("resource_id_1")).toBeInTheDocument();
});

test("ServiceInventory shows attribute tab when clicking on attribute summary", async () => {
  // Arrange
  render(<InventoryTable rows={rows} tablePresenter={tablePresenter} />);

  // Act
  fireEvent.click((await screen.findAllByTestId(`attributes-summary`))[0]);

  // Assert
  expect(
    await screen.findByTestId("attributes-tree-table")
  ).toBeInTheDocument();
});
