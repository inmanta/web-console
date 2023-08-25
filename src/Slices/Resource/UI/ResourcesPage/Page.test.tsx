import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either, RemoteData } from "@/Core";
import {
  QueryResolverImpl,
  getStoreInstance,
  CommandResolverImpl,
  KeycloakAuthHelper,
  QueryManagerResolver,
  CommandManagerResolver,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  EnvironmentDetails,
  MockEnvironmentHandler,
  Resource,
  StaticScheduler,
} from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { ResourceDetails } from "@S/ResourceDetails/Data/Mock";
import { Page } from "./Page";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler),
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper),
  );
  const environment = "34a961ba-db3c-486e-8d85-1438d8e88909";

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
          commandResolver,
          environmentHandler: MockEnvironmentHandler(environment),
        }}
      >
        <StoreProvider store={store}>
          <Page />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return {
    component,
    apiHelper,
    scheduler,
    environment,
    store,
    environmentModifier: dependencies.environmentModifier,
  };
}

test("ResourcesView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    apiHelper.resolve(
      Either.right({
        data: [],
        metadata: {
          total: 0,
          before: 0,
          after: 0,
          page_size: 10,
          deploy_summary: { total: 0, by_state: {} },
        },
        links: { self: "" },
      }),
    );
  });

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Empty" }),
  ).toBeInTheDocument();
});

test("ResourcesView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(Either.left("error"));
  });

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Failed" }),
  ).toBeInTheDocument();
});

test("ResourcesView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" }),
  ).toBeInTheDocument();
});

test("GIVEN ResourcesView WHEN user clicks on requires toggle THEN list of requires is shown", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  const rows = await screen.findAllByRole("row", {
    name: "Resource Table Row",
  });

  const toggle = within(rows[0]).getByRole("button", {
    name: "Toggle-" + Resource.response.data[0].resource_id,
  });
  await act(async () => {
    await userEvent.click(toggle);
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(ResourceDetails.response));
  });

  expect(
    await screen.findByRole("grid", { name: "ResourceRequires-Success" }),
  ).toBeVisible();
});

test("ResourcesView shows next page of resources", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: Resource.response.data.slice(0, 3),
        links: { ...Resource.response.links, next: "/fake-link" },
        metadata: Resource.response.metadata,
      }),
    );
  });

  expect(
    await screen.findByRole("cell", {
      name: Resource.response.data[0].id_details.resource_id_value,
    }),
  ).toBeInTheDocument();

  await act(async () => {
    await userEvent.click(screen.getAllByRole("button", { name: "Next" })[0]);
  });

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: Resource.response.data.slice(3),
        links: { ...Resource.response.links, next: "/fake-link" },
        metadata: Resource.response.metadata,
      }),
    );
  });

  expect(
    await screen.findByRole("cell", {
      name: Resource.response.data[3].id_details.resource_id_value,
    }),
  ).toBeInTheDocument();
});

test("ResourcesView shows sorting buttons for sortable columns", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  const table = await screen.findByRole("grid", {
    name: "ResourcesView-Success",
  });

  expect(table).toBeVisible();
  expect(within(table).getByRole("button", { name: "Type" })).toBeVisible();
  expect(within(table).getByRole("button", { name: "Agent" })).toBeVisible();
  expect(within(table).getByRole("button", { name: "Value" })).toBeVisible();
  expect(
    within(table).getByRole("button", {
      name: words("resources.column.deployState"),
    }),
  ).toBeVisible();
});

