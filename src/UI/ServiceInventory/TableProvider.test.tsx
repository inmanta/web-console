import React from "react";
import { render, screen } from "@testing-library/react";
import { TableProvider } from "./TableProvider";
import { ServiceModel } from "@/Core";

test("InventoryTableContainer is visible", async () => {
  // Arrange
  render(<TableProvider instances={[]} serviceEntity={{} as ServiceModel} />);
  // Act
  // Assert
  const container = screen.getByTestId("InventoryTableContainer");
  expect(container).toBeVisible();
});
