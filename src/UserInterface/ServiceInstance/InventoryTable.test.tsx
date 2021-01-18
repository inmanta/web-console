import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import { rows } from "Fixtures/row";
import { TablePresenter } from "./TablePresenter";
import { DummyDatePresenter } from "./DummyDatePresenter";
import { AttributePresenter } from "./AttributePresenter";
import { DummyActionPresenter } from "./Actions/DummyActionPresenter";

test("loads and displays greeting", async () => {
  // Arrange
  const presenter = new TablePresenter(
    new DummyDatePresenter(),
    new AttributePresenter(),
    new DummyActionPresenter()
  );
  render(<InventoryTable rows={rows} tablePresenter={presenter} />);
  const testid = `details_${rows[0].id.short}`;

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);
  await waitFor(() => screen.getByTestId(testid));

  // Assert
  expect(screen.getByTestId(testid)).toBeVisible();
});
