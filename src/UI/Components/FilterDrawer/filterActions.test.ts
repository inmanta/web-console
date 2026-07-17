import { RangeOperator, type DateRange, type IntRange } from "@/Core";
import { CustomDatePresenter } from "@/UI/Utils";
import { getFilterActions } from "./filterActions";

interface TestFilter {
  type?: string[];
  agent?: string[];
  updated?: DateRange.Type[];
  version?: IntRange.Type[];
  disregardDefault?: boolean;
}

const setup = (filter: TestFilter) => {
  const setFilter = vi.fn();
  const actions = getFilterActions<TestFilter>(filter, setFilter);

  return { actions, setFilter };
};

describe("getFilterActions - string chip fields", () => {
  it("addString appends a value and deduplicates", () => {
    const { actions, setFilter } = setup({ type: ["a"] });

    actions.addString("type", "b");
    expect(setFilter).toHaveBeenCalledWith({ type: ["a", "b"] });

    setFilter.mockClear();
    actions.addString("type", "a");
    expect(setFilter).toHaveBeenCalledWith({ type: ["a"] });
  });

  it("toggleString adds when absent and removes when present", () => {
    const { actions, setFilter } = setup({ type: ["a"] });

    actions.toggleString("type", "b");
    expect(setFilter).toHaveBeenCalledWith({ type: ["a", "b"] });

    setFilter.mockClear();
    actions.toggleString("type", "a");
    // removing the only remaining match empties the list -> undefined
    expect(setFilter).toHaveBeenCalledWith({ type: undefined });
  });

  it("setStrings replaces the whole list", () => {
    const { actions, setFilter } = setup({ type: ["a", "b"] });

    actions.setStrings("type", ["c"]);
    expect(setFilter).toHaveBeenCalledWith({ type: ["c"] });

    setFilter.mockClear();
    actions.setStrings("type", []);
    expect(setFilter).toHaveBeenCalledWith({ type: undefined });
  });

  it("removeStringChip removes a value and normalises an empty list to undefined", () => {
    const { actions, setFilter } = setup({ type: ["a", "b"], agent: ["x"] });

    actions.removeStringChip("type", "a");
    expect(setFilter).toHaveBeenCalledWith({ type: ["b"], agent: ["x"] });

    setFilter.mockClear();
    actions.removeStringChip("agent", "x");
    expect(setFilter).toHaveBeenCalledWith({ type: ["a", "b"], agent: undefined });
  });

  it("clearStringGroup clears a single field", () => {
    const { actions, setFilter } = setup({ type: ["a"], agent: ["x"] });

    actions.clearStringGroup("type");
    expect(setFilter).toHaveBeenCalledWith({ type: undefined, agent: ["x"] });
  });

  it("merges the optional patch into the same update", () => {
    const { actions, setFilter } = setup({ type: ["a"] });

    actions.setStrings("type", ["b"], { disregardDefault: true });
    expect(setFilter).toHaveBeenCalledWith({ type: ["b"], disregardDefault: true });

    setFilter.mockClear();
    actions.clearStringGroup("type", { disregardDefault: true });
    expect(setFilter).toHaveBeenCalledWith({ type: undefined, disregardDefault: true });
  });
});

describe("getFilterActions - date range fields", () => {
  const presenter = new CustomDatePresenter();
  const fromEntry: DateRange.Type = {
    date: new Date("2026-07-16T10:00:00.000Z"),
    operator: RangeOperator.Operator.From,
  };
  const toEntry: DateRange.Type = {
    date: new Date("2026-07-17T10:00:00.000Z"),
    operator: RangeOperator.Operator.To,
  };
  const labelOf = (entry: DateRange.Type) =>
    `${entry.operator} | ${presenter.getFull(entry.date.toISOString())}`;

  it("dateChips formats each entry as 'operator | fullDate'", () => {
    const { actions } = setup({ updated: [fromEntry, toEntry] });

    expect(actions.dateChips("updated", presenter)).toEqual([labelOf(fromEntry), labelOf(toEntry)]);
  });

  it("removeDateChip removes the entry matching the label's operator", () => {
    const { actions, setFilter } = setup({ updated: [fromEntry, toEntry] });

    actions.removeDateChip("updated", labelOf(fromEntry));
    expect(setFilter).toHaveBeenCalledWith({ updated: [toEntry] });
  });

  it("removeDateChip normalises an emptied field to undefined", () => {
    const { actions, setFilter } = setup({ updated: [fromEntry] });

    actions.removeDateChip("updated", labelOf(fromEntry));
    expect(setFilter).toHaveBeenCalledWith({ updated: undefined });
  });

  it("clearDateRange clears the whole field", () => {
    const { actions, setFilter } = setup({ updated: [fromEntry, toEntry] });

    actions.clearDateRange("updated");
    expect(setFilter).toHaveBeenCalledWith({ updated: undefined });
  });
});

describe("getFilterActions - integer range fields", () => {
  const fromEntry: IntRange.Type = { value: 1, operator: RangeOperator.Operator.From };
  const toEntry: IntRange.Type = { value: 5, operator: RangeOperator.Operator.To };
  const labelOf = (entry: IntRange.Type) => `${entry.operator} | ${entry.value}`;

  it("intChips formats each entry as 'operator | value'", () => {
    const { actions } = setup({ version: [fromEntry, toEntry] });

    expect(actions.intChips("version")).toEqual([labelOf(fromEntry), labelOf(toEntry)]);
  });

  it("removeIntChip removes the entry matching the label's operator", () => {
    const { actions, setFilter } = setup({ version: [fromEntry, toEntry] });

    actions.removeIntChip("version", labelOf(fromEntry));
    expect(setFilter).toHaveBeenCalledWith({ version: [toEntry] });
  });

  it("clearIntRange clears the whole field", () => {
    const { actions, setFilter } = setup({ version: [fromEntry, toEntry] });

    actions.clearIntRange("version");
    expect(setFilter).toHaveBeenCalledWith({ version: undefined });
  });
});
