import React from "react";
import { render, screen } from "@testing-library/react";
import { TableProvider } from "./TableProvider";

test("InventoryTableContainer is visible", async () => {
  // Arrange
  render(<TableProvider instances={[]} />);
  // Act
  // Assert
  const container = screen.getByTestId("InventoryTableContainer");
  expect(container).toBeVisible();
});
