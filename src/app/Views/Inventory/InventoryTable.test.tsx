import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";

test("loads and displays greeting", async () => {
  // Arrange
  const rows = [{ id: "1234" }, { id: "5678" }];
  render(<InventoryTable rows={rows} />);

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);
  await waitFor(() => screen.getByTestId("details_1234"));

  // Assert
  expect(screen.getByTestId("details_1234")).toBeVisible();
});
