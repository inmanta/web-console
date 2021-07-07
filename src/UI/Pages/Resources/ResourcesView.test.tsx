import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicQueryManagerResolver,
  Resource,
  StaticScheduler,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  getStoreInstance,
  ResourcesQueryManager,
  ResourcesStateHelper,
} from "@/Data";
import { ResourcesView } from "./ResourcesView";
import userEvent, { specialChars } from "@testing-library/user-event";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const apiHelper = new DeferredFetcher<"Resources">();
  const environment = "34a961ba-db3c-486e-8d85-1438d8e88909";
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourcesQueryManager(
        apiHelper,
        new ResourcesStateHelper(store, environment),
        scheduler,
        environment
      ),
    ])
  );

  const component = (
    <DependencyProvider dependencies={{ queryResolver }}>
      <StoreProvider store={store}>
        <ResourcesView />
      </StoreProvider>
    </DependencyProvider>
  );

  return { component, apiHelper, scheduler };
}

test("ResourcesView shows empty table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(
    Either.right({
      data: [],
      metadata: { total: 0, before: 0, after: 0, page_size: 10 },
      links: { self: "" },
    })
  );

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Empty" })
  ).toBeInTheDocument();
});

test("ResourcesView shows failed table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Failed" })
  ).toBeInTheDocument();
});

test("ResourcesView shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" })
  ).toBeInTheDocument();

  apiHelper.resolve(Either.right(Resource.response));

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" })
  ).toBeInTheDocument();
});

test("ResourcesView shows next page of resources", async () => {
  const { component, apiHelper } = setup();
  render(component);

  apiHelper.resolve(
    Either.right({
      data: Resource.response.data.slice(0, 3),
      links: { ...Resource.response.links, next: "/fake-link" },
      metadata: Resource.response.metadata,
    })
  );

  expect(
    await screen.findByRole("cell", {
      name: Resource.response.data[0].id_details.resource_id_value,
    })
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Next" }));

  apiHelper.resolve(
    Either.right({
      data: Resource.response.data.slice(3),
      links: { ...Resource.response.links, next: "/fake-link" },
      metadata: Resource.response.metadata,
    })
  );

  expect(
    await screen.findByRole("cell", {
      name: Resource.response.data[3].id_details.resource_id_value,
    })
  ).toBeInTheDocument();
});

test("ResourcesView shows sorting buttons for sortable columns", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(Resource.response));
  expect(await screen.findByRole("button", { name: /type/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /agent/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /value/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /Deploy state/i })).toBeVisible();
});

test("ResourcesView sets sorting parameters correctly on click", async () => {
  const { component, apiHelper } = setup();
  render(component);
  apiHelper.resolve(Either.right(Resource.response));
  const stateButton = await screen.findByRole("button", { name: /agent/i });
  expect(stateButton).toBeVisible();
  userEvent.click(stateButton);
  expect(apiHelper.getInvocations()[1][1]).toContain("&sort=agent.asc");
});

it.each`
  filterName  | filterType  | filterValue   | placeholderText               | filterUrlName
  ${"Status"} | ${"select"} | ${"deployed"} | ${"Select a Deploy State..."} | ${"status"}
  ${"Agent"}  | ${"search"} | ${"agent2"}   | ${"Search for an agent..."}   | ${"agent"}
  ${"Type"}   | ${"search"} | ${"File"}     | ${"Search for a type..."}     | ${"resource_type"}
  ${"Value"}  | ${"search"} | ${"tmp"}      | ${"Search for a value..."}    | ${"resource_id_value"}
`(
  "When using the $filterName filter of type $filterType with value $filterValue and text $placeholderText then the resources with that $filterUrlName should be fetched and shown",
  async ({
    filterName,
    filterType,
    filterValue,
    placeholderText,
    filterUrlName,
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

    userEvent.click(
      within(screen.getByRole("generic", { name: "FilterBar" })).getByRole(
        "button",
        { name: "Status" }
      )
    );
    userEvent.click(screen.getByRole("option", { name: filterName }));

    const input = await screen.findByPlaceholderText(placeholderText);
    userEvent.click(input);
    if (filterType === "select") {
      const option = await screen.findByRole("option", { name: filterValue });
      userEvent.click(option);
    } else {
      userEvent.type(input, `${filterValue}${specialChars.enter}`);
    }

    expect(apiHelper.getInvocations()[1][1]).toEqual(
      `/api/v2/resource?limit=20&filter.${filterUrlName}=${filterValue}&sort=resource_type.asc`
    );

    await act(async () => {
      await apiHelper.resolve(
        Either.right({
          data: Resource.response.data.slice(4),
          links: Resource.response.links,
          metadata: Resource.response.metadata,
        })
      );
    });

    const rowsAfter = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });
    expect(rowsAfter).toHaveLength(2);
  }
);
