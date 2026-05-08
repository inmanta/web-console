import { DragDropSortProps } from "@patternfly/react-drag-drop";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Resource } from "@/Core";
import { MultiSort } from "@/Data";
import { StatusSortMenu } from "./StatusSortMenu";

vi.mock("@/UI", () => ({
  words: (key: string) => key,
}));

vi.mock("@patternfly/react-drag-drop", () => ({
  DragDropSort: ({ items, onDrop }: DragDropSortProps) => (
    <div data-testid="drag-drop-sort">
      {items.map((item) => (
        <div key={item.id} data-testid="draggable-item" data-id={item.id}>
          {item.content}
        </div>
      ))}
      <button
        data-testid="simulate-drop"
        onClick={() => onDrop({} as never, [...items].reverse())}
      />
    </div>
  ),
  DraggableObject: {},
}));

const STATUS_KEYS: Resource.StatusSortKey[] = [...Resource.STATUS_SORT_KEYS];

/**
 * Builds a typed MultiSort<SortKey> from status key entries.
 * StatusSortKey extends SortKey, so the cast is always valid.
 */
const makeSort = (
  entries: Array<{ name: Resource.StatusSortKey; order: "asc" | "desc" }>
): MultiSort<Resource.SortKey> => entries;

const emptySort: MultiSort<Resource.SortKey> = [];

function setup(sort: MultiSort<Resource.SortKey> = emptySort) {
  const setSort = vi.fn();

  render(<StatusSortMenu sort={sort} setSort={setSort} />);

  return {
    setSort,
    toggle: () => screen.getByRole("button", { name: "Sort by status fields" }),
    badge: () => screen.getByTestId("status-sort-badge"),
    menu: () => screen.queryByTestId("status-sort-menu"),
  };
}

describe("StatusSortMenu", () => {
  describe("badge", () => {
    it("shows 0 when no active sorts", () => {
      const { badge } = setup();
      expect(badge()).toHaveTextContent("0");
    });

    it("reflects the number of active status sorts", () => {
      const { badge } = setup(
        makeSort([
          { name: "blocked", order: "asc" },
          { name: "compliance", order: "desc" },
        ])
      );
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

  describe("dropdown", () => {
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

  describe("inactive items", () => {
    it("renders all status keys as inactive when sort is empty", async () => {
      const { toggle } = setup();
      await userEvent.click(toggle());

      STATUS_KEYS.forEach((key) => {
        expect(screen.getByText(`resources.sort.label.${key}`)).toBeInTheDocument();
      });
    });

    it("calls setSort when an inactive item is clicked", async () => {
      const { toggle, setSort } = setup();
      await userEvent.click(toggle());
      fireEvent.click(screen.getByText("resources.sort.label.blocked"));
      expect(setSort).toHaveBeenCalledTimes(1);
    });
  });

  describe("active items", () => {
    it("renders a divider between active and inactive sections", async () => {
      const { toggle } = setup(makeSort([{ name: "blocked", order: "asc" }]));
      await userEvent.click(toggle());
      expect(screen.getByRole("separator")).toBeInTheDocument();
    });

    it("does not render a divider when all keys are active", async () => {
      const { toggle } = setup(makeSort(STATUS_KEYS.map((key) => ({ name: key, order: "asc" }))));
      await userEvent.click(toggle());
      expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    });

    it("calls setSort when an active item is clicked", async () => {
      const { toggle, setSort } = setup(makeSort([{ name: "blocked", order: "asc" }]));
      await userEvent.click(toggle());
      fireEvent.click(screen.getByTestId("status-sort-item"));
      expect(setSort).toHaveBeenCalledTimes(1);
    });
  });

  describe("drag-and-drop reordering", () => {
    it("calls setSort with items in the new order after a drop", async () => {
      const { toggle, setSort } = setup(
        makeSort([
          { name: "blocked", order: "asc" },
          { name: "compliance", order: "desc" },
        ])
      );

      await userEvent.click(toggle());
      // We mock the drag and drop event
      fireEvent.click(screen.getByTestId("simulate-drop"));

      expect(setSort).toHaveBeenCalledWith([
        expect.objectContaining({ name: "compliance" }),
        expect.objectContaining({ name: "blocked" }),
      ]);
    });
  });
});
