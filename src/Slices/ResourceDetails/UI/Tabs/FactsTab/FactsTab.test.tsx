import React from "react";
import { MemoryRouter } from "react-router";
import { render, screen } from "@testing-library/react";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import { getStoreInstance, QueryResolverImpl } from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DynamicQueryManagerResolverImpl,
  Resource,
  StaticScheduler,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { Mock } from "@S/Facts/Test";
import {
  GetResourceFactsQueryManager,
  GetResourceFactsStateHelper,
} from "@S/ResourceDetails/Data";
import { FactsTab } from "./FactsTab";
import { sortFactRows } from "./FactsTable";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const scheduler = new StaticScheduler();
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolverImpl([
      GetResourceFactsQueryManager(
        apiHelper,
        GetResourceFactsStateHelper(store),
        scheduler,
      ),
    ]),
  );

  const component = (
    <MemoryRouter>
      <DependencyProvider
        dependencies={{
          ...dependencies,
          queryResolver,
        }}
      >
        <StoreProvider store={store}>
          <FactsTab resourceId={Resource.id} />
        </StoreProvider>
      </DependencyProvider>
    </MemoryRouter>
  );

  return { component, apiHelper, scheduler };
}

test("Given the FactsTab When the backend response is an error Then shows failed view", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Facts-Loading" }),
  ).toBeInTheDocument();

  apiHelper.resolve(Either.left("error"));

  expect(
    await screen.findByRole("generic", { name: "Facts-Failed" }),
  ).toBeInTheDocument();
});

test("Given the FactsTab When the backend response is successful Then shows success table", async () => {
  const { component, apiHelper } = setup();
  render(component);

  expect(
    await screen.findByRole("generic", { name: "Facts-Loading" }),
  ).toBeInTheDocument();

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    environment: "env",
    url: `/api/v2/resource/${Resource.encodedId}/facts`,
    method: "GET",
  });

  apiHelper.resolve(Either.right(Mock.response));

  expect(
    await screen.findByRole("grid", { name: "Facts-Success" }),
  ).toBeInTheDocument();
});

test("Given sortFactRows When sorting by different columns Then the result is correct", async () => {
  const sortedByNameAsc = sortFactRows(Mock.response.data, "name", "asc");
  expect(sortedByNameAsc[0].name).toEqual("awsDevice");
  expect(sortedByNameAsc[sortedByNameAsc.length - 1].name).toEqual(
    "partnerName",
  );
  const sortedByNameDesc = sortFactRows(Mock.response.data, "name", "desc");
  expect(sortedByNameDesc[0].name).toEqual("partnerName");
  expect(sortedByNameDesc[sortedByNameDesc.length - 1].name).toEqual(
    "awsDevice",
  );

  const sortedByDateAsc = sortFactRows(Mock.response.data, "updated", "asc");
  expect(sortedByDateAsc[0].name).toEqual("jumboFrameCapable");
  expect(sortedByDateAsc[sortedByDateAsc.length - 1].name).toEqual("location");

  const sortedByDateDesc = sortFactRows(Mock.response.data, "updated", "desc");
  expect(sortedByDateDesc[0].name).toEqual("location");
  expect(sortedByDateDesc[sortedByDateDesc.length - 1].name).toEqual(
    "jumboFrameCapable",
  );

  const sortedByValueAsc = sortFactRows(Mock.response.data, "value", "asc");
  expect(sortedByValueAsc[0].value).toEqual("available");
  expect(sortedByValueAsc[sortedByValueAsc.length - 1].value).toEqual("no");

  const sortedByValueDesc = sortFactRows(Mock.response.data, "value", "desc");
  expect(sortedByValueDesc[0].value).toEqual("no");
  expect(sortedByValueDesc[sortedByValueDesc.length - 1].value).toEqual(
    "available",
  );

  const factsWithUndefinedDate = [
    ...Mock.response.data,
    { name: "no_date", updated: undefined, value: "yes", id: "123" },
  ];

  const sortedByDateWithUndefined = sortFactRows(
    factsWithUndefinedDate,
    "updated",
    "asc",
  );
  expect(sortedByDateWithUndefined[0].name).toEqual("no_date");
  expect(
    sortedByDateWithUndefined[sortedByDateWithUndefined.length - 1].name,
  ).toEqual("location");
});