test("ResourcesView sets sorting parameters correctly on click", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  const stateButton = await screen.findByRole("button", { name: "Agent" });

  expect(stateButton).toBeVisible();
  await act(async () => {
    await userEvent.click(stateButton);
  });

  expect(apiHelper.pendingRequests[0].url).toContain("&sort=agent.asc");
});
it.each`
  filterType  | filterValue | placeholderText                                 | filterUrlName
  ${"search"} | ${"agent2"} | ${words("resources.filters.agent.placeholder")} | ${"agent"}
  ${"search"} | ${"File"}   | ${words("resources.filters.type.placeholder")}  | ${"resource_type"}
  ${"search"} | ${"tmp"}    | ${words("resources.filters.value.placeholder")} | ${"resource_id_value"}
`(
  "When using the $filterName filter of type $filterType with value $filterValue and text $placeholderText then the resources with that $filterUrlName should be fetched and shown",
  async ({ filterType, filterValue, placeholderText, filterUrlName }) => {
    const { component, apiHelper } = setup();
    render(component);

    await act(async () => {
      await apiHelper.resolve(Either.right(Resource.response));
    });

    const initialRows = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });
    expect(initialRows).toHaveLength(6);

    const input = await screen.findByPlaceholderText(placeholderText);
    await act(async () => {
      await userEvent.click(input);
    });

    if (filterType === "select") {
      const option = await screen.findByRole("option", { name: filterValue });
      await act(async () => {
        await userEvent.click(option);
      });
    } else {
      await act(async () => {
        await userEvent.type(input, `${filterValue}{enter}`);
      });
    }

    expect(apiHelper.pendingRequests[0].url).toContain(
      `filter.status=%21orphaned`,
    );
    expect(apiHelper.pendingRequests[0].url).toContain(
      `filter.${filterUrlName}=${filterValue}`,
    );
  },
);
it.each`
  filterValueOne | placeholderTextOne                              | filterUrlNameOne       | filterValueTwo | placeholderTextTwo                              | filterUrlNameTwo
  ${"agent2"}    | ${words("resources.filters.agent.placeholder")} | ${"agent"}             | ${"file3"}     | ${words("resources.filters.value.placeholder")} | ${"resource_id_value"}
  ${"Directory"} | ${words("resources.filters.type.placeholder")}  | ${"resource_type"}     | ${"agent2"}    | ${words("resources.filters.agent.placeholder")} | ${"agent"}
  ${"tmp"}       | ${words("resources.filters.value.placeholder")} | ${"resource_id_value"} | ${"File"}      | ${words("resources.filters.type.placeholder")}  | ${"resource_type"}
`(
  "when using the search filters of type $filterType with value $filterValueOne and text $placeholderTextOne combined with $filterType with value $filterValueTwo and text $placeholderText then the resources with that $filterUrlNameOne and $filterUrlNameTwo should be fetched and shown",
  async ({
    filterValueOne,
    placeholderTextOne,
    filterUrlNameOne,
    filterValueTwo,
    placeholderTextTwo,
    filterUrlNameTwo,
  }) => {
    const { component, apiHelper } = setup();
    render(component);

    await act(async () => {
      await apiHelper.resolve(Either.right(Resource.response));
    });

    const initialRows = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });

    expect(initialRows).toHaveLength(6);

    const inputOne = await screen.findByPlaceholderText(placeholderTextOne);
    await act(async () => {
      await userEvent.click(inputOne);
    });

    await act(async () => {
      await userEvent.type(inputOne, `${filterValueOne}`);
    });

    const inputTwo = await screen.findByPlaceholderText(placeholderTextTwo);
    await act(async () => {
      await userEvent.click(inputTwo);
    });

    await act(async () => {
      await userEvent.type(inputTwo, `${filterValueTwo}{enter}`);
    });

    expect(apiHelper.pendingRequests[0].url).toContain(
      `filter.status=%21orphaned`,
    );
    expect(apiHelper.pendingRequests[0].url).toContain(
      `filter.${filterUrlNameOne}=${filterValueOne}`,
    );

    expect(apiHelper.pendingRequests[0].url).toContain(
      `filter.${filterUrlNameTwo}=${filterValueTwo}`,
    );
  },
);
test("when using the all filters then the resources with that filter values should be fetched and shown", async () => {
  const filterValueOne = "agent";
  const filterUrlNameOne = "agent";
  const filterValueTwo = "Directory";
  const filterUrlNameTwo = "resource_type";
  const filterValueThree = "dir5";
  const filterUrlNameThree = "resource_id_value";
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Resource Table Row",
  });

  expect(initialRows).toHaveLength(6);

  const inputOne = await screen.findByPlaceholderText(
    words("resources.filters.agent.placeholder"),
  );
  await act(async () => {
    await userEvent.click(inputOne);
  });
  await act(async () => {
    await userEvent.type(inputOne, `${filterValueOne}`);
  });

  const inputTwo = await screen.findByPlaceholderText(
    words("resources.filters.type.placeholder"),
  );
  await act(async () => {
    await userEvent.click(inputTwo);
  });
  await act(async () => {
    await userEvent.type(inputTwo, `${filterValueTwo}`);
  });

  const inputThree = await screen.findByPlaceholderText(
    words("resources.filters.value.placeholder"),
  );
  await act(async () => {
    await userEvent.click(inputThree);
  });
  await act(async () => {
    await userEvent.type(inputThree, `${filterValueThree}{enter}`);
  });

  expect(apiHelper.pendingRequests[0].url).toContain(
    `filter.status=%21orphaned`,
  );
  expect(apiHelper.pendingRequests[0].url).toContain(
    `filter.${filterUrlNameOne}=${filterValueOne}`,
  );

  expect(apiHelper.pendingRequests[0].url).toContain(
    `filter.${filterUrlNameTwo}=${filterValueTwo}`,
  );
  expect(apiHelper.pendingRequests[0].url).toContain(
    `filter.${filterUrlNameThree}=${filterValueThree}`,
  );
});

