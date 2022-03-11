import React from "react";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { Either } from "@/Core";
import {
  CommandManagerResolver,
  CommandResolverImpl,
  getStoreInstance,
  KeycloakAuthHelper,
  QueryManagerResolver,
  QueryResolverImpl,
} from "@/Data";
import {
  DeferredApiHelper,
  dependencies,
  StaticScheduler,
  DryRun,
} from "@/Test";
import { DependencyProvider } from "@/UI/Dependency";
import { MomentDatePresenter } from "@/UI/Utils";
import { View } from "./Page";

function setup() {
  const apiHelper = new DeferredApiHelper();
  const authHelper = new KeycloakAuthHelper();
  const scheduler = new StaticScheduler();
  const store = getStoreInstance();
  const datePresenter = new MomentDatePresenter();
  const queryResolver = new QueryResolverImpl(
    new QueryManagerResolver(store, apiHelper, scheduler, scheduler)
  );
  const commandResolver = new CommandResolverImpl(
    new CommandManagerResolver(store, apiHelper, authHelper)
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
    await apiHelper.resolve(Either.right(DryRun.listResponse));
  });

  const select = screen.getByRole("button", { name: "ReportListSelect" });
  expect(select).toBeInTheDocument();
  expect(select).toHaveTextContent(
    datePresenter.getFull(DryRun.listResponse.data[0].date)
  );

  userEvent.click(select);
  const dropdown = screen.getByRole("listbox", { name: "ReportList" });
  const options = within(dropdown).getAllByRole<HTMLButtonElement>("option");
  expect(options).toHaveLength(3);
  expect(options[0]).toHaveAttribute("aria-selected", "true");

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v2/dryrun/123/${DryRun.b.id}`,
    environment: "env",
  });
  await act(async () => {
    await apiHelper.resolve(Either.right(DryRun.reportResponse));
  });

  const blocks = await screen.findAllByRole("article", { name: "DiffBlock" });
  expect(blocks).toHaveLength(12);
});

test("GIVEN ComplianceCheck page WHEN user clicks on 'Perform dry run' THEN new dry run is selected", async () => {
  const { component, apiHelper, datePresenter } = setup();
  render(component);

  await act(async () => {
    await apiHelper.resolve(Either.right(DryRun.listResponse));
  });

  await act(async () => {
    await apiHelper.resolve(Either.right(DryRun.reportResponse));
  });

  const dryRunButton = screen.getByRole("button", { name: "Perform dry run" });
  userEvent.click(dryRunButton);

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
      Either.right({ data: [DryRun.a, ...DryRun.listOfReports] })
    );
  });

  const select = screen.getByRole("button", { name: "ReportListSelect" });
  expect(select).toBeInTheDocument();
  expect(select).toHaveTextContent(datePresenter.getFull(DryRun.a.date));

  userEvent.click(select);
  const dropdown = screen.getByRole("listbox", { name: "ReportList" });
  const options = within(dropdown).getAllByRole<HTMLButtonElement>("option");
  expect(options).toHaveLength(4);
  expect(options[0]).toHaveAttribute("aria-selected", "true");

  expect(apiHelper.pendingRequests).toHaveLength(1);
  expect(apiHelper.pendingRequests[0]).toEqual({
    method: "GET",
    url: `/api/v2/dryrun/123/${DryRun.a.id}`,
    environment: "env",
  });
});
