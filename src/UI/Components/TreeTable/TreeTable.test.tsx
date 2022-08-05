import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CatalogAttributeHelper, CatalogTreeTableHelper } from "./Catalog";
import { PathHelper, TreeExpansionManager } from "./Helpers";
import {
  InventoryAttributeHelper,
  InventoryTreeTableHelper,
} from "./Inventory";
import { TreeTable } from "./TreeTable";

test("TreeTable 1st level of nested property can be expanded", async () => {
  // Arrange
  render(
    <TreeTable
      treeTableHelper={
        new InventoryTreeTableHelper(
          new PathHelper("$"),
          new TreeExpansionManager("$"),
          new InventoryAttributeHelper("$"),
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
        new InventoryTreeTableHelper(
          new PathHelper("$"),
          new TreeExpansionManager("$"),
          new InventoryAttributeHelper("$"),
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

test("TreeTable with catalog entries can be expanded", async () => {
  const service = {
    attributes: [],
    embedded_entities: [
      {
        name: "a",
        description: "",
        attributes: [{ name: "b", type: "int?", description: "desc" }],
        embedded_entities: [
          {
            name: "c",
            description: "desc",
            attributes: [{ name: "d", type: "int", description: "desc" }],
            embedded_entities: [],
          },
        ],
      },
    ],
  };
  render(
    <TreeTable
      treeTableHelper={
        new CatalogTreeTableHelper(
          new PathHelper("$"),
          new TreeExpansionManager("$"),
          new CatalogAttributeHelper("$"),
          service
        )
      }
    />
  );
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a" }));

  expect(
    screen.queryByRole("row", { name: "Row-a$c$d" })
  ).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Toggle-a$c" }));

  expect(screen.getByRole("row", { name: "Row-a$c$d" })).toBeVisible();
});