test.each`
  filterValue      | option
  ${"deployed"}    | ${"include"}
  ${"unavailable"} | ${"exclude"}
`(
  "When using the Deploy state filter with value $filterValue and option $option then the matching resources should be fetched and shown",
  async ({ filterValue, option }) => {
    const { component, apiHelper } = setup();
    render(component);

    await act(async () => {
      await apiHelper.resolve(Either.right(Resource.response));
    });

    const initialRows = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });

    expect(initialRows).toHaveLength(6);

    const toolbar = await screen.findByRole("generic", {
      name: "Resources-toolbar",
    });

    const input = await within(toolbar).findByRole("button", {
      name: "Deploy State-toggle",
    });
    await act(async () => {
      await userEvent.click(input);
    });

    const toggle = await screen.findByRole("generic", {
      name: `${filterValue}-${option}-toggle`,
    });
    await act(async () => {
      await userEvent.click(toggle);
    });

    expect(apiHelper.pendingRequests[0].url).toEqual(
      `/api/v2/resource?deploy_summary=True&limit=20&filter.status=%21orphaned&filter.status=${
        option === "include" ? filterValue : `%21${filterValue}`
      }&sort=resource_type.asc`,
    );

    await act(async () => {
      await apiHelper.resolve(
        Either.right({
          data: Resource.response.data.slice(4),
          links: Resource.response.links,
          metadata: Resource.response.metadata,
        }),
      );
    });

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });

    expect(rowsAfter).toHaveLength(2);
  },
);

test("When clicking the clear and reset filters then the state filter is updated correctly", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/resource?deploy_summary=True&limit=20&filter.status=%21orphaned&sort=resource_type.asc`,
  );

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  const initialRows = await screen.findAllByRole("row", {
    name: "Resource Table Row",
  });

  expect(initialRows).toHaveLength(6);

  const clearButtons = await screen.findAllByText("Clear all filters");
  const visibleClearButton = clearButtons[clearButtons.length - 1];

  expect(visibleClearButton).toBeVisible();
  await act(async () => {
    await userEvent.click(visibleClearButton);
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/resource?deploy_summary=True&limit=20&&sort=resource_type.asc`,
  );

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        data: Resource.response.data.slice(4),
        links: Resource.response.links,
        metadata: Resource.response.metadata,
      }),
    );
  });
  await act(async () => {
    await userEvent.click(
      await screen.findByRole("button", { name: "Reset-filters" }),
    );
  });

  expect(apiHelper.pendingRequests[0].url).toEqual(
    `/api/v2/resource?deploy_summary=True&limit=20&filter.status=%21orphaned&sort=resource_type.asc`,
  );
});

test("ResourcesView shows deploy state bar", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("generic", {
      name: words("resources.deploySummary.title"),
    }),
  ).toBeInTheDocument();
});

test("GIVEN ResourcesView WHEN data is loading for next page THEN shows toolbar", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Resource.response,
        links: { ...Resource.response.links, next: "/fake-link" },
      }),
    );
  });

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("generic", {
      name: words("resources.deploySummary.title"),
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("generic", {
      name: "LegendItem-available",
    }),
  ).toHaveAttribute("data-value", "1");

  const nextButton = screen.getAllByRole("button", { name: "Next" })[0];

  expect(nextButton).toBeEnabled();

  await act(async () => {
    await userEvent.click(nextButton);
  });

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("generic", {
      name: words("resources.deploySummary.title"),
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: words("resources.deploySummary.repair"),
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: words("resources.deploySummary.deploy"),
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("generic", { name: "PaginationWidget" }),
  ).toBeVisible();

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Resource.response,
        metadata: {
          ...Resource.response.metadata,
          deploy_summary: {
            ...Resource.response.metadata.deploy_summary,
            by_state: {
              ...Resource.response.metadata.deploy_summary.by_state,
              available: 2,
            },
          },
        },
      }),
    );
  });

  expect(
    await screen.findByRole("generic", {
      name: "LegendItem-available",
    }),
  ).toHaveAttribute("data-value", "2");
});

