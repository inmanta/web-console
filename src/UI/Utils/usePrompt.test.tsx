import React, { useState } from "react";
import { Link, Route, Routes } from "react-router";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { TestMemoryRouter } from "../Routing/TestMemoryRouter";
import { usePrompt } from "./usePrompt";

const setup = () => {
  const Component: React.FC = () => {
    const [promptValue, setPromptValue] = useState(false);

    usePrompt("Prompt message", promptValue);

    return (
      <>
        <button onClick={() => setPromptValue(true)}>Click</button>
        <Link to="/page">
          <span>Link</span>
        </Link>
      </>
    );
  };
  const component = (
    <TestMemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Component />} />
        <Route
          path="/page"
          element={
            <div>
              <span>new page</span>
              <Link to="/">
                <span>Home</span>
              </Link>
            </div>
          }
        />
      </Routes>
    </TestMemoryRouter>
  );

  return component;
};

test("GIVEN usePrompt WHEN hook's parameter is equal true and user cancel alert window THEN page doesn't change", async () => {
  // prompt window isn't reachable through testing library, so I had to mock user input
  const prompt = vi.spyOn(window, "confirm").mockImplementation(() => false);

  render(setup());
  const button = screen.getByText("Click");

  await userEvent.click(button);

  const link = screen.getByText("Link");

  await userEvent.click(link);

  expect(prompt).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Click")).toBeInTheDocument(); // Still on the same page
});

test("GIVEN usePrompt WHEN hook's parameter is equal false THEN page is changed", async () => {
  const prompt = vi.spyOn(window, "confirm");

  render(setup());

  const link = screen.getByText("Link");

  await userEvent.click(link);

  expect(prompt).toHaveBeenCalledTimes(0);
  expect(screen.getByText("new page")).toBeInTheDocument();
});

test("GIVEN usePrompt WHEN hook's parameter is equal true and user confirm alert window THEN page is changed", async () => {
  const prompt = vi.spyOn(window, "confirm").mockImplementation(() => true);

  render(setup());

  const button = screen.getByText("Click");

  await userEvent.click(button);

  const link = screen.getByText("Link");

  await userEvent.click(link);

  expect(prompt).toHaveBeenCalledTimes(1);
  expect(screen.getByText("new page")).toBeInTheDocument();
});
