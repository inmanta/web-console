import React, { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider, DesiredStateDiff } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { View } from "./Page";
expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <View from="123" to="456" />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return { component };
}
describe("DesiredStateCompare", () => {
  let counterForFile123 = 0;
  let counterForFile567 = 0;
  const server = setupServer(
    http.get("/api/v2/desiredstate/diff/123/456", () => {
      return HttpResponse.json(DesiredStateDiff.response);
    }),
    http.get("/api/v1/file/a47be15ee60a88c7bcc4bce900d921a8d34d1234", () => {
      if (counterForFile123 === 1) {
        return HttpResponse.json({ message: "error" }, { status: 500 });
      }
      counterForFile123++;
      return HttpResponse.json({ content: window.btoa("abcdefgh") });
    }),
    http.get("/api/v1/file/a47be15ee60a88c7bcc4bce900d921a8d34d5678", () => {
      if (counterForFile567 === 1) {
        return HttpResponse.json({ message: "error" }, { status: 500 });
      }
      counterForFile567++;
      return HttpResponse.json({ content: window.btoa("efghijkl") });
    })
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
    expect(screen.queryByRole("menu", { name: "DiffSummaryList" })).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(
      screen.getByRole("menu", {
        name: "DiffSummaryList",
      })
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

    await userEvent.click(await screen.findByRole("button", { name: words("jumpTo") }));

    expect(screen.getAllByRole("menuitem", { name: "DiffSummaryListItem" })).toHaveLength(11);

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

    expect(screen.queryByRole("listbox", { name: "StatusFilterOptions" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "StatusFilter" }));

    expect(screen.getByRole("listbox", { name: "StatusFilterOptions" })).toBeVisible();

    const statusOptions = screen.getAllByRole("option");

    expect(statusOptions).toHaveLength(7);

    await userEvent.click(screen.getByRole("button", { name: words("showAll") }));

    await userEvent.click(screen.getByRole("button", { name: words("hideAll") }));

    await userEvent.click(statusOptions[0]);

    await userEvent.click(screen.getByRole("button", { name: words("jumpTo") }));

    expect(await screen.findAllByRole("menuitem", { name: "DiffSummaryListItem" })).toHaveLength(2);

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(2);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare WHEN File Resource THEN it shows prompt that can fetch file content", async () => {
    const { component } = setup();

    render(component);

    const blocks = await screen.findAllByTestId("DiffBlock");

    await userEvent.click(within(blocks[1]).getByLabelText("Details"));

    await userEvent.click(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.show"),
      })
    );

    await userEvent.click(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.hide"),
      })
    );

    expect(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.show"),
      })
    ).toBeVisible();

    await userEvent.click(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.show"),
      })
    );

    expect(await within(blocks[1]).findByRole("generic", { name: "ErrorDiffView" })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare page WHEN SearchFilter is used, ONLY show the resources matching the search value", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: words("jumpTo") }));

    expect(screen.getAllByRole("menuitem", { name: "DiffSummaryListItem" })).toHaveLength(11);

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

    await userEvent.type(screen.getByRole("searchbox", { name: "SearchFilter" }), "std");

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(1);

    await userEvent.type(screen.getByRole("searchbox", { name: "SearchFilter" }), "44554");

    expect(screen.queryAllByTestId("DiffBlock")).toHaveLength(0);

    await userEvent.clear(screen.getByRole("searchbox", { name: "SearchFilter" }));

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
