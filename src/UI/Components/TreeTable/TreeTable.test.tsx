import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Attributes, EntityLike } from "@/Core";
import { CommandResolverImpl, KeycloakAuthHelper } from "@/Data";
import { UpdateInstanceAttributeCommandManager } from "@/Data/Managers/UpdateInstanceAttribute";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { CatalogAttributeHelper, CatalogTreeTableHelper } from "./Catalog";
import { PathHelper, TreeExpansionManager } from "./Helpers";
import {
  InventoryAttributeHelper,
  InventoryTreeTableHelper,
} from "./Inventory";
import { TreeTable } from "./TreeTable";

function inventorySetup(attributes: Attributes) {
  const apiHelper = new DeferredApiHelper();

  const updateAttribute = UpdateInstanceAttributeCommandManager(
    new KeycloakAuthHelper(),
    apiHelper,
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([updateAttribute]),
  );

  const component = (
    <DependencyProvider
      dependencies={{
        ...dependencies,
        commandResolver,
      }}
    >
      <TreeTable
        treeTableHelper={
          new InventoryTreeTableHelper(
            new PathHelper("$"),
            new TreeExpansionManager("$"),
            new InventoryAttributeHelper("$"),
            attributes,
          )
        }
        version={1}
      />
    </DependencyProvider>
  );

  return component;
}
test("TreeTable 1st level of nested property can be expanded", async () => {
  // Arrange
  render(
    inventorySetup({
      candidate: null,
      active: { a: { b: { c: "d" } } },
      rollback: null,
    }),
  );
  expect(
    screen.queryByRole("row", { name: "Row-a$b" }),
  ).not.toBeInTheDocument();

  // Act
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a" }));

  // Assert
  expect(screen.getByRole("row", { name: "Row-a$b" })).toBeVisible();
});

test("TreeTable 2nd level of nested property can be expanded", async () => {
  // Arrange
  render(
    inventorySetup({
      candidate: null,
      active: { a: { b: { c: "d" } } },
      rollback: null,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a" }));

  expect(
    screen.queryByRole("row", { name: "Row-a$b$c" }),
  ).not.toBeInTheDocument();

  // Act
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a$b" }));

  // Assert
  expect(screen.getByRole("row", { name: "Row-a$b$c" })).toBeVisible();
});

function catalogSetup(service: EntityLike) {
  const apiHelper = new DeferredApiHelper();

  const updateAttribute = UpdateInstanceAttributeCommandManager(
    new KeycloakAuthHelper(),
    apiHelper,
  );
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([updateAttribute]),
  );

  const component = (
    <DependencyProvider
      dependencies={{
        ...dependencies,
        commandResolver,
      }}
    >
      <TreeTable
        treeTableHelper={
          new CatalogTreeTableHelper(
            new PathHelper("$"),
            new TreeExpansionManager("$"),
            new CatalogAttributeHelper("$"),
            service,
          )
        }
        version={1}
      />
    </DependencyProvider>
  );

  return component;
}
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
  render(catalogSetup(service));
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a" }));

  expect(
    screen.queryByRole("row", { name: "Row-a$c$d" }),
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
  render(catalogSetup(service));

  //get buttons from dropdown
  const dropdown = screen.getByRole("button", {
    name: "expand-collapse-dropdown-toggle",
  });

  await act(async () => {
    await userEvent.click(dropdown);
  });
  await act(async () => {
    await userEvent.click(screen.getByRole("option", { name: "Expand all" }));
  });

  const row1 = screen.getByRole("row", { name: "Row-a$c$d" });
  const row2 = screen.getByRole("row", { name: "Row-a$e$f" });
  const row3 = screen.getByRole("row", { name: "Row-g$i$m$n" });

  expect(row1).toBeVisible();
  expect(row2).toBeVisible();
  expect(row3).toBeVisible();

  fireEvent.click(dropdown);

  await act(async () => {
    await userEvent.click(
      screen.getByRole("option", { name: words("inventory.tabs.collapse") }),
    );
  });

  expect(row1).not.toBeVisible();
  expect(row2).not.toBeVisible();
  expect(row3).not.toBeVisible();
});
