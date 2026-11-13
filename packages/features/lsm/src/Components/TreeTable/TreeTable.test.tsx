import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { EntityLike, words } from "@inmanta/web-console-core";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { CatalogAttributeHelper, CatalogTreeTableHelper } from "./Catalog";
import { PathHelper, TreeExpansionManager } from "./Helpers";
import { TreeTable } from "./TreeTable";

function catalogSetup(service: EntityLike) {
  const component = (
    <QueryClientProvider client={testClient}>
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
        />
      </MockedDependencyProvider>
    </QueryClientProvider>
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

  expect(screen.queryByRole("row", { name: "Row-a$c" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Toggle-a" })).toHaveAttribute(
    "aria-expanded",
    "false"
  );

  fireEvent.click(screen.getByRole("button", { name: "Toggle-a" }));

  expect(screen.getByRole("row", { name: "Row-a$c" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Toggle-a" })).toHaveAttribute("aria-expanded", "true");
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

  await userEvent.click(screen.getByRole("option", { name: words("collapseAll") }));

  expect(row1).not.toBeVisible();
  expect(row2).not.toBeVisible();
  expect(row3).not.toBeVisible();
});
