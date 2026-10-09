import { fireEvent, render, screen } from "@testing-library/react";
import { preventNumberInputScroll } from "./preventNumberInputScroll";

describe("preventNumberInputScroll", () => {
  it("blurs a focused number input on wheel so scrolling does not change its value", () => {
    render(<input type="number" aria-label="amount" onWheel={preventNumberInputScroll} />);
    const input = screen.getByLabelText("amount");

    input.focus();
    expect(input).toHaveFocus();

    fireEvent.wheel(input);

    expect(input).not.toHaveFocus();
  });

  it("leaves a focused non-number input untouched on wheel", () => {
    render(<input type="text" aria-label="name" onWheel={preventNumberInputScroll} />);
    const input = screen.getByLabelText("name");

    input.focus();
    fireEvent.wheel(input);

    expect(input).toHaveFocus();
  });
});
