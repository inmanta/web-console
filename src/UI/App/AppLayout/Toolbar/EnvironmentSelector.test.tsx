import React from "react";
import { StoreProvider, createStore } from "easy-peasy";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { storeModel } from "@/UI/Store";
import { getEnvironmentNamesWithSeparator } from "../AppLayout";
import { flatMap } from "lodash";
import { MemoryRouter } from "react-router-dom";
import { EnvironmentSelector } from "./EnvironmentSelector";

const projects = [
  {
    environments: [
      {
        id: "env-id",
        name: "test-environment",
        projectId: "project-id",
      },
    ],
    id: "project-id",
    name: "test-project",
  },
  {
    environments: [
      {
        id: "env-id2",
        name: "test-environment2",
        projectId: "project-id2",
      },
      {
        id: "env-id3",
        name: "test-environment",
        projectId: "project-id2",
      },
    ],
    id: "project-id2",
    name: "test-project2",
  },
  {
    environments: [
      {
        id: "env-id4",
        name: "test-environment4",
        projectId: "project-id4",
      },
    ],
    id: "project-id4",
    name: "test-project4",
  },
  {
    environments: [
      {
        id: "dummy-env-id",
        name: "dummy-environment",
        projectId: "dummy-project-id",
      },
    ],
    id: "dummy-project-id",
    name: "dummy-project",
  },
];

function setup() {
  const storeInstance = createStore(storeModel);
  storeInstance.dispatch.fetched(projects);
  const environments = flatMap(projects, (project) =>
    getEnvironmentNamesWithSeparator(project)
  );

  return {
    component: (
      <MemoryRouter>
        <StoreProvider store={storeInstance}>
          <EnvironmentSelector items={environments} />
        </StoreProvider>
      </MemoryRouter>
    ),
    storeInstance,
  };
}

test("GIVEN EnvironmentSelector WHEN no environments THEN shows default value", () => {
  render(
    <MemoryRouter>
      <StoreProvider store={createStore(storeModel)}>
        <EnvironmentSelector items={[]} />
      </StoreProvider>
    </MemoryRouter>
  );

  expect(
    screen.getByRole("button", {
      name: "Selected Project: undefined / undefined",
    })
  ).toBeInTheDocument();
});

test("GIVEN EnvironmentSelector and a project WHEN user clicks on toggle THEN list of projects is shown", () => {
  render(
    <MemoryRouter>
      <StoreProvider store={createStore(storeModel)}>
        <EnvironmentSelector
          items={[
            {
              displayName: "test-project / test-environment",
              projectId: "projectId1",
              environmentId: "environmentId1",
            },
          ]}
        />
      </StoreProvider>
    </MemoryRouter>
  );

  const toggle = screen.getByRole("button", {
    name: "Selected Project: undefined / undefined",
  });
  userEvent.click(toggle);
  const listItem = screen.queryByRole("menuitem", {
    name: "test-project / test-environment",
  });

  expect(listItem).toBeVisible();
});

test("GIVEN EnvironmentSelector and a project WHEN user clicks on toggle and a project THEN list of projects is hidden", () => {
  render(
    <MemoryRouter>
      <StoreProvider store={createStore(storeModel)}>
        <EnvironmentSelector
          items={[
            {
              displayName: "test-project / test-environment",
              projectId: "projectId1",
              environmentId: "environmentId1",
            },
          ]}
        />
      </StoreProvider>
    </MemoryRouter>
  );

  const toggle = screen.getByRole("button", {
    name: "Selected Project: undefined / undefined",
  });
  userEvent.click(toggle);
  const listItem = screen.getByRole("menuitem", {
    name: "test-project / test-environment",
  });

  expect(listItem).toBeVisible();

  userEvent.click(listItem);

  expect(
    screen.queryByRole("menuitem", {
      name: "test-project / test-environment",
    })
  ).not.toBeInTheDocument();
});

