import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import {
  DeferredFetcher,
  DynamicQueryManagerResolver,
  Resource,
  ResourceDetails,
  StaticScheduler,
} from "@/Test";
import { Either } from "@/Core";
import { DependencyProvider } from "@/UI/Dependency";
import {
  QueryResolverImpl,
  getStoreInstance,
  ResourcesQueryManager,
  ResourcesStateHelper,
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
} from "@/Data";
import { ResourcesView } from "./ResourcesView";
import userEvent, { specialChars } from "@testing-library/user-event";
import { UrlManagerImpl } from "@/UI/Utils";
import { MemoryRouter } from "react-router-dom";

function setup() {
  const store = getStoreInstance();
  const scheduler = new StaticScheduler();
  const resourcesApiHelper = new DeferredFetcher<"Resources">();
  const resourceDetailsFetcher = new DeferredFetcher<"ResourceDetails">();
  const environment = "34a961ba-db3c-486e-8d85-1438d8e88909";
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([
      new ResourcesQueryManager(
        resourcesApiHelper,
        new ResourcesStateHelper(store, environment),
        scheduler,
        environment
      ),
      new ResourceDetailsQueryManager(
        resourceDetailsFetcher,
        new ResourceDetailsStateHelper(store),
        scheduler,
        environment
      ),
    ])
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          queryResolver,
          urlManager: new UrlManagerImpl("", environment),
        }}
      >
        <StoreProvider store={store}>
          <ResourcesView />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, resourcesApiHelper, scheduler, resourceDetailsFetcher };
}

test("ResourcesView shows empty table", async () => {
  const { component, resourcesApiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" })
  ).toBeInTheDocument();

  resourcesApiHelper.resolve(
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
  const { component, resourcesApiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" })
  ).toBeInTheDocument();

  resourcesApiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Failed" })
  ).toBeInTheDocument();
});

test("ResourcesView shows success table", async () => {
  const { component, resourcesApiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "ResourcesView-Loading" })
  ).toBeInTheDocument();

  resourcesApiHelper.resolve(Either.right(Resource.response));

  expect(
    await screen.findByRole("grid", { name: "ResourcesView-Success" })
  ).toBeInTheDocument();
});

test("ResourcesView shows next page of resources", async () => {
  const { component, resourcesApiHelper } = setup();
  render(component);

  resourcesApiHelper.resolve(
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

  resourcesApiHelper.resolve(
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
  const { component, resourcesApiHelper } = setup();
  render(component);
  resourcesApiHelper.resolve(Either.right(Resource.response));
  expect(await screen.findByRole("button", { name: /type/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /agent/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /value/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /Deploy state/i })).toBeVisible();
});

test("ResourcesView sets sorting parameters correctly on click", async () => {
  const { component, resourcesApiHelper } = setup();
  render(component);
  resourcesApiHelper.resolve(Either.right(Resource.response));
  const stateButton = await screen.findByRole("button", { name: /agent/i });
  expect(stateButton).toBeVisible();
  userEvent.click(stateButton);
  expect(resourcesApiHelper.getInvocations()[1][1]).toContain(
    "&sort=agent.asc"
  );
});

it.each`
  filterType  | filterValue   | placeholderText      | filterUrlName
  ${"select"} | ${"deployed"} | ${"Deploy State..."} | ${"status"}
  ${"search"} | ${"agent2"}   | ${"Agent..."}        | ${"agent"}
  ${"search"} | ${"File"}     | ${"Type..."}         | ${"resource_type"}
  ${"search"} | ${"tmp"}      | ${"Value..."}        | ${"resource_id_value"}
`(
  "When using the $filterName filter of type $filterType with value $filterValue and text $placeholderText then the resources with that $filterUrlName should be fetched and shown",
  async ({ filterType, filterValue, placeholderText, filterUrlName }) => {
    const { component, resourcesApiHelper } = setup();
    render(component);

    await act(async () => {
      await resourcesApiHelper.resolve(Either.right(Resource.response));
    });

    const initialRows = await screen.findAllByRole("row", {
      name: "Resource Table Row",
    });
    expect(initialRows).toHaveLength(6);

    const input = await screen.findByPlaceholderText(placeholderText);
    userEvent.click(input);
    if (filterType === "select") {
      const option = await screen.findByRole("option", { name: filterValue });
      userEvent.click(option);
    } else {
      userEvent.type(input, `${filterValue}${specialChars.enter}`);
    }

    expect(resourcesApiHelper.getInvocations()[1][1]).toEqual(
      `/api/v2/resource?limit=20&filter.${filterUrlName}=${filterValue}&sort=resource_type.asc`
    );

    await act(async () => {
      await resourcesApiHelper.resolve(
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

test("GIVEN The Resources table WHEN the user clicks on the details THEN data is fetched immediately", async () => {
  const { component, resourcesApiHelper, resourceDetailsFetcher } = setup();

  render(component);

  await act(async () => {
    await resourcesApiHelper.resolve(Either.right(Resource.response));
  });

  userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);

  expect(resourceDetailsFetcher.getInvocations()).toHaveLength(1);
  expect(resourceDetailsFetcher.getInvocations()[0][1]).toEqual(
    "/api/v2/resource/std%3A%3AFile%5Bagent2%2Cpath%3D%2Ftmp%2Ffile4%5D"
  );

  await act(async () => {
    await resourceDetailsFetcher.resolve(
      Either.right({ data: ResourceDetails.a })
    );
  });

  expect(
    await screen.findByText("std::File[agent2,path=/tmp/file4]")
  ).toBeVisible();
});

test("GIVEN The Resources table WHEN the user clicks on the requires tab THEN the requires table is shown", async () => {
  const { component, resourcesApiHelper, resourceDetailsFetcher } = setup();

  render(component);

  await act(async () => {
    await resourcesApiHelper.resolve(Either.right(Resource.response));
  });

  userEvent.click(screen.getAllByRole("button", { name: "Details" })[0]);
  userEvent.click(screen.getAllByRole("button", { name: "Requires" })[0]);

  expect(resourceDetailsFetcher.getInvocations()).toHaveLength(2);
  expect(resourceDetailsFetcher.getInvocations()[1][1]).toEqual(
    "/api/v2/resource/std%3A%3AFile%5Bagent2%2Cpath%3D%2Ftmp%2Ffile4%5D"
  );

  await act(async () => {
    await resourceDetailsFetcher.resolve(
      Either.right({ data: ResourceDetails.a })
    );
  });

  expect(
    await screen.findByRole("grid", { name: "ResourceRequires-Success" })
  ).toBeVisible();
});
