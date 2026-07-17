import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { IntRange, RangeOperator } from "@/Core";
import { IntRangeFilter } from "./IntRangeFilter";

const renderFilter = (value: IntRange.Type[] = []) => {
  const onChange = vi.fn();

  render(
    <IntRangeFilter
      label="Version"
      fromLabel="From"
      toLabel="To"
      value={value}
      onChange={onChange}
    />
  );

  return onChange;
};

describe("IntRangeFilter", () => {
  it("disables both apply buttons until a value is entered", () => {
    renderFilter();

    expect(screen.getByLabelText("Apply Version from filter")).toBeDisabled();
    expect(screen.getByLabelText("Apply Version to filter")).toBeDisabled();
  });

  it("applies the from value with the From operator", async () => {
    const onChange = renderFilter();

    await userEvent.type(screen.getByLabelText("Version range from"), "3");
    await userEvent.click(screen.getByLabelText("Apply Version from filter"));

    expect(onChange).toHaveBeenCalledWith([{ value: 3, operator: RangeOperator.Operator.From }]);
  });

  it("applies the to value when Enter is pressed", async () => {
    const onChange = renderFilter();

    await userEvent.type(screen.getByLabelText("Version range to"), "5{enter}");

    expect(onChange).toHaveBeenCalledWith([{ value: 5, operator: RangeOperator.Operator.To }]);
  });

  it("replaces the existing entry for the same operator instead of appending", async () => {
    const onChange = renderFilter([{ value: 1, operator: RangeOperator.Operator.From }]);

    await userEvent.type(screen.getByLabelText("Version range from"), "9");
    await userEvent.click(screen.getByLabelText("Apply Version from filter"));

    expect(onChange).toHaveBeenCalledWith([{ value: 9, operator: RangeOperator.Operator.From }]);
  });

  it("keeps the other operator's entry when applying a value", async () => {
    const onChange = renderFilter([{ value: 1, operator: RangeOperator.Operator.From }]);

    await userEvent.type(screen.getByLabelText("Version range to"), "5");
    await userEvent.click(screen.getByLabelText("Apply Version to filter"));

    expect(onChange).toHaveBeenCalledWith([
      { value: 1, operator: RangeOperator.Operator.From },
      { value: 5, operator: RangeOperator.Operator.To },
    ]);
  });
});