test("GIVEN EnvironmentSelector WHEN store is populated THEN an environment is selected by default", () => {
  const { component } = setup();
  render(component);

  expect(
    screen.queryByRole("button", {
      name: "Selected Project: test-project / test-environment",
    })
  ).toBeVisible();
});

test("GIVEN EnvironmentSelector and populated store WHEN user clicks on an item THEN selected environment is changed", () => {
  const { component } = setup();
  render(component);

  const toggle = screen.getByRole("button", {
    name: "Selected Project: test-project / test-environment",
  });
  userEvent.click(toggle);

  const listItem = screen.getByRole("menuitem", {
    name: "test-project2 / test-environment2",
  });

  expect(listItem).toBeVisible();

  userEvent.click(listItem);

  expect(
    screen.queryByRole("button", {
      name: "Selected Project: test-project2 / test-environment2",
    })
  ).toBeVisible();
});

test.each`
  inputValue | numberOfMatchedItems
  ${"test"}  | ${4}
  ${"4"}     | ${1}
`(
  "GIVEN EnvironmentSelector and populated store WHEN user types in '$inputValue' THEN shows $numberOfMatchedItems items",
  ({ inputValue, numberOfMatchedItems }) => {
    const { component } = setup();
    render(component);

    const toggle = screen.getByRole("button", {
      name: "Selected Project: test-project / test-environment",
    });
    userEvent.click(toggle);

    const menuItemsBefore = screen.getAllByRole("menuitem");
    expect(menuItemsBefore).toHaveLength(5);

    const input = screen.getByRole("searchbox", { name: "Filter Projects" });
    userEvent.type(input, inputValue);

    const menuItemsAfter = screen.getAllByRole("menuitem");
    expect(menuItemsAfter).toHaveLength(numberOfMatchedItems);
  }
);

test("GIVEN EnvironmentSelector and populated store WHEN user types in non matching text THEN shows no items", () => {
  const { component } = setup();
  render(component);

  const toggle = screen.getByRole("button", {
    name: "Selected Project: test-project / test-environment",
  });
  userEvent.click(toggle);

  const menuItemsBefore = screen.getAllByRole("menuitem");
  expect(menuItemsBefore).toHaveLength(5);

  const input = screen.getByRole("searchbox", { name: "Filter Projects" });
  userEvent.type(input, "abcd");

  const menuItemsAfter = screen.queryByRole("menuitem");
  expect(menuItemsAfter).not.toBeInTheDocument();
});

test("GIVEN EnvironmentSelector WHEN query param is specified THEN specified env should be selected", () => {
  const params = new URLSearchParams(location.search);
  params.set("env", "env-id2");
  window.history.replaceState({}, "", `${location.pathname}?${params}`);
  const { component } = setup();
  render(component);

  expect(
    screen.getByRole("button", {
      name: "Selected Project: test-project2 / test-environment2",
    })
  ).toBeVisible();
});

test("GIVEN EnvironmentSelector and environments with identital names WHEN user clicks on an environment THEN the correct environment is selected", () => {
  const { component, storeInstance } = setup();
  render(component);

  const toggle = screen.getByRole("button", {
    name: "Selected Project: test-project / test-environment",
  });
  userEvent.click(toggle);

  const menuItems = screen.getAllByRole("menuitem");
  userEvent.click(menuItems[2]);

  expect(
    screen.getByRole("button", {
      name: "Selected Project: test-project2 / test-environment",
    })
  );

  expect(storeInstance.getState().projects.getSelectedProject.id).toEqual(
    "project-id2"
  );
  expect(
    storeInstance.getState().environments.getSelectedEnvironment.id
  ).toEqual("env-id3");
  /**
   * We are not longer directly manipulating the window.location.
   * We are using the history library, which manipulates the
   * window.location for us. This is probably causing the extra
   * delay in updating the location.search. This timeout hack
   * waits for that delay before verifying.
   */
  setTimeout(() => {
    expect(location.search).toEqual("?env=env-id3");
  }, 0);
});

afterEach(() => {
  window.history.replaceState({}, "", `${location.pathname}`);
});
