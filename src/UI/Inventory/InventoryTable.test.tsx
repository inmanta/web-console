import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import { rows } from "@/Test/Data";
import { tablePresenter } from "@/Test/Inject";

test("InventoryTable can be expanded", async () => {
  // Arrange
  render(<InventoryTable rows={rows} tablePresenter={tablePresenter} />);
  const testid = `details_${rows[0].id.short}`;

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);
  await waitFor(() => screen.getByTestId(testid));

  // Assert
  expect(screen.getByTestId(testid)).toBeVisible();
});
