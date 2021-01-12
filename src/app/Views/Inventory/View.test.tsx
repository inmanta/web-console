import React from "react";
import { render, screen } from "@testing-library/react";
import { View } from "./View";

test("loads and displays greeting", async () => {
  // Arrange
  render(<View message="test" />);
  // Act
  // Assert
  expect(screen.getByTestId("InventoryViewContainer")).toBeVisible();
});
