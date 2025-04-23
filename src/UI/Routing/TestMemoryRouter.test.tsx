import React, { useState } from "react";
import { Link, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TestMemoryRouter, useTestBlocker } from "./TestMemoryRouter";

describe("TestMemoryRouter", () => {
  it("should support useBlocker functionality", async () => {
    const TestComponent = () => {
      const [shouldBlock, setShouldBlock] = useState(false);
      useTestBlocker(shouldBlock);

      return (
        <>
          <button onClick={() => setShouldBlock(true)}>Enable Blocking</button>
          <Link to="/page">Navigate</Link>
        </>
      );
    };

    const component = (
      <TestMemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<TestComponent />} />
          <Route
            path="/page"
            element={
              <div>
                <span>New Page</span>
                <Link to="/">Home</Link>
              </div>
            }
          />
        </Routes>
      </TestMemoryRouter>
    );

    render(component);

    // Initially, navigation should work
    await userEvent.click(screen.getByText("Navigate"));
    expect(screen.getByText("New Page")).toBeInTheDocument();

    // Go back to home
    await userEvent.click(screen.getByText("Home"));
    expect(screen.getByText("Enable Blocking")).toBeInTheDocument();

    // Enable blocking and try to navigate
    await userEvent.click(screen.getByText("Enable Blocking"));
    await userEvent.click(screen.getByText("Navigate"));

    // Should still be on the home page due to blocking
    expect(screen.getByText("Enable Blocking")).toBeInTheDocument();
  });
});
