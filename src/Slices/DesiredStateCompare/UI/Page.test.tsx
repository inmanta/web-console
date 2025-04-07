import React, { act } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Either } from "@/Core";
import { FileFetcherImpl, getStoreInstance } from "@/Data";
import { DeferredApiHelper, dependencies, DesiredStateDiff } from "@/Test";
import { DependencyProvider, words } from "@/UI";
import { View } from "./Page";
expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const store = getStoreInstance();
  const apiHelper = new DeferredApiHelper();
  const fileFetcher = new FileFetcherImpl(apiHelper);

  fileFetcher.setEnvironment("env");

  const client = new QueryClient();

  const component = (
    <QueryClientProvider client={client}>
      <DependencyProvider dependencies={{ ...dependencies, fileFetcher }}>
        <StoreProvider store={store}>
          <View from="123" to="456" />
        </StoreProvider>
      </DependencyProvider>
    </QueryClientProvider>
  );

  return { component, apiHelper };
}
describe("DesiredStateCompare", () => {
  const server = setupServer(
    http.get("/api/v2/desiredstate/diff/123/456", () => {
      return HttpResponse.json(DesiredStateDiff.response);
    }),
  );

  beforeAll(() => {
    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  test("GIVEN DesiredStateCompare THEN shows list of diff blocks", async () => {
    const { component } = setup();

    render(component);

    const blocks = await screen.findAllByTestId("DiffBlock");

    expect(blocks).toHaveLength(11);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare THEN shows 'Jump To' action with dropdown", async () => {
    const { component } = setup();

    render(component);

    const button = await screen.findByRole("button", { name: words("jumpTo") });

    expect(button).toBeVisible();
    expect(
      screen.queryByRole("menu", { name: "DiffSummaryList" }),
    ).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(
      screen.getByRole("menu", {
        name: "DiffSummaryList",
      }),
    ).toBeVisible();
    const items = screen.getAllByRole("menuitem", {
      name: "DiffSummaryListItem",
    });

    expect(items).toHaveLength(11);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare WHEN StatusFilter = 'Added' THEN only 'Added' resources are shown", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(
      await screen.findByRole("button", { name: words("jumpTo") }),
    );

    expect(
      screen.getAllByRole("menuitem", { name: "DiffSummaryListItem" }),
    ).toHaveLength(11);

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

    expect(
      screen.queryByRole("listbox", { name: "StatusFilterOptions" }),
    ).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "StatusFilter" }));

    expect(
      screen.getByRole("listbox", { name: "StatusFilterOptions" }),
    ).toBeVisible();

    const statusOptions = screen.getAllByRole("option");

    expect(statusOptions).toHaveLength(7);

    await userEvent.click(
      screen.getByRole("button", { name: words("showAll") }),
    );

    await userEvent.click(
      screen.getByRole("button", { name: words("hideAll") }),
    );

    await userEvent.click(statusOptions[0]);

    await userEvent.click(
      screen.getByRole("button", { name: words("jumpTo") }),
    );

    expect(
      await screen.findAllByRole("menuitem", { name: "DiffSummaryListItem" }),
    ).toHaveLength(2);

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(2);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare WHEN File Resource THEN it shows prompt that can fetch file content", async () => {
    const { component, apiHelper } = setup();

    render(component);

    const blocks = await screen.findAllByTestId("DiffBlock");

    await userEvent.click(within(blocks[1]).getByLabelText("Details"));

    await userEvent.click(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.show"),
      }),
    );

    expect(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.show"),
      }),
    ).toBeDisabled();

    await act(async () => {
      await apiHelper.resolve(
        Either.right({ content: window.btoa("abcdefgh") }),
      );
      await apiHelper.resolve(
        Either.right({ content: window.btoa("efghijkl") }),
      );
    });

    await userEvent.click(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.hide"),
      }),
    );

    expect(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.show"),
      }),
    ).toBeVisible();

    await userEvent.click(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.show"),
      }),
    );

    await act(async () => {
      await apiHelper.resolve(Either.left("errormessage"));
      await apiHelper.resolve(Either.left("errormessage"));
    });

    expect(
      within(blocks[1]).getByRole("generic", { name: "ErrorDiffView" }),
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare page WHEN SearchFilter is used, ONLY show the resources matching the search value", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(
      await screen.findByRole("button", { name: words("jumpTo") }),
    );

    expect(
      screen.getAllByRole("menuitem", { name: "DiffSummaryListItem" }),
    ).toHaveLength(11);

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

    await userEvent.type(
      screen.getByRole("searchbox", { name: "SearchFilter" }),
      "std",
    );

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(1);

    await userEvent.type(
      screen.getByRole("searchbox", { name: "SearchFilter" }),
      "44554",
    );

    expect(screen.queryAllByTestId("DiffBlock")).toHaveLength(0);

    await userEvent.clear(
      screen.getByRole("searchbox", { name: "SearchFilter" }),
    );

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
