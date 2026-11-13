import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, within } from "@testing-library/react";
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

/**
 * Returns the button that shows or hides the child rows of the row with the given path.
 */
function getRowToggle(path: string): HTMLElement {
  return within(screen.getByRole("row", { name: `Row-${path}` })).getByRole("button");
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
  expect(getRowToggle("a")).toHaveAttribute("aria-expanded", "false");

  fireEvent.click(getRowToggle("a"));

  expect(screen.getByRole("row", { name: "Row-a$c" })).toBeVisible();
  expect(getRowToggle("a")).toHaveAttribute("aria-expanded", "true");
  expect(screen.queryByRole("row", { name: "Row-a$c$d" })).not.toBeInTheDocument();

  fireEvent.click(getRowToggle("a$c"));

  expect(screen.getByRole("row", { name: "Row-a$c$d" })).toBeVisible();
});

test("TreeTable rows with child rows open and close when their name is clicked", async () => {
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

  fireEvent.click(within(screen.getByRole("row", { name: "Row-a" })).getByText("a"));

  expect(screen.getByRole("row", { name: "Row-a$c" })).toBeVisible();
  expect(getRowToggle("a")).toHaveAttribute("aria-expanded", "true");

  fireEvent.click(within(screen.getByRole("row", { name: "Row-a$c" })).getByText("c"));

  expect(screen.getByRole("row", { name: "Row-a$c$d" })).toBeVisible();

  fireEvent.click(within(screen.getByRole("row", { name: "Row-a" })).getByText("a"));

  expect(screen.queryByRole("row", { name: "Row-a$c" })).not.toBeInTheDocument();
  expect(getRowToggle("a")).toHaveAttribute("aria-expanded", "false");
});

test("TreeTable rows carry their tree position and only rows with child rows get a toggle", async () => {
  const service = {
    attributes: [{ name: "x", type: "string", description: "desc", modifier: "rw" }],
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
  fireEvent.click(getRowToggle("a"));

  const rootRow = screen.getByRole("row", { name: "Row-a" });
  const leafRow = screen.getByRole("row", { name: "Row-a$b" });
  const branchRow = screen.getByRole("row", { name: "Row-a$c" });
  const flatRow = screen.getByRole("row", { name: "Row-x" });

  expect(rootRow).toHaveAttribute("aria-level", "1");
  expect(rootRow).toHaveAttribute("aria-posinset", "1");
  expect(rootRow).toHaveAttribute("aria-setsize", "2");
  expect(leafRow).toHaveAttribute("aria-level", "2");
  expect(leafRow).toHaveAttribute("aria-posinset", "1");
  expect(branchRow).toHaveAttribute("aria-level", "2");
  expect(branchRow).toHaveAttribute("aria-posinset", "2");
  expect(branchRow).toHaveAttribute("aria-setsize", "1");
  expect(flatRow).toHaveAttribute("aria-level", "1");
  expect(flatRow).toHaveAttribute("aria-posinset", "2");

  expect(within(leafRow).queryByRole("button")).not.toBeInTheDocument();
  expect(within(flatRow).queryByRole("button")).not.toBeInTheDocument();
});

test("TreeTable rows of an embedded entity without attributes cannot be opened", async () => {
  const service = {
    attributes: [],
    embedded_entities: [{ name: "a", description: "", attributes: [], embedded_entities: [] }],
  };

  render(catalogSetup(service));

  const emptyRow = screen.getByRole("row", { name: "Row-a" });

  expect(within(emptyRow).queryByRole("button")).not.toBeInTheDocument();

  fireEvent.click(within(emptyRow).getByText("a"));

  expect(emptyRow).toHaveAttribute("aria-expanded", "false");
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
