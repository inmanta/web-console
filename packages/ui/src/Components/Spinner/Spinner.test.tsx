import { render, screen } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("exposes a progressbar with the given label", () => {
    render(<Spinner aria-label="deploying" />);

    expect(screen.getByRole("progressbar", { name: "deploying" })).toBeInTheDocument();
  });

  it("renders at the requested size", () => {
    render(<Spinner size={20} aria-label="deploying" />);

    expect(screen.getByRole("progressbar")).toHaveStyle({ width: "20px", height: "20px" });
  });
});
