import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { Either } from "@/Core";
import {
  GetDesiredStateDiffQueryManager,
  GetDesiredStateDiffStateHelper,
  getStoreInstance,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  DesiredStateDiff,
  DynamicQueryManagerResolver,
} from "@/Test";
import { DependencyProvider } from "@/UI";
import { View } from "./Page";

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const queryManager = new GetDesiredStateDiffQueryManager(
    apiHelper,
    new GetDesiredStateDiffStateHelper(store)
  );
  const queryResolver = new QueryResolverImpl(
    new DynamicQueryManagerResolver([queryManager])
  );
  const component = (
    <DependencyProvider dependencies={{ ...dependencies, queryResolver }}>
      <StoreProvider store={store}>
        <View from="123" to="456" />
      </StoreProvider>
    </DependencyProvider>
  );
  return { apiHelper, component };
}

test("GIVEN DesiredStateCompare THEN shows list of diff blocks", async () => {
  const { apiHelper, component } = setup();
  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/desiredstate/diff/123/456",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateDiff.response));
  });

  const blocks = await screen.findAllByRole("article", { name: "DiffBlock" });
  expect(blocks).toHaveLength(12);
});

test("GIVEN DesiredStateCompare THEN shows 'Jump To' action with dropdown", async () => {
  const { apiHelper, component } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateDiff.response));
  });

  const button = screen.getByRole("button", { name: "Jump to" });
  expect(button).toBeVisible();
  expect(
    screen.queryByRole("generic", { name: "DiffSummaryList" })
  ).not.toBeInTheDocument();
  userEvent.click(button);
  expect(
    screen.getByRole("generic", {
      name: "DiffSummaryList",
    })
  ).toBeVisible();
  const items = screen.getAllByRole("listitem", {
    name: "DiffSummaryListItem",
  });
  expect(items).toHaveLength(12);
});
