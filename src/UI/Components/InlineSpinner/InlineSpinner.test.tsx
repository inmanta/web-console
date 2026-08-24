import { render, screen } from "@testing-library/react";
import { InlineSpinner } from "./InlineSpinner";

describe("InlineSpinner", () => {
  it("exposes a progressbar with the given label", () => {
    render(<InlineSpinner aria-label="deploying" />);

    expect(screen.getByRole("progressbar", { name: "deploying" })).toBeInTheDocument();
  });

  it("renders at the requested size", () => {
    render(<InlineSpinner size={20} aria-label="deploying" />);

    expect(screen.getByRole("progressbar")).toHaveStyle({ width: "20px", height: "20px" });
  });
});
