import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { DateRange, RangeOperator } from "@/Core";
import { TimestampRangeFilter } from "./TimestampRangeFilter";

const renderFilter = (value: DateRange.Type[] = []) => {
  const onChange = vi.fn();

  render(
    <TimestampRangeFilter
      label="Date"
      fromLabel="From"
      toLabel="To"
      value={value}
      onChange={onChange}
    />
  );

  return onChange;
};

describe("TimestampRangeFilter", () => {
  it("disables both apply buttons until a date is picked", () => {
    renderFilter();

    expect(screen.getByLabelText("Apply date from filter")).toBeDisabled();
    expect(screen.getByLabelText("Apply date to filter")).toBeDisabled();
  });

  it("applies the picked date under the From operator", async () => {
    const onChange = renderFilter();

    await userEvent.type(screen.getByLabelText("From Date Picker"), "2021-12-06");
    await userEvent.click(screen.getByLabelText("Apply date from filter"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [entries] = onChange.mock.calls[0];
    expect(entries).toHaveLength(1);
    expect(entries[0].operator).toBe(RangeOperator.Operator.From);
    expect(entries[0].date).toBeInstanceOf(Date);
  });

  it("replaces the existing entry for the same operator instead of appending", async () => {
    const onChange = renderFilter([
      { date: new Date("2020-01-01T00:00:00.000Z"), operator: RangeOperator.Operator.From },
    ]);

    await userEvent.type(screen.getByLabelText("From Date Picker"), "2021-12-06");
    await userEvent.click(screen.getByLabelText("Apply date from filter"));

    const [entries] = onChange.mock.calls[0];
    expect(entries).toHaveLength(1);
    expect(entries[0].operator).toBe(RangeOperator.Operator.From);
  });

  it("keeps the other operator's entry when applying a value", async () => {
    const onChange = renderFilter([
      { date: new Date("2020-01-01T00:00:00.000Z"), operator: RangeOperator.Operator.From },
    ]);

    await userEvent.type(screen.getByLabelText("To Date Picker"), "2021-12-07");
    await userEvent.click(screen.getByLabelText("Apply date to filter"));

    const [entries] = onChange.mock.calls[0];
    expect(entries).toHaveLength(2);
    expect(entries.map((entry: DateRange.Type) => entry.operator)).toEqual([
      RangeOperator.Operator.From,
      RangeOperator.Operator.To,
    ]);
  });
});
