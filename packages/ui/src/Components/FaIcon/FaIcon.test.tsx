import React from "react";
import { render, screen } from "@testing-library/react";
import { DynamicFAIcon } from "./FaIcon";

describe("FaIcon", () => {
  it("renders an icon correctly", async () => {
    render(<DynamicFAIcon icon="FaSearch" />);
    const icon = await screen.findByTestId("FaSearch");

    expect(icon).toBeInTheDocument();
  });

  it("renders the svg on the first render and keeps the same svg element on re-render", () => {
    const { rerender } = render(<DynamicFAIcon icon="FaSearch" />);
    const svg = screen.getByTestId("FaSearch").querySelector("svg");

    expect(svg).toBeInTheDocument();

    rerender(<DynamicFAIcon icon="FaSearch" />);

    expect(screen.getByTestId("FaSearch").querySelector("svg")).toBe(svg);
  });
});
