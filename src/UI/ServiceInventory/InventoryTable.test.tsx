import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InventoryTable } from "./InventoryTable";
import { rows, tablePresenter } from "@/Test";
import { InstanceRow } from "./InstanceRow";

test("InventoryTable can be expanded", async () => {
  /* Arrange */
  render(
    <InventoryTable
      rows={rows}
      tablePresenter={tablePresenter}
      RowComponent={(props) => (
        <InstanceRow {...props} expandedContent={<>expanded</>} />
      )}
    />
  );

  /* Arrange: Verify expanded row is not visible */
  expect(
    screen.queryByRole("row", { name: "ExpandedRow-0" })
  ).not.toBeInTheDocument();

  /* Act: Click on toggle */
  fireEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);

  /* Assert: expanded row should be visible */
  expect(screen.getByRole("row", { name: "ExpandedRow-0" })).toBeVisible();
});