test("GIVEN ResourcesView WHEN data is auto-updated THEN shows updated toolbar", async () => {
  const { component, apiHelper, scheduler } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" }),
  ).toBeInTheDocument();

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Resource.response,
        links: { ...Resource.response.links, next: "/fake-link" },
      }),
    );
  });

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("generic", {
      name: words("resources.deploySummary.title"),
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("generic", {
      name: "LegendItem-available",
    }),
  ).toHaveAttribute("data-value", "1");

  scheduler.executeAll();

  expect(
    screen.getByRole("generic", {
      name: words("resources.deploySummary.title"),
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: words("resources.deploySummary.repair"),
    }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", {
      name: words("resources.deploySummary.deploy"),
    }),
  ).toBeVisible();
  expect(
    screen.getAllByRole("generic", { name: "PaginationWidget" }),
  ).toHaveLength(2);

  await act(async () => {
    await apiHelper.resolve(
      Either.right({
        ...Resource.response,
        metadata: {
          ...Resource.response.metadata,
          deploy_summary: {
            ...Resource.response.metadata.deploy_summary,
            by_state: {
              ...Resource.response.metadata.deploy_summary.by_state,
              available: 2,
            },
          },
        },
      }),
    );
  });

  expect(
    await screen.findByRole("generic", {
      name: "LegendItem-available",
    }),
  ).toHaveAttribute("data-value", "2");
});

test("ResourcesView shows deploy state bar with available status without processing_events status", async () => {
  const { component, apiHelper } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  expect(
    await screen.findByRole("generic", {
      name: words("resources.deploySummary.title"),
    }),
  ).toBeInTheDocument();

  const availableItem = screen.getByRole("generic", {
    name: "LegendItem-available",
  });

  expect(availableItem).toBeVisible();
  expect(availableItem).toHaveAttribute("data-value", "1");
  expect(availableItem).not.toHaveAttribute("data-value", "3");
  expect(
    screen.getByRole("cell", { name: "Status-processing_events" }),
  ).toBeVisible();
});

test("Given the ResourcesView When clicking on deploy, then the approriate backend request is fired", async () => {
  const { component, apiHelper, environment } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    await userEvent.click(
      await screen.findByRole("button", {
        name: words("resources.deploySummary.deploy"),
      }),
    );
  });

  expect(
    await screen.findByRole("button", {
      name: words("resources.deploySummary.deploy"),
    }),
  ).toBeDisabled();

  expect(screen.getByTestId("dot-indication")).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "POST",
      url: "/api/v1/deploy",
      environment,
      body: {
        agent_trigger_method: "push_incremental_deploy",
      },
    },
  ]);
});

test("Given the ResourcesView When clicking on repair, then the approriate backend request is fired", async () => {
  const { component, apiHelper, environment } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" }),
  ).toBeInTheDocument();

  await act(async () => {
    await userEvent.click(
      await screen.findByRole("button", {
        name: words("resources.deploySummary.repair"),
      }),
    );
  });

  expect(
    await screen.findByRole("button", {
      name: words("resources.deploySummary.repair"),
    }),
  ).toBeDisabled();

  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "POST",
      url: "/api/v1/deploy",
      environment,
      body: {
        agent_trigger_method: "push_full_deploy",
      },
    },
  ]);
});

test("Given the ResourcesView When environment is halted, then deploy and repair buttons are disabled", async () => {
  const { component, apiHelper, environment, store, environmentModifier } =
    setup();
  environmentModifier.setEnvironment(environment);
  store.dispatch.environment.setEnvironmentDetailsById({
    id: environment,
    value: RemoteData.success(EnvironmentDetails.halted),
  });

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Resource.response));
  });

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" }),
  ).toBeInTheDocument();

  expect(
    await screen.findByRole("button", {
      name: words("resources.deploySummary.repair"),
    }),
  ).toBeDisabled();
  expect(
    await screen.findByRole("button", {
      name: words("resources.deploySummary.deploy"),
    }),
  ).toBeDisabled();
});
