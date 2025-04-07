import React from "react";
import { render, screen } from "@testing-library/react";
import { Frame } from "./Frame";

describe("Frame", () => {
  const timestamp = { day: "Today", time: "3h" };

  it("renders without errors", () => {
    render(<Frame />);

    expect(screen.getAllByLabelText("loading-state")).toHaveLength(2);
    expect(screen.getByLabelText("done-state")).toBeInTheDocument();
  });

  it("renders with started timestamp", () => {
    render(<Frame started={timestamp} />);

    expect(screen.getByLabelText("loading-state")).toBeInTheDocument();
    expect(screen.getAllByLabelText("done-state")).toHaveLength(2);
  });

  it("renders with completed timestamp", () => {
    render(<Frame completed={timestamp} />);

    expect(screen.getByLabelText("loading-state")).toBeInTheDocument();
    expect(screen.getByLabelText("done-state")).toBeInTheDocument();
    expect(screen.getByLabelText("error-state")).toBeInTheDocument();
  });

  it("renders with success", () => {
    render(<Frame started={timestamp} completed={timestamp} success={true} />);

    expect(screen.getAllByLabelText("done-state")).toHaveLength(3);
  });

  it("renders with failed success", () => {
    render(<Frame started={timestamp} completed={timestamp} success={false} />);

    expect(screen.getAllByLabelText("done-state")).toHaveLength(2);
    expect(screen.getByLabelText("error-state")).toBeInTheDocument();
  });
});
