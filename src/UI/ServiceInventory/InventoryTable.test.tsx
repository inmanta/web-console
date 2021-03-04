import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import {
  DummyStateHelper,
  StaticSubscriptionController,
  InstantFetcher,
  rows,
  tablePresenter,
} from "@/Test";
import { ServicesContext } from "@/UI/ServicesContext";
import { getStoreInstance } from "@/UI/Store";
import { StoreProvider } from "easy-peasy";
import {
  DataProviderImpl,
  DataManagerImpl,
  ResourcesHookHelper,
  ResourcesStateHelper,
} from "@/UI/Data";

test("InventoryTable can be expanded", async () => {
  // Arrange
  const dataProvider = new DataProviderImpl([
    new ResourcesHookHelper(
      new DataManagerImpl<"Resources">(
        new InstantFetcher<"Resources">({
          kind: "Success",
          data: [
            { resource_id: "resource_id_1", resource_state: "resource_state" },
          ],
        }),
        new DummyStateHelper<"Resources">()
      ),
      new StaticSubscriptionController()
    ),
  ]);
  render(
    <ServicesContext.Provider value={{ dataProvider }}>
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
  const dataProvider = new DataProviderImpl([
    new ResourcesHookHelper(
      new DataManagerImpl<"Resources">(
        new InstantFetcher<"Resources">({
          kind: "Success",
          data: [
            { resource_id: "resource_id_1", resource_state: "resource_state" },
          ],
        }),
        new ResourcesStateHelper(store)
      ),
      new StaticSubscriptionController()
    ),
  ]);
  render(
    <ServicesContext.Provider value={{ dataProvider }}>
      <StoreProvider store={store}>
        <InventoryTable rows={rows} tablePresenter={tablePresenter} />
      </StoreProvider>
    </ServicesContext.Provider>
  );

  fireEvent.click(screen.getAllByRole("button")[0]);
  fireEvent.click(screen.getByRole("button", { name: "Resources" }));

  expect(
    await screen.findByRole("grid", { name: "ResourceTable-Success" })
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
