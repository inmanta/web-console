import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { dependencies, Environment } from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvironmentsOverview } from "./EnvironmentsOverview";

function setup() {
  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={dependencies}>
        <EnvironmentsOverview environments={Environment.filterable} />
      </DependencyProvider>
    </MemoryRouter>
  );
  return { component };
}

it.each`
  filterValue   | numberOfResults
  ${"test"}     | ${2}
  ${"dev-env2"} | ${1}
  ${"abcd"}     | ${0}
`(
  "Given the environment overview When filtering by name $filterValue Then $numberOfResults results should be rendered",
  async ({ filterValue, numberOfResults }) => {
    const { component } = setup();
    render(component);
    const initialCards = await screen.findAllByRole("article", {
      name: "Environment card",
    });
    expect(initialCards).toHaveLength(4);
    const input = await screen.findByPlaceholderText("Filter by name");
    await userEvent.click(input);
    await userEvent.type(input, filterValue);
    expect(
      screen.queryAllByRole("article", {
        name: "Environment card",
      })
    ).toHaveLength(numberOfResults);
  }
);

test("Given environments overview When filtering by project Then only the matching environments should be rendered", async () => {
  const { component } = setup();
  render(component);
  const initialCards = await screen.findAllByRole("article", {
    name: "Environment card",
  });
  expect(initialCards).toHaveLength(4);
  const input = await screen.findByPlaceholderText("Filter by project");
  await userEvent.click(input);
  const option = await screen.findByRole("option", { name: "default" });
  await await userEvent.click(option);
  expect(
    screen.queryAllByRole("article", {
      name: "Environment card",
    })
  ).toHaveLength(2);
});

test("Given environments overview When filtering by name and project Then only the environments that match both should be rendered", async () => {
  const { component } = setup();
  render(component);
  const initialCards = await screen.findAllByRole("article", {
    name: "Environment card",
  });
  expect(initialCards).toHaveLength(4);
  const projectInput = await screen.findByPlaceholderText("Filter by project");
  await userEvent.click(projectInput);
  const option = await screen.findByRole("option", { name: "default" });
  await await userEvent.click(option);
  const nameInput = await screen.findByPlaceholderText("Filter by name");
  await userEvent.click(nameInput);
  await userEvent.type(nameInput, "test");
  expect(
    await screen.findByRole("article", {
      name: "Environment card",
    })
  ).toBeVisible();
});

test("Given environments overview When rendering environment with icon Then the icon is shown", async () => {
  const { component } = setup();
  render(component);
  const cardWithIcon = await screen.findByRole("img", {
    name: "test-env1-icon",
  });
  expect(cardWithIcon).toBeVisible();
  const cardWithoutIcon = screen.queryByRole("img", { name: "dev-env2-icon" });
  expect(cardWithoutIcon).not.toBeInTheDocument();
});
