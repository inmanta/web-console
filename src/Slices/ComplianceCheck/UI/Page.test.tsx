import { act, useState } from "react";
import { useLocation } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { DryRun } from "@/Core";
import { EnvironmentDetails, MockedDependencyProvider, ServiceInstance } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { CustomDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import * as Mock from "@S/ComplianceCheck/Data/Mock";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import * as DesiredStateMock from "@S/DesiredState/Data/Mock";
import {
  countDiff,
  createFilterRows,
  createStatusValues,
  formatScopeLabel,
  getReportInstanceLabels,
} from "./Components/ReportScope/helpers";
import { View } from "./Page";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const environment = "aaa";

/**
 * The desired state lookup of the model version the mock reports ran on, with the given status.
 */
const modelVersionResponse = (status: DesiredStateVersionStatus) => ({
  data: [{ ...DesiredStateMock.response.data[0], version: Number(Mock.b.model), status }],
});

/**
 * The page with a button that leaves it, and the current search, to check what happens after the
 * page is left.
 */
const LeavablePage: React.FC = () => {
  const [isShown, setIsShown] = useState(true);
  const { search } = useLocation();

  return (
    <>
      <div data-testid="search">{search}</div>
      <button onClick={() => setIsShown(false)}>Leave</button>
      {isShown && <View version="123" />}
    </>
  );
};

function setup(search = "", env = EnvironmentDetails.env, page = <View version="123" />) {
  const datePresenter = new CustomDatePresenter();

  const component = (
    <TestMemoryRouter initialEntries={[`/?env=${environment}${search}`]}>
      <QueryClientProvider client={testClient}>
        <MockedDependencyProvider env={env}>
          <ModalProvider>{page}</ModalProvider>
        </MockedDependencyProvider>
      </QueryClientProvider>
    </TestMemoryRouter>
  );

  return { component, datePresenter };
}

describe("ComplianceCheck page", () => {
  const server = setupServer(
    http.get("/api/v2/dryrun/123", () => {
      return HttpResponse.json(Mock.listResponse);
    }),
    http.get("/api/v2/desiredstate", () =>
      HttpResponse.json(modelVersionResponse(DesiredStateVersionStatus.active))
    ),
    http.get(`/api/v2/dryrun/123/${Mock.a.id}`, () => {
      return HttpResponse.json(Mock.reportResponse);
    }),
    http.get(`/api/v2/dryrun/123/${Mock.b.id}`, () => {
      return HttpResponse.json({ summary: Mock.b, ...Mock.reportResponse });
    }),
    http.get(`/api/v2/dryrun/123/${Mock.c.id}`, () => {
      return HttpResponse.json({ summary: Mock.c, ...Mock.reportResponse });
    })
  );

  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    testClient.clear();
  });
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

  test("GIVEN ComplianceCheck page THEN each dry run entry links to its resource details page", async () => {
    const { component } = setup();

    render(component);

    await screen.findAllByTestId("DiffBlock");

    const resourceId = Mock.reportResponse.data.diff[0].resource_id;
    const link = screen.getByRole("link", { name: resourceId });
    const href = link.getAttribute("href") ?? "";

    // The link points at the resource details page for this resource, keeping the environment.
    expect(href).toMatch(/^\/resources\//);
    expect(decodeURIComponent(href)).toContain(resourceId);
    expect(href).toContain(`env=${environment}`);
  });

  test("GIVEN ComplianceCheck page When a report is selected from the list THEN the user sees the selected dry run report", async () => {
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
      http.post("/api/v2/dryrun/123", () => {
        data = { data: [Mock.a, ...Mock.listOfReports] };

        return HttpResponse.json({ data: Mock.a.id });
      })
    );
    // Starts on an older report, to check that the new one replaces it.
    const { component, datePresenter } = setup(`&state.ComplianceCheck.report=${Mock.c.id}`);

    render(component);

    const select = await screen.findByRole("button", { name: "ReportListSelect" });

    await waitFor(() => expect(select).toHaveTextContent(datePresenter.getFull(Mock.c.date)));

    await userEvent.click(
      screen.getByRole("button", { name: words("desiredState.complianceCheck.action.dryRun") })
    );

    await waitFor(() => expect(select).toHaveTextContent(datePresenter.getFull(Mock.a.date)));

    await userEvent.click(select);

    const options = screen.getAllByRole<HTMLButtonElement>("option");

    expect(options).toHaveLength(4);
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  test("GIVEN a dry run was started WHEN the page is left before it is done THEN it doesn't navigate back", async () => {
    let startDryRun = () => {};
    const isDryRunStarted = new Promise<void>((resolve) => (startDryRun = resolve));

    server.use(
      http.post("/api/v2/dryrun/123", async () => {
        await isDryRunStarted;

        return HttpResponse.json({ data: Mock.a.id });
      })
    );
    const { component } = setup("", EnvironmentDetails.env, <LeavablePage />);

    render(component);

    await userEvent.click(
      await screen.findByRole("button", {
        name: words("desiredState.complianceCheck.action.dryRun"),
      })
    );
    await userEvent.click(screen.getByRole("button", { name: "Leave" }));
    startDryRun();

    await waitFor(() => expect(testClient.isMutating()).toBe(0));
    // Selecting the report once the dry run is done would set it in the URL, and so navigate back.
    expect(screen.getByTestId("search")).not.toHaveTextContent("report");
  });

  test("GIVEN ComplianceCheck page WHEN StatusFilter = 'Added' THEN only 'Added' resources are shown", async () => {
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

    expect(await screen.findByRole("listbox", { name: "StatusFilterOptions" })).toBeVisible();

    const statusOptions = screen.getAllByRole("option");

    expect(statusOptions).toHaveLength(6);

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

  describe("Report scope", () => {
    const diff = Mock.reportResponse.data.diff;
    const instance = ServiceInstance.a;

    const findScope = () =>
      screen.findByRole("region", { name: words("desiredState.complianceCheck.scope.title") });

    let instanceRequests: URL[] = [];

    beforeEach(() => {
      instanceRequests = [];
      server.use(
        http.get("/lsm/v1/service_inventory*", ({ request }) => {
          instanceRequests.push(new URL(request.url));

          return HttpResponse.json({ data: [instance] });
        })
      );
    });

    test("GIVEN reports started on a resource filter THEN the picker summarizes each scope", async () => {
      const { component } = setup();

      render(component);

      await userEvent.click(await screen.findByRole("button", { name: "ReportListSelect" }));

      // Instances show by the labels stored with each report. The scope labels themselves and
      // getReportInstanceLabels are tested in helpers.test.ts; this checks that each option shows
      // its own.
      const scopeLabels = Mock.listOfReports.map((report) =>
        formatScopeLabel(
          createFilterRows(report.resource_filter ?? {}, getReportInstanceLabels(report)),
          createStatusValues(report.resource_filter ?? {})
        )
      );
      const options = screen.getAllByRole("option");

      expect(
        scopeLabels.some((scopeLabel) => scopeLabel.includes(Mock.filteredInstanceLabel))
      ).toBe(true);
      scopeLabels.forEach((scopeLabel, index) =>
        expect(options[index]).toHaveTextContent(scopeLabel)
      );
      expect(instanceRequests).toHaveLength(0);
    });

    test("GIVEN a report started without instance labels THEN its instance shows by id", async () => {
      server.use(
        http.get("/api/v2/dryrun/123", () =>
          HttpResponse.json({
            data: [
              { ...Mock.b, resource_filter: { serviceInstance: [instance.id] }, context: null },
            ],
          })
        )
      );
      const { component } = setup();

      render(component);

      const picker = await screen.findByRole("button", { name: "ReportListSelect" });

      await waitFor(() => expect(picker).toHaveTextContent(instance.id));
      expect(instanceRequests).toHaveLength(0);
    });

    test("GIVEN a report started on a resource filter THEN the scope band shows what it covered", async () => {
      const { component } = setup();

      render(component);

      const scope = await findScope();
      const modelVersion = modelVersionResponse(DesiredStateVersionStatus.active).data[0];
      const { agentCount, changedCount } = countDiff(diff);

      await waitFor(() =>
        expect(scope).toHaveTextContent(
          `${Number(Mock.b.total)} ${words("desiredState.complianceCheck.scope.resourcesOfTotal")(Number(modelVersion.total))}`
        )
      );
      expect(scope).toHaveTextContent(
        `${agentCount} ${words("desiredState.complianceCheck.scope.agents")(agentCount)}`
      );
      expect(scope).toHaveTextContent(
        `${changedCount} ${words("desiredState.complianceCheck.scope.changed")}`
      );
      expect(scope).toHaveTextContent(
        `${DesiredStateVersionStatus.active} ${words("modelVersion")(Number(Mock.b.model))}`
      );
      expect(
        screen.queryByText(words("desiredState.complianceCheck.scope.notActive"))
      ).not.toBeInTheDocument();

      // The applied filter shows open, with the status apart.
      expect(
        within(scope).getByText(words("desiredState.complianceCheck.scope.row.agent"))
      ).toBeVisible();
      expect(within(scope).getByText(Mock.filteredAgent)).toBeVisible();
      expect(
        within(scope).getByText(words("desiredState.complianceCheck.scope.row.status.note"))
      ).toBeVisible();

      await userEvent.click(
        within(scope).getByRole("button", {
          name: words("desiredState.complianceCheck.scope.filter.title"),
        })
      );

      expect(
        within(scope).queryByText(words("desiredState.complianceCheck.scope.row.agent"))
      ).not.toBeInTheDocument();

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    });

    test("GIVEN a report on the whole model version THEN it shows no applied filter", async () => {
      const { component } = setup(`&state.ComplianceCheck.report=${Mock.c.id}`);

      render(component);

      const scope = await findScope();

      expect(scope).toHaveTextContent(
        `${Number(Mock.c.total)} ${words("desiredState.complianceCheck.scope.resources")(Number(Mock.c.total))}`
      );
      expect(
        within(scope).queryByText(words("desiredState.complianceCheck.scope.filter.title"))
      ).not.toBeInTheDocument();
      expect(
        within(scope).queryByRole("button", {
          name: words("desiredState.complianceCheck.scope.rerun"),
        })
      ).not.toBeInTheDocument();
    });

    test("WHEN View JSON is clicked THEN it shows the exact resource filter", async () => {
      const { component } = setup();

      render(component);

      await userEvent.click(
        within(await findScope()).getByRole("button", {
          name: words("desiredState.complianceCheck.scope.json"),
        })
      );

      const dialog = await screen.findByRole("dialog");

      expect(within(dialog).getByTestId("code-editor-content")).toHaveTextContent(
        JSON.stringify(Mock.b.resource_filter, null, 2).replace(/\s+/g, " ")
      );
    });

    test("WHEN Re-run is clicked THEN it re-posts the report's filter and instance labels and selects the new report", async () => {
      const report: DryRun = {
        ...Mock.b,
        resource_filter: { ...Mock.b.resource_filter, serviceInstance: [instance.id] },
        context: { web_instance_labels: { [instance.id]: Mock.filteredInstanceLabel } },
      };
      let body: unknown;
      let data: { data: DryRun[] } = { data: [report] };

      server.use(
        http.get("/api/v2/dryrun/123", () => HttpResponse.json(data)),
        http.post("/api/v2/dryrun_filtered", async ({ request }) => {
          body = await request.json();
          data = { data: [Mock.a, report] };

          return HttpResponse.json({ data: { id: Mock.a.id, model: Mock.a.model } });
        })
      );
      const { component, datePresenter } = setup();

      render(component);

      const scope = await findScope();
      // Queried each time: the button is rendered anew once its disabled reason goes away.
      const getRerun = () =>
        within(scope).getByRole("button", {
          name: words("desiredState.complianceCheck.scope.rerun"),
        });

      await waitFor(() => expect(getRerun()).toBeEnabled());
      await userEvent.click(getRerun());

      await waitFor(() =>
        expect(body).toEqual({ filter: report.resource_filter, context: report.context })
      );
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "ReportListSelect" })).toHaveTextContent(
          datePresenter.getFull(Mock.a.date)
        )
      );
    });

    test("GIVEN a report on a version that is no longer active THEN it warns and blocks a re-run its filter can't target", async () => {
      server.use(
        http.get("/api/v2/desiredstate", () =>
          HttpResponse.json(modelVersionResponse(DesiredStateVersionStatus.retired))
        )
      );
      const { component } = setup();

      render(component);

      const scope = await findScope();

      expect(
        await within(scope).findByText(words("desiredState.complianceCheck.scope.notActive"))
      ).toBeVisible();
      expect(scope).toHaveTextContent(
        `${DesiredStateVersionStatus.retired} ${words("modelVersion")(Number(Mock.b.model))}`
      );
      expect(
        within(scope).getByText(words("desiredState.complianceCheck.scope.value.wasLatestIntent"))
      ).toBeVisible();
      expect(
        within(scope).queryByText(words("desiredState.complianceCheck.scope.value.latestIntent"))
      ).not.toBeInTheDocument();
      expect(
        within(scope).getByRole("button", {
          name: words("desiredState.complianceCheck.scope.rerun"),
        })
      ).toBeDisabled();
    });

    test("GIVEN a filter row with more than three values THEN the rest collapse, flags apart", async () => {
      const agents = ["router-east", "router-west", "router-south", "router-north"];

      server.use(
        http.get("/api/v2/dryrun/123", () =>
          HttpResponse.json({
            data: [
              {
                ...Mock.b,
                resource_filter: { isOrphan: false, includeOwned: true, agent: { eq: agents } },
              },
            ],
          })
        )
      );
      const { component } = setup();

      render(component);

      const scope = await findScope();
      const agentRow = within(scope).getByRole("list", {
        name: words("desiredState.complianceCheck.scope.row.agent"),
      });
      const shown = agents.slice(0, -1);
      const collapsed = agents[agents.length - 1];

      shown.forEach((agent) => expect(within(agentRow).getByText(agent)).toBeVisible());
      expect(within(agentRow).queryByText(collapsed)).not.toBeInTheDocument();
      expect(
        within(agentRow).getByText(
          words("desiredState.complianceCheck.scope.filter.more").replace("${remaining}", "1")
        )
      ).toBeVisible();
      // The owned flag isn't one of the collapsed values, so it is always shown.
      expect(
        within(scope).getByText(words("desiredState.complianceCheck.scope.value.owned"))
      ).toBeVisible();
    });

    test("GIVEN the model version's status can't be looked up THEN it can't be re-run", async () => {
      server.use(http.get("/api/v2/desiredstate", () => HttpResponse.json({ data: [] })));
      const { component } = setup();

      render(component);

      const scope = await findScope();

      // Re-run is also disabled while the status loads, so wait for the lookup to finish.
      await waitFor(() => expect(testClient.isFetching()).toBe(0));
      expect(
        within(scope).queryByText(words("desiredState.complianceCheck.scope.notActive"))
      ).not.toBeInTheDocument();
      expect(
        within(scope).getByRole("button", {
          name: words("desiredState.complianceCheck.scope.rerun"),
        })
      ).toBeDisabled();
    });

    test("GIVEN a halted environment THEN starting and re-running a dry run are disabled", async () => {
      const { component } = setup("", { ...EnvironmentDetails.env, halted: true });

      render(component);

      const scope = await findScope();

      // Re-run is also disabled until the model version's status is known, so wait for it.
      await waitFor(() =>
        expect(scope).toHaveTextContent(
          `${DesiredStateVersionStatus.active} ${words("modelVersion")(Number(Mock.b.model))}`
        )
      );
      expect(
        screen.getByRole("button", { name: words("desiredState.complianceCheck.action.dryRun") })
      ).toBeDisabled();
      expect(
        within(scope).getByRole("button", {
          name: words("desiredState.complianceCheck.scope.rerun"),
        })
      ).toBeDisabled();
    });
  });
});
