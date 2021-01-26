import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TreeTable } from "./TreeTable";
import { TreeTableHelper } from "./TreeTableHelper";
import { TreeExpansionManager } from "./TreeExpansionManager";
import { AttributeHelper } from "./AttributeHelper";

test("TreeTable 1st level of nested property can be expanded", async () => {
  // Arrange
  render(
    <TreeTable
      treeTableHelper={
        new TreeTableHelper(
          "$",
          {
            candidate: null,
            active: { a: { b: { c: "d" } } },
            rollback: null,
          },
          new TreeExpansionManager("$"),
          new AttributeHelper("$")
        )
      }
    />
  );

  expect(
    screen.queryByRole("row", { name: "Row-a$b" })
  ).not.toBeInTheDocument();

  // Act
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a" }));

  // Assert
  expect(screen.getByRole("row", { name: "Row-a$b" })).toBeVisible();
});

test("TreeTable 2nd level of nested property can be expanded", async () => {
  // Arrange
  render(
    <TreeTable
      treeTableHelper={
        new TreeTableHelper(
          "$",
          {
            candidate: null,
            active: { a: { b: { c: "d" } } },
            rollback: null,
          },
          new TreeExpansionManager("$"),
          new AttributeHelper("$")
        )
      }
    />
  );
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a" }));

  expect(
    screen.queryByRole("row", { name: "Row-a$b$c" })
  ).not.toBeInTheDocument();

  // Act
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a$b" }));

  // Assert
  expect(screen.getByRole("row", { name: "Row-a$b$c" })).toBeVisible();
});
