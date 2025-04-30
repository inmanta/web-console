import React, { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Attributes, EntityLike, ServiceModel } from "@/Core";
import { MockedDependencyProvider } from "@/Test";
import { words } from "@/UI/words";
import { CatalogAttributeHelper, CatalogTreeTableHelper } from "./Catalog";
import { PathHelper, TreeExpansionManager } from "./Helpers";
import { InventoryAttributeHelper, InventoryTreeTableHelper } from "./Inventory";
import { TreeTable } from "./TreeTable";

function inventorySetup(
  attributes: Attributes,
  service?: ServiceModel,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setTab?: jest.Mock<any, any, any>
) {
  const component = (
    <MockedDependencyProvider>
      <TreeTable
        treeTableHelper={
          new InventoryTreeTableHelper(
            new PathHelper("$"),
            new TreeExpansionManager("$"),
            new InventoryAttributeHelper("$", service),
            attributes
          )
        }
        setTab={setTab}
        version={1}
      />
    </MockedDependencyProvider>
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
    })
  );
  expect(screen.queryByRole("row", { name: "Row-a$b" })).not.toBeInTheDocument();

  // Act
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a" }));

  // Assert
  expect(screen.getByRole("row", { name: "Row-a$b" })).toBeVisible();
});

test("TreeTable with 1st level of attributes containing annotations should not render a value but be a link to the right tab.", async () => {
  const serviceModel: ServiceModel = {
    name: "service",
    environment: "env",
    attributes: [
      {
        name: "documentation",
        type: "string",
        description: "description",
        modifier: "rw",
        default_value: "",
        default_value_set: false,
        attribute_annotations: {
          web_presentation: "documentation",
          web_content_type: "text/markdown",
          web_icon: "FaBook",
          web_title: "Documentation",
        },
      },
    ],
    embedded_entities: [],
    inter_service_relations: [],
    config: {},
    lifecycle: {
      initial_state: "initial",
      states: [],
      transfers: [],
    },
    owner: null,
    owned_entities: [],
  };

  // mock the setTab function
  const setTab = jest.fn();

  render(
    inventorySetup(
      {
        candidate: null,
        active: {
          documentation: "```mermaid\ngraph LR\n    A --> B\n    B --> C\n```",
        },
        rollback: null,
      },
      serviceModel
    ),
    setTab()
  );

  // expect to find a row with a link to the documentation tab
  const documentationButton = screen.getByRole("button", {
    name: "documentation",
  });

  expect(documentationButton).toBeInTheDocument();

  act(() => {
    fireEvent.click(documentationButton);
  });
  // expect the setTab from the TreeTable component method to have been called
  expect(setTab).toHaveBeenCalled();
});

test("TreeTable 2nd level of nested property can be expanded", async () => {
  // Arrange
  render(
    inventorySetup({
      candidate: null,
      active: { a: { b: { c: "d" } } },
      rollback: null,
    })
  );
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a" }));

  expect(screen.queryByRole("row", { name: "Row-a$b$c" })).not.toBeInTheDocument();

  // Act
  fireEvent.click(screen.getByRole("button", { name: "Toggle-a$b" }));

  // Assert
  expect(screen.getByRole("row", { name: "Row-a$b$c" })).toBeVisible();
});

function catalogSetup(service: EntityLike) {
  const component = (
    <MockedDependencyProvider>
      <TreeTable
        treeTableHelper={
          new CatalogTreeTableHelper(
            new PathHelper("$"),
            new TreeExpansionManager("$"),
            new CatalogAttributeHelper("$"),
            service
          )
        }
        version={1}
      />
    </MockedDependencyProvider>
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

  expect(screen.queryByRole("row", { name: "Row-a$c$d" })).not.toBeInTheDocument();

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

  await userEvent.click(dropdown);

  await userEvent.click(screen.getByRole("option", { name: "Expand all" }));

  const row1 = screen.getByRole("row", { name: "Row-a$c$d" });
  const row2 = screen.getByRole("row", { name: "Row-a$e$f" });
  const row3 = screen.getByRole("row", { name: "Row-g$i$m$n" });

  expect(row1).toBeVisible();
  expect(row2).toBeVisible();
  expect(row3).toBeVisible();

  fireEvent.click(dropdown);

  await userEvent.click(screen.getByRole("option", { name: words("inventory.tabs.collapse") }));

  expect(row1).not.toBeVisible();
  expect(row2).not.toBeVisible();
  expect(row3).not.toBeVisible();
});
