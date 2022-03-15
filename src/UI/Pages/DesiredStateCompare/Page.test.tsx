import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { act } from "react-dom/test-utils";
import { Either } from "@/Core";
import {
  FileFetcherImpl,
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
  const fileFetcher = new FileFetcherImpl(apiHelper);
  fileFetcher.setEnvironment("env");
  const component = (
    <DependencyProvider
      dependencies={{ ...dependencies, fileFetcher, queryResolver }}
    >
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

test("GIVEN DesiredStateCompare WHEN StatusFilter = 'Added' THEN only 'Added' resources are shown", async () => {
  const { apiHelper, component } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateDiff.response));
  });

  userEvent.click(screen.getByRole("button", { name: "Jump to" }));

  expect(
    screen.getAllByRole("listitem", { name: "DiffSummaryListItem" })
  ).toHaveLength(12);

  expect(
    await screen.findAllByRole("article", { name: "DiffBlock" })
  ).toHaveLength(12);

  expect(
    screen.queryByRole("listbox", { name: "StatusFilterOptions" })
  ).not.toBeInTheDocument();

  userEvent.click(screen.getByRole("button", { name: "StatusFilter" }));

  expect(
    screen.getByRole("listbox", { name: "StatusFilterOptions" })
  ).toBeVisible();

  const statusOptions = screen.getAllByRole("checkbox", {
    name: "StatusFilterOption",
  });
  expect(statusOptions).toHaveLength(7);
  userEvent.click(screen.getByRole("button", { name: "Hide All" }));
  userEvent.click(statusOptions[0]);

  userEvent.click(screen.getByRole("button", { name: "Jump to" }));
  expect(
    await screen.findAllByRole("listitem", { name: "DiffSummaryListItem" })
  ).toHaveLength(2);

  expect(
    await screen.findAllByRole("article", { name: "DiffBlock" })
  ).toHaveLength(2);
});

test("GIVEN DesiredStateCompare WHEN File Resource THEN it shows prompt that can fetch file content", async () => {
  const { apiHelper, component } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(DesiredStateDiff.response));
  });

  const blocks = screen.getAllByRole("article", { name: "DiffBlock" });
  userEvent.click(
    within(blocks[1]).getByRole("button", { name: "Show file contents" })
  );
  expect(apiHelper.pendingRequests).toEqual([
    {
      method: "GET",
      environment: "env",
      url: "/api/v1/file/a47be15ee60a88c7bcc4bce900d921a8d34d1234",
    },
    {
      method: "GET",
      environment: "env",
      url: "/api/v1/file/a47be15ee60a88c7bcc4bce900d921a8d34d5678",
    },
  ]);

  expect(
    within(blocks[1]).getByRole("button", { name: "Show file contents" })
  ).toBeDisabled();

  await act(async () => {
    await apiHelper.resolve(Either.right({ content: window.btoa("abcdefgh") }));
    await apiHelper.resolve(Either.right({ content: window.btoa("efghijkl") }));
  });

  userEvent.click(
    within(blocks[1]).getByRole("button", { name: "Hide file contents" })
  );

  expect(
    within(blocks[1]).getByRole("button", { name: "Show file contents" })
  ).toBeVisible();

  userEvent.click(
    within(blocks[1]).getByRole("button", { name: "Show file contents" })
  );

  await act(async () => {
    await apiHelper.resolve(Either.left("errormessage"));
    await apiHelper.resolve(Either.left("errormessage"));
  });

  expect(
    within(blocks[1]).getByRole("generic", { name: "ErrorDiffView" })
  ).toBeVisible();
});
