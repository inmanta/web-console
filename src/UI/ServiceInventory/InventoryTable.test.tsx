import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import { rows, tablePresenter } from "@/Test";
import { ServicesContext } from "@/UI/ServicesContext";
import { DummyResourceFetcher } from "@/Test";

test("InventoryTable can be expanded", async () => {
  // Arrange
  render(<InventoryTable rows={rows} tablePresenter={tablePresenter} />);
  const testid = `details_${rows[0].id.short}`;

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);

  // Assert
  expect(await screen.findByTestId(testid)).toBeVisible();
});

test("ServiceInventory can show resources for instance", async () => {
  // Arrange
  const resources = [
    { resource_id: "resource_id_1", resource_state: "resource_state" },
  ];
  const resourceFetcher = new DummyResourceFetcher({
    kind: "Success",
    resources,
  });
  render(
    <ServicesContext.Provider value={{ resourceFetcher }}>
      <InventoryTable rows={rows} tablePresenter={tablePresenter} />
    </ServicesContext.Provider>
  );

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);
  fireEvent.click(screen.getByRole("button", { name: "Resources" }));

  // Assert
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
