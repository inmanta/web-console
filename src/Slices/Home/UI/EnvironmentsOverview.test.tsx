import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { dependencies, Environment } from "@/Test";
import { words } from "@/UI";
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
    const initialCards = await screen.findAllByTestId("Environment card");

    expect(initialCards).toHaveLength(4);
    const input = await screen.findByPlaceholderText(
      words("home.filters.env.placeholder"),
    );

    await userEvent.type(input, filterValue);

    expect(screen.queryAllByTestId("Environment card")).toHaveLength(
      numberOfResults,
    );
  },
);

test("Given environments overview When filtering by project Then only the matching environments should be rendered", async () => {
  const { component } = setup();

  render(component);
  const initialCards = await screen.findAllByTestId("Environment card");

  expect(initialCards).toHaveLength(4);

  const input = await screen.findByPlaceholderText(
    words("home.filters.project.placeholder"),
  );

  await userEvent.click(input);

  const option = await screen.findByRole("option", { name: "default" });

  await userEvent.click(option);

  expect(screen.queryAllByTestId("Environment card")).toHaveLength(2);
});

test("Given environments overview When filtering by name and project Then only the environments that match both should be rendered", async () => {
  const { component } = setup();

  render(component);
  const initialCards = await screen.findAllByTestId("Environment card");

  expect(initialCards).toHaveLength(4);
  const projectInput = await screen.findByPlaceholderText(
    words("home.filters.project.placeholder"),
  );

  await userEvent.click(projectInput);

  const option = await screen.findByRole("option", { name: "default" });

  await userEvent.click(option);

  const nameInput = await screen.findByPlaceholderText(
    words("home.filters.env.placeholder"),
  );

  await userEvent.type(nameInput, "test");

  expect(await screen.findByTestId("Environment card")).toBeVisible();
});

test("Given environments overview When rendering environment with icon Then the icon is shown, otherwise, show default icon", async () => {
  const { component } = setup();

  render(component);

  const cardWithIcon = screen.getByRole("img", {
    name: "test-env1-environment-logo",
  });

  expect(cardWithIcon).toBeVisible();

  const cardWithDefaultIcon = screen.getByRole("img", {
    name: "dev-env2-environment-logo",
  });

  expect(cardWithDefaultIcon).toBeVisible();
});
