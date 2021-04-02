import React from "react";
import { render, screen } from "@testing-library/react";
import { TableProvider } from "./TableProvider";
import { ServiceModel } from "@/Core";

test("InventoryTableContainer is visible", async () => {
  // Arrange
  const dummySetter = () => {
    return;
  };
  render(
    <TableProvider
      instances={[]}
      serviceEntity={{} as ServiceModel}
      setSortColumn={dummySetter}
      setOrder={dummySetter}
    />
  );
  // Act
  // Assert
  const container = screen.getByTestId("InventoryTableContainer");
  expect(container).toBeVisible();
});
