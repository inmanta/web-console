import React from "react";
import { render, screen } from "@testing-library/react";
import { View } from "./View";

test("loads and displays greeting", async () => {
  // Arrange
  render(<View serviceName="test" />);
  // Act
  // Assert
  const container = screen.getByTestId("InventoryViewContainer");
  expect(container).toHaveTextContent("service name: test");
});
