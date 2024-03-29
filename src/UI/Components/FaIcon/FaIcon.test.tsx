import React from "react";
import { render, screen } from "@testing-library/react";
import { DynamicFAIcon } from "./FaIcon";

describe("FaIcon", () => {
  it("renders an icon correctly", async () => {
    render(<DynamicFAIcon icon="FaSearch" />);
    const icon = await screen.findByTestId("FaSearch");
    expect(icon).toBeInTheDocument();
  });
});
