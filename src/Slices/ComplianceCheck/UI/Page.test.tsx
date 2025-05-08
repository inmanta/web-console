import React, { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { delay, HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
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
  const datePresenter = new MomentDatePresenter();

  const component = (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <View version="123" />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  return { component, datePresenter };
}

describe("ComplianceCheck page", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test("GIVEN ComplianceCheck page THEN user sees latest dry run report", async () => {
    server.use(
      http.get("/api/v2/dryrun/123", () => {
        return HttpResponse.json(Mock.listResponse);
      }),
      http.get(`/api/v2/dryrun/123/${Mock.b.id}`, () => {
        return HttpResponse.json(Mock.reportResponse);
      })
    );
    const { component, datePresenter } = setup();

    render(component);

    const select = await screen.findByRole("button", { name: "ReportListSelect" });

    expect(select).toBeInTheDocument();
    expect(select).toHaveTextContent(datePresenter.getFull(Mock.listResponse.data[0].date));

    await userEvent.click(select);

    const options = screen.getAllByRole<HTMLButtonElement>("option");

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    const blocks = await screen.findAllByTestId("DiffBlock");

    expect(blocks).toHaveLength(11);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ComplianceCheck page When a report is selected from the list THEN the user sees the selected dry run report", async () => {
    server.use(
      http.get("/api/v2/dryrun/123", () => {
        return HttpResponse.json(Mock.listResponse);
      }),
      http.get(`/api/v2/dryrun/123/${Mock.b.id}`, () => {
        return HttpResponse.json(Mock.reportResponse);
      }),
      http.get(`/api/v2/dryrun/123/${Mock.c.id}`, () => {
        return HttpResponse.json(Mock.reportResponse);
      })
    );
    const { component } = setup();

    render(component);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
    // The first dryrun is selected by default

    // Also verify that the option shows the selected icon
    const select = screen.getByRole("button", { name: "ReportListSelect" });

    await userEvent.click(select);

    const options = screen.getAllByRole<HTMLButtonElement>("option");

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    // Select a different report
    await userEvent.click(options[1]);

    // Verify that it's selected
    await userEvent.click(select);

    expect(screen.getAllByRole<HTMLButtonElement>("option")[1]).toHaveAttribute(
      "aria-selected",
      "true"
    );
    // Go back to the first one
    await userEvent.click(screen.getAllByRole<HTMLButtonElement>("option")[0]);

    // Verify that it's selected
    await userEvent.click(select);

    expect(screen.getAllByRole<HTMLButtonElement>("option")[0]).toHaveAttribute(
      "aria-selected",
      "true"
    );

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ComplianceCheck page WHEN user clicks on 'Perform dry run' THEN new dry run is selected", async () => {
    let data = Mock.listResponse;
    server.use(
      http.get("/api/v2/dryrun/123", () => {
        return HttpResponse.json(data);
      }),
      http.get(`/api/v2/dryrun/123/${Mock.b.id}`, () => {
        return HttpResponse.json(Mock.reportResponse);
      }),
      http.post("/api/v2/dryrun/123", () => {
        data = { data: [Mock.a, ...Mock.listOfReports] };
        return HttpResponse.json(data);
      })
    );
    const { component, datePresenter } = setup();

    render(component);

    const dryRunButton = screen.getByRole("button", {
      name: words("desiredState.complianceCheck.action.dryRun"),
    });

    await userEvent.click(dryRunButton);

    await act(async () => {
      await delay(5000);
    });

    const select = await screen.findByRole("button", { name: "ReportListSelect" });

    expect(select).toBeInTheDocument();
    expect(select).toHaveTextContent(datePresenter.getFull(Mock.a.date));

    await userEvent.click(select);

    const options = screen.getAllByRole<HTMLButtonElement>("option");

    expect(options).toHaveLength(4);
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  test("GIVEN ComplianceCheck page WHEN StatusFilter = 'Added' THEN only 'Added' resources are shown", async () => {
    server.use(
      http.get("/api/v2/dryrun/123", () => {
        return HttpResponse.json(Mock.listResponse);
      }),
      http.get(`/api/v2/dryrun/123/${Mock.b.id}`, () => {
        return HttpResponse.json(Mock.reportResponse);
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: words("jumpTo") }));

    expect(screen.getAllByRole("menuitem", { name: "DiffSummaryListItem" })).toHaveLength(11);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

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

  test("GIVEN ComplianceCheck page WHEN SearchFilter is used, ONLY show the resources matching the search value", async () => {
    server.use(
      http.get("/api/v2/dryrun/123", () => {
        return HttpResponse.json(Mock.listResponse);
      }),
      http.get(`/api/v2/dryrun/123/${Mock.b.id}`, () => {
        return HttpResponse.json(Mock.reportResponse);
      })
    );
    const { component } = setup();

    render(component);

    await userEvent.click(await screen.findByRole("button", { name: words("jumpTo") }));

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    expect(screen.getAllByRole("menuitem", { name: "DiffSummaryListItem" })).toHaveLength(11);

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(11);

    await userEvent.type(screen.getByRole("searchbox", { name: "SearchFilter" }), "lsm");

    expect(await screen.findAllByTestId("DiffBlock")).toHaveLength(10);

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
