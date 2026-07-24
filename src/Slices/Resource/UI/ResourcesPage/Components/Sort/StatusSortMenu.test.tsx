import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Resource } from "@/Core";
import { MultiSort } from "@/Data";
import { StatusSortMenu, reorderSorts } from "./StatusSortMenu";

vi.mock("@/UI", () => ({
  words: (key: string) => key,
}));

vi.mock("@patternfly/react-drag-drop", () => ({
  DragDropSort: ({
    items,
    children,
  }: {
    items: { id: string; content: React.ReactNode }[];
    children: React.ReactNode;
  }) => (
    <>
      {items.map((item) => (
        <div key={item.id}>{item.content}</div>
      ))}
      {children}
    </>
  ),
}));

type ActiveStatusSorts = { name: Resource.StatusSortKey; order: "asc" | "desc" }[];

const emptySort: MultiSort<Resource.SortKey> = [];

function setup(sort: MultiSort<Resource.SortKey> = emptySort) {
  const setSort = vi.fn();

  render(<StatusSortMenu sort={sort} setSort={setSort} />);

  return {
    setSort,
    toggle: () => screen.getByRole("button", { name: "Sort by status fields" }),
    badge: () => screen.getByTestId("status-sort-badge"),
    menu: () => screen.queryByRole("list", { name: "draggable-sort-items" }),
  };
}

describe("StatusSortMenu", () => {
  describe("active sort badge count", () => {
    it("shows 0 when no active sorts", () => {
      const { badge } = setup();
      expect(badge()).toHaveTextContent("0");
    });

    it("reflects the number of active status sorts", () => {
      const { badge } = setup([
        { name: "blocked", order: "asc" },
        { name: "compliance", order: "desc" },
      ]);
      expect(badge()).toHaveTextContent("2");
    });

    it("ignores non-status sort keys", () => {
      const { badge } = setup([
        { name: "blocked", order: "asc" },
        { name: "agent", order: "asc" },
      ]);
      expect(badge()).toHaveTextContent("1");
    });
  });

  describe("menu open/close behavior", () => {
    it("is closed by default", () => {
      const { menu } = setup();
      expect(menu()).not.toBeInTheDocument();
    });

    it("opens when the toggle is clicked", async () => {
      const { toggle, menu } = setup();
      await userEvent.click(toggle());
      expect(menu()).toBeInTheDocument();
    });
  });

  describe("sort item rendering and interaction", () => {
    it("renders all status keys when sort is empty", async () => {
      const { toggle } = setup();
      await userEvent.click(toggle());

      Resource.STATUS_SORT_KEYS.forEach((key) => {
        expect(screen.getByText(`resources.sort.label.${key}`)).toBeInTheDocument();
      });
    });

    it("calls setSort with the key added when an inactive item is clicked", async () => {
      const { toggle, setSort } = setup();
      await userEvent.click(toggle());
      fireEvent.click(screen.getByText("resources.sort.label.blocked"));
      expect(setSort).toHaveBeenCalledWith([{ name: "blocked", order: "asc" }]);
    });

    it("calls setSort without the deactivated key", async () => {
      const { toggle, setSort } = setup([
        { name: "blocked", order: "desc" },
        { name: "compliance", order: "desc" },
      ]);
      await userEvent.click(toggle());
      fireEvent.click(screen.getByText("resources.sort.label.blocked"));

      expect(setSort).toHaveBeenCalledWith([expect.objectContaining({ name: "compliance" })]);
      expect(setSort).not.toHaveBeenCalledWith([expect.objectContaining({ name: "blocked" })]);
    });
  });

  describe("reorderSorts - drag drop reorder logic", () => {
    it("returns active sorts in the new order", () => {
      const activeStatusSorts: ActiveStatusSorts = [
        { name: "blocked", order: "asc" },
        { name: "compliance", order: "desc" },
      ];

      const result = reorderSorts(["compliance", "blocked"], activeStatusSorts);

      expect(result).toEqual([
        { name: "compliance", order: "desc" },
        { name: "blocked", order: "asc" },
      ]);
    });

    it("omits inactive keys from the result", () => {
      const activeStatusSorts: ActiveStatusSorts = [{ name: "blocked", order: "asc" }];

      const result = reorderSorts(["compliance", "blocked", "isDeploying"], activeStatusSorts);

      expect(result).toEqual([{ name: "blocked", order: "asc" }]);
    });

    it("returns empty array when no active sorts match", () => {
      const result = reorderSorts(["blocked", "compliance"], []);
      expect(result).toEqual([]);
    });
  });
});
