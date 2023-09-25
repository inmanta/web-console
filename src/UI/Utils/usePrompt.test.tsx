import React, { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { act } from "react-dom/test-utils";
import CustomRouter from "../Routing/CustomRouter";
import history from "../Routing/history";
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
    <CustomRouter history={history}>
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
    </CustomRouter>
  );
  return component;
};

beforeEach(() => {
  cleanup;
});
test("GIVEN usePrompt WHEN hook's parameter is equal true and user cancel alert window THEN page doesn't change", async () => {
  // prompt window isn't reachable through testing library, so I had to mock user input
  const prompt = jest.spyOn(window, "confirm").mockImplementation(() => false);
  render(setup());
  const button = screen.getByText("Click");
  await act(async () => {
    await userEvent.click(button);
  });

  const link = screen.getByText("Link");
  await act(async () => {
    await userEvent.click(link);
  });

  expect(prompt).toBeCalledTimes(1);
  expect(window.location.pathname).toMatch("/");
});

test("GIVEN usePrompt WHEN hook's parameter is equal false THEN page is changed", async () => {
  const prompt = jest.spyOn(window, "confirm");
  render(setup());

  const link = screen.getByText("Link");
  await act(async () => {
    await userEvent.click(link);
  });
  expect(prompt).toBeCalledTimes(0);
  expect(window.location.pathname).toMatch("/page");
});

test("GIVEN usePrompt WHEN hook's parameter is equal true and user confirm alert window THEN page is changed", async () => {
  const prompt = jest.spyOn(window, "confirm").mockImplementation(() => true);
  render(setup());

  //cleanup doesn't reset page url so I had to manually go back to "/"
  const homeLink = screen.getByText("Home");
  await act(async () => {
    await userEvent.click(homeLink);
  });
  const button = screen.getByText("Click");
  await act(async () => {
    await userEvent.click(button);
  });

  const link = screen.getByText("Link");
  await act(async () => {
    await userEvent.click(link);
  });

  expect(prompt).toBeCalledTimes(1);
  expect(window.location.pathname).toMatch("/page");
});
