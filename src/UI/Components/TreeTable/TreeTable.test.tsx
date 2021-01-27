import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TreeTable } from "./TreeTable";
import {
  AttributeHelper,
  PathHelper,
  TreeExpansionManager,
  TreeTableHelper,
} from "./Helpers";

test("TreeTable 1st level of nested property can be expanded", async () => {
  // Arrange
  render(
    <TreeTable
      treeTableHelper={
        new TreeTableHelper(
          new PathHelper("$"),
          new TreeExpansionManager("$"),
          new AttributeHelper("$"),
          {
            candidate: null,
            active: { a: { b: { c: "d" } } },
            rollback: null,
          }
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
          new PathHelper("$"),
          new TreeExpansionManager("$"),
          new AttributeHelper("$"),
          {
            candidate: null,
            active: { a: { b: { c: "d" } } },
            rollback: null,
          }
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
