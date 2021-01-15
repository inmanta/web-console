import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import { rows } from "@app/fixtures/row";

test("loads and displays greeting", async () => {
  // Arrange
  render(<InventoryTable rows={rows} />);

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);
  await waitFor(() => screen.getByTestId("details_1234"));

  // Assert
  expect(screen.getByTestId("details_1234")).toBeVisible();
});
