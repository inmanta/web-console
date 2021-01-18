import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import { rows } from "@app/fixtures/row";
import { TablePresenter } from "./TablePresenter";
import { DummyDatePresenter } from "./DummyDatePresenter";
import { AttributePresenter } from "./AttributePresenter";

test("loads and displays greeting", async () => {
  // Arrange
  const presenter = new TablePresenter(
    new DummyDatePresenter(),
    new AttributePresenter()
  );
  render(<InventoryTable rows={rows} tablePresenter={presenter} />);
  const testid = `details_${rows[0].id}`;

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);
  await waitFor(() => screen.getByTestId(testid));

  // Assert
  expect(screen.getByTestId(testid)).toBeVisible();
});
