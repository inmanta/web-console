import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { Either } from "@/Core";
import {
  CommandManagerResolverImpl,
  CommandResolverImpl,
  defaultAuthContext,
  getStoreInstance,
  QueryManagerResolverImpl,
  QueryResolverImpl,
} from "@/Data";
import { DeferredApiHelper, dependencies, StaticScheduler } from "@/Test";
import { words } from "@/UI";
import { DependencyProvider } from "@/UI/Dependency";
import { MomentDatePresenter } from "@/UI/Utils";
import * as Mock from "@S/ComplianceCheck/Data/Mock";
import { View } from "./Page";
expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const apiHelper = new DeferredApiHelper();

  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const datePresenter = new MomentDatePresenter();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolverImpl(store, apiHelper, scheduler, scheduler),
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolverImpl(store, apiHelper, defaultAuthContext),
  );
  const component = (
    <StoreProvider store={store}>
      <DependencyProvider
        dependencies={{ ...dependencies, queryResolver, commandResolver }}
      >
        <View version="123" />
      </DependencyProvider>
    </StoreProvider>
  );

  return { component, apiHelper, datePresenter };
}

test("GIVEN ComplianceCheck page THEN user sees latest dry run report", async () => {
  const { component, apiHelper, datePresenter } = setup();

  render(component);

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/dryrun/123",
    environment: "env",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.listResponse));
  });

  const select = screen.getByRole("button", { name: "ReportListSelect" });

  expect(select).toBeInTheDocument();
  expect(select).toHaveTextContent(
    datePresenter.getFull(Mock.listResponse.data[0].date),
  );

  await act(async () => {
    await userEvent.click(select);
  });

  const options = screen.getAllByRole<HTMLButtonElement>("option");

  expect(options).toHaveLength(3);
  expect(options[0]).toHaveAttribute("aria-selected", "true");

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v2/dryrun/123/${Mock.b.id}`,
    environment: "env",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.reportResponse));
  });

  const blocks = await screen.findAllByTestId("DiffBlock");

  expect(blocks).toHaveLength(11);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN ComplianceCheck page When a report is selected from the list THEN the user sees the selected dry run report", async () => {
  const { component, apiHelper } = setup();

  render(component);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.listResponse));
  });
  // The first dryrun is selected by default
  // Verify the request
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v2/dryrun/123/${Mock.b.id}`,
    environment: "env",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.reportResponse));
  });

  // Also verify that the option shows the selected icon
  const select = screen.getByRole("button", { name: "ReportListSelect" });

  await act(async () => {
    await userEvent.click(select);
  });

  const options = screen.getAllByRole<HTMLButtonElement>("option");

  expect(options).toHaveLength(3);
  expect(options[0]).toHaveAttribute("aria-selected", "true");

  // Select a different report
  await act(async () => {
    await userEvent.click(options[1]);
  });
  // Verify the request
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v2/dryrun/123/${Mock.c.id}`,
    environment: "env",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.reportResponse));
  });
  // Verify that it's selected
  await act(async () => {
    await userEvent.click(select);
  });

  expect(screen.getAllByRole<HTMLButtonElement>("option")[1]).toHaveAttribute(
    "aria-selected",
    "true",
  );
  // Go back to the first one
  await act(async () => {
    await userEvent.click(screen.getAllByRole<HTMLButtonElement>("option")[0]);
  });
  // Verify the request
  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v2/dryrun/123/${Mock.b.id}`,
    environment: "env",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.reportResponse));
  });
  // Verify that it's selected
  await act(async () => {
    await userEvent.click(select);
  });

  expect(screen.getAllByRole<HTMLButtonElement>("option")[0]).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN ComplianceCheck page WHEN user clicks on 'Perform dry run' THEN new dry run is selected", async () => {
  const { component, apiHelper, datePresenter } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.listResponse));
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.reportResponse));
  });

  const dryRunButton = screen.getByRole("button", {
    name: words("desiredState.complianceCheck.action.dryRun"),
  });

  await act(async () => {
    await userEvent.click(dryRunButton);
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "POST",
    url: "/api/v2/dryrun/123",
    environment: "env",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right({}));
  });

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: "/api/v2/dryrun/123",
    environment: "env",
  });

  await act(async () => {
    await apiHelper.resolve(
      Either.right({ data: [Mock.a, ...Mock.listOfReports] }),
    );
  });

  const select = screen.getByRole("button", { name: "ReportListSelect" });

  expect(select).toBeInTheDocument();
  expect(select).toHaveTextContent(datePresenter.getFull(Mock.a.date));

  await act(async () => {
    await userEvent.click(select);
  });

  const options = screen.getAllByRole<HTMLButtonElement>("option");

  expect(options).toHaveLength(4);
  expect(options[0]).toHaveAttribute("aria-selected", "true");

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v2/dryrun/123/${Mock.a.id}`,
    environment: "env",
  });
});

test("GIVEN ComplianceCheck page WHEN StatusFilter = 'Added' THEN only 'Added' resources are shown", async () => {
  const { apiHelper, component } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.listResponse));
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.reportResponse));
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: words("jumpTo") }),
    );
  });

  expect(
    screen.getAllByRole("listitem", { name: "DiffSummaryListItem" }),
  ).toHaveLength(11);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

  expect(
    screen.queryByRole("listbox", { name: "StatusFilterOptions" }),
  ).not.toBeInTheDocument();

  await act(async () => {
    await userEvent.click(screen.getByRole("button", { name: "StatusFilter" }));
  });

  expect(
    screen.getByRole("listbox", { name: "StatusFilterOptions" }),
  ).toBeVisible();

  const statusOptions = screen.getAllByRole("option");

  expect(statusOptions).toHaveLength(7);
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: words("showAll") }),
    );
  });
  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: words("hideAll") }),
    );
  });
  await act(async () => {
    await userEvent.click(statusOptions[0]);
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: words("jumpTo") }),
    );
  });
  expect(
    await screen.findAllByRole("listitem", { name: "DiffSummaryListItem" }),
  ).toHaveLength(2);

  expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(2);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});

test("GIVEN ComplianceCheck page WHEN SearchFilter is used, ONLY show the resources matching the search value", async () => {
  const { apiHelper, component } = setup();

  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.listResponse));
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(Mock.reportResponse));
  });

  await act(async () => {
    await userEvent.click(
      screen.getByRole("button", { name: words("jumpTo") }),
    );
  });

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });

  expect(
    screen.getAllByRole("listitem", { name: "DiffSummaryListItem" }),
  ).toHaveLength(11);

  expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

  await act(async () => {
    await userEvent.type(
      screen.getByRole("searchbox", { name: "SearchFilter" }),
      "lsm",
    );
  });

  expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(10);

  await act(async () => {
    await userEvent.type(
      screen.getByRole("searchbox", { name: "SearchFilter" }),
      "44554",
    );
  });

  expect(screen.queryAllByTestId("DiffBlock")).toHaveLength(0);

  await act(async () => {
    await userEvent.clear(
      screen.getByRole("searchbox", { name: "SearchFilter" }),
    );
  });

  expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

  await act(async () => {
    const results = await axe(document.body);

    expect(results).toHaveNoViolations();
  });
});
