import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { words } from "@/UI/words";
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

test("TreeTable with catalog entries all can be expanded at once", async () => {
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
          {
            name: "e",
            description: "desc",
            attributes: [{ name: "f", type: "int", description: "desc" }],
            embedded_entities: [],
          },
        ],
      },
      {
        name: "g",
        description: "",
        attributes: [{ name: "h", type: "int?", description: "desc" }],
        embedded_entities: [
          {
            name: "i",
            description: "desc",
            attributes: [{ name: "j", type: "int", description: "desc" }],
            embedded_entities: [
              {
                name: "k",
                description: "desc",
                attributes: [{ name: "l", type: "int", description: "desc" }],
                embedded_entities: [],
              },
              {
                name: "m",
                description: "desc",
                attributes: [{ name: "n", type: "int", description: "desc" }],
                embedded_entities: [],
              },
            ],
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
  //get buttons from dropdown
  const dropdown = screen.getByRole("listbox", {
    name: "expand-collapse-dropdown",
  });
  const dropdownOpenButton = within(dropdown).getByLabelText("Actions");
  await userEvent.click(dropdownOpenButton);

  await userEvent.click(within(dropdown).getByText("Expand all"));
  const row1 = screen.getByRole("row", { name: "Row-a$c$d" });
  const row2 = screen.getByRole("row", { name: "Row-a$e$f" });
  const row3 = screen.getByRole("row", { name: "Row-g$i$m$n" });

  expect(row1).toBeVisible();
  expect(row2).toBeVisible();
  expect(row3).toBeVisible();

  fireEvent.click(dropdownOpenButton);
  await userEvent.click(
    within(dropdown).getByText(words("inventory.tabs.collapse"))
  );
  expect(row1).not.toBeVisible();
  expect(row2).not.toBeVisible();
  expect(row3).not.toBeVisible();
});
