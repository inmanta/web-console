import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent, { specialChars } from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { EnvironmentsOverview } from "./EnvironmentsOverview";
import { Project } from "@/Test";

it.each`
  filterValue   | numberOfResults
  ${"test"}     | ${2}
  ${"dev-env2"} | ${1}
  ${"abcd"}     | ${0}
`(
  "Given the environment overview When filtering by name $filterValue Then $numberOfResults results should be rendered",
  async ({ filterValue, numberOfResults }) => {
    render(
      <MemoryRouter>
        <EnvironmentsOverview projects={Project.filterable} />
      </MemoryRouter>
    );
    const initialCards = await screen.findAllByRole("article", {
      name: "Environment card",
    });
    expect(initialCards).toHaveLength(4);
    const input = await screen.findByPlaceholderText("Filter by name");
    userEvent.click(input);
    userEvent.type(input, `${filterValue}${specialChars.enter}`);
    expect(
      screen.queryAllByRole("article", {
        name: "Environment card",
      })
    ).toHaveLength(numberOfResults);
  }
);

test("Given environments overview When filtering by project Then only the matching environments should be rendered", async () => {
  render(
    <MemoryRouter>
      <EnvironmentsOverview projects={Project.filterable} />
    </MemoryRouter>
  );
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

test("Given environments overview When filtering by multiple names Then the environments that match any of them should be rendered", async () => {
  render(
    <MemoryRouter>
      <EnvironmentsOverview projects={Project.filterable} />
    </MemoryRouter>
  );
  const initialCards = await screen.findAllByRole("article", {
    name: "Environment card",
  });
  expect(initialCards).toHaveLength(4);
  const nameInput = await screen.findByPlaceholderText("Filter by name");
  userEvent.click(nameInput);
  userEvent.type(nameInput, `test${specialChars.enter}`);
  userEvent.click(nameInput);
  userEvent.type(nameInput, `dev${specialChars.enter}`);
  expect(
    screen.queryAllByRole("article", {
      name: "Environment card",
    })
  ).toHaveLength(3);
});

test("Given environments overview When filtering by name and project Then only the environments that match both should be rendered", async () => {
  render(
    <MemoryRouter>
      <EnvironmentsOverview projects={Project.filterable} />
    </MemoryRouter>
  );
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
  userEvent.type(nameInput, `test${specialChars.enter}`);
  expect(
    await screen.findByRole("article", {
      name: "Environment card",
    })
  ).toBeVisible();
});
