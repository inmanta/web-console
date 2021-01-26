import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import { rows, tablePresenter } from "@/Test";

test("InventoryTable can be expanded", async () => {
  // Arrange
  render(<InventoryTable rows={rows} tablePresenter={tablePresenter} />);
  const testid = `details_${rows[0].id.short}`;

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);

  // Assert
  expect(await screen.findByTestId(testid)).toBeVisible();
});
