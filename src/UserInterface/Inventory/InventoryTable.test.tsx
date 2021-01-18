import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import { rows } from "Fixtures/row";
import { tablePresenter } from "./Presenters/TablePresenter.injected";

test("loads and displays greeting", async () => {
  // Arrange
  render(<InventoryTable rows={rows} tablePresenter={tablePresenter} />);
  const testid = `details_${rows[0].id.short}`;

  // Act
  fireEvent.click(screen.getAllByRole("button")[0]);
  await waitFor(() => screen.getByTestId(testid));

  // Assert
  expect(screen.getByTestId(testid)).toBeVisible();
});
