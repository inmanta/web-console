import React from "react";
import { render, screen } from "@testing-library/react";
import { TableProvider } from "./TableProvider";
import { IServiceModel } from "@app/Models/LsmModels";

test("InventoryTableContainer is visible", async () => {
  // Arrange
  render(<TableProvider instances={[]} serviceEntity={{} as IServiceModel} />);
  // Act
  // Assert
  const container = screen.getByTestId("InventoryTableContainer");
  expect(container).toBeVisible();
});
