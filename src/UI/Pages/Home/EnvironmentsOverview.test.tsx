import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CommandResolverImpl,
  DeleteEnvironmentCommandManager,
  getStoreInstance,
  EnvironmentsUpdater,
  GetEnvironmentsStateHelper,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicCommandManagerResolver,
  Environment,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { EnvironmentsOverview } from "./EnvironmentsOverview";

function setup() {
  const store = getStoreInstance();

  const apiHelper = new DeferredApiHelper();
  const commandResolver = new CommandResolverImpl(
    new DynamicCommandManagerResolver([
      new DeleteEnvironmentCommandManager(
        apiHelper,
        new EnvironmentsUpdater(
          new GetEnvironmentsStateHelper(store),
          apiHelper
        )
      ),
    ])
  );
  const component = (
    <MemoryRouter>
      <DependencyProvider dependencies={{ ...dependencies, commandResolver }}>
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
    userEvent.click(input);
    userEvent.type(input, filterValue);
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
  userEvent.click(input);
  const option = await screen.findByRole("option", { name: "default" });
  await userEvent.click(option);
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
  userEvent.click(projectInput);
  const option = await screen.findByRole("option", { name: "default" });
  await userEvent.click(option);
  const nameInput = await screen.findByPlaceholderText("Filter by name");
  userEvent.click(nameInput);
  userEvent.type(nameInput, "test");
  expect(
    await screen.findByRole("article", {
      name: "Environment card",
    })
  ).toBeVisible();
});
