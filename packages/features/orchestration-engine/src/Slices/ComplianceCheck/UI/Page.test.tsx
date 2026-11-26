import { act, useState } from "react";
import { useLocation } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { HttpResponse, http } from "msw";
import { Diff, DryRun, words, getFeatureRoutes } from "@inmanta/web-console-core";
import { DesiredStateVersionStatus } from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
import {
  findResourceListRows,
  getResourceListRows,
  selectResource,
} from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/Spec/resourceListQueries";
import * as Mock from "@inmanta/web-console-feature-orchestration-engine/Slices/ComplianceCheck/Data/Mock";
import {
  EnvironmentDetails,
  MockedDependencyProvider,
  ServiceInstance,
  ModalProvider,
  stubRoute,
} from "@inmanta/web-console-test-utils";
import * as DesiredStateMock from "@inmanta/web-console-test-utils/Data/DesiredStateVersions";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import { CustomDatePresenter } from "@inmanta/web-console-ui/Utils";
import { countDiff, createReportScopeParts } from "./Components/ReportScope/helpers";
import { View } from "./Page";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const environment = "aaa";

const resourcesShownByDefault = Mock.reportResponse.data.diff.filter((resource) =>
  Diff.defaultStatuses.includes(resource.status)
);

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

/**
 * Opens the menu of the Dry run split button, once it is enabled.
 */
const openDryRunMenu = async () => {
  const toggle = await screen.findByRole("button", {
    name: words("desiredState.complianceCheck.action.dryRun.toggle"),
  });

  await waitFor(() => expect(toggle).toBeEnabled());
  await userEvent.click(toggle);
};

/**
 * Waits for the lookup of the model version's status, which "This report's scope" is disabled
 * until.
 */
const waitForModelVersionStatus = async () => {
  await waitFor(() => expect(testClient.isFetching()).toBe(0));
};

/**
 * Gets the "This report's scope" item of the open Dry run menu.
 */
const getReportScopeItem = () =>
  screen.getByRole("menuitem", {
    name: new RegExp(`^${words("desiredState.complianceCheck.action.dryRun.reportScope")}`),
  });

function setup(search = "", env = EnvironmentDetails.env, page = <View version="123" />) {
  const datePresenter = new CustomDatePresenter();

  const component = (
    <TestMemoryRouter initialEntries={[`/?env=${environment}${search}`]}>
      <QueryClientProvider client={testClient}>
        <MockedDependencyProvider
          features={[orchestrationEngineFeature]}
          routes={[...getFeatureRoutes([orchestrationEngineFeature]), stubRoute("ResourceDetails")]}
          env={env}
        >
          <ModalProvider>{page}</ModalProvider>
        </MockedDependencyProvider>
      </QueryClientProvider>
    </TestMemoryRouter>
  );

  return { component, datePresenter };
}

describe("ComplianceCheck page", () => {
  const server = setupTestServer(
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

    expect(await findResourceListRows()).toHaveLength(resourcesShownByDefault.length);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ComplianceCheck page WHEN a resource is selected THEN its diff header links to its resource details page", async () => {
    const { component } = setup();

    render(component);

    const [{ resource_id: notInitiallySelectedResourceId }] = Mock.reportResponse.data.diff.filter(
      ({ status }) => status === "deleted"
    );

    await selectResource(notInitiallySelectedResourceId);

    const link = screen.getByRole("link", { name: words("desiredState.resourceDetails.title") });
    const href = link.getAttribute("href") ?? "";

    // The link points at the resource details page for this resource, keeping the environment.
    expect(href).toMatch(/^\/resources\//);
    expect(decodeURIComponent(href)).toContain(notInitiallySelectedResourceId);
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

  test("GIVEN ComplianceCheck page WHEN user clicks on 'Dry run' THEN a full model dry run starts and gets selected", async () => {
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

    // The new report is selected on this page, so the toast has no link to it.
    expect(await screen.findByTestId("ToastAlert")).toHaveTextContent(
      words("desiredState.complianceCheck.report.started")
    );
    expect(
      screen.queryByRole("button", { name: words("desiredState.complianceCheck.report.view") })
    ).not.toBeInTheDocument();

    await userEvent.click(select);

    const options = screen.getAllByRole<HTMLButtonElement>("option");

    expect(options).toHaveLength(4);
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  test("GIVEN ComplianceCheck page WHEN the Dry run menu opens THEN it offers the full model and the report's scope with their resource counts", async () => {
    const { component } = setup();

    render(component);

    await openDryRunMenu();

    const modelVersion = modelVersionResponse(DesiredStateVersionStatus.active).data[0];

    expect(
      await screen.findByRole("menuitem", {
        name: `${words("desiredState.complianceCheck.scope.fullModel")} ${words("desiredState.complianceCheck.action.dryRun.fullModel.hint")(Number(modelVersion.total))}`,
      })
    ).toBeVisible();
    expect(
      screen.getByRole("menuitem", {
        name: `${words("desiredState.complianceCheck.action.dryRun.reportScope")} ${words("desiredState.complianceCheck.action.dryRun.reportScope.hint")(Number(Mock.b.total))}`,
      })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
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

  test("GIVEN ComplianceCheck page WHEN a type filter is added in the filter drawer THEN only the report's resources of that type show", async () => {
    const { component } = setup();

    render(component);

    expect(await findResourceListRows()).toHaveLength(resourcesShownByDefault.length);

    await userEvent.click(screen.getByRole("button", { name: new RegExp(words("filters")) }));
    await userEvent.type(screen.getByRole("textbox", { name: words("type") }), "lsm{Enter}");

    expect(getResourceListRows()).toHaveLength(
      resourcesShownByDefault.filter((resource) => resource.resource_id.startsWith("lsm::")).length
    );

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

    const expandScope = (scope: HTMLElement) =>
      userEvent.click(
        within(scope).getByRole("button", {
          name: words("desiredState.complianceCheck.scope.title"),
        })
      );

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

      // Instances show by the labels stored with each report. createReportScopeParts is tested in
      // helpers.test.ts; this checks that each option shows its own scope label.
      const scopeLabels = Mock.listOfReports.map((report) => createReportScopeParts(report).label);
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

      // The applied filter starts closed and opens with the card, with the status apart.
      expect(
        within(scope).queryByText(words("desiredState.complianceCheck.scope.row.agent"))
      ).not.toBeInTheDocument();

      await expandScope(scope);

      expect(
        within(scope).getByText(words("desiredState.complianceCheck.scope.row.agent"))
      ).toBeVisible();
      expect(within(scope).getByText(Mock.filteredAgent)).toBeVisible();
      expect(
        within(scope).getByText(words("desiredState.complianceCheck.scope.row.status.note"))
      ).toBeVisible();

      await act(async () => {
        const results = await axe(document.body);

        expect(results).toHaveNoViolations();
      });
    });

    test("GIVEN a report on the whole model version THEN it shows no applied filter and its scope can't run", async () => {
      const { component } = setup(`&state.ComplianceCheck.report=${Mock.c.id}`);

      render(component);

      const scope = await findScope();

      expect(scope).toHaveTextContent(
        `${Number(Mock.c.total)} ${words("desiredState.complianceCheck.scope.resources")(Number(Mock.c.total))}`
      );
      expect(
        within(scope).queryByRole("button", {
          name: words("desiredState.complianceCheck.scope.title"),
        })
      ).not.toBeInTheDocument();
      expect(
        within(scope).queryByText(words("desiredState.complianceCheck.scope.filter.title"))
      ).not.toBeInTheDocument();

      await openDryRunMenu();

      expect(getReportScopeItem()).toHaveAttribute("aria-disabled", "true");

      await userEvent.hover(getReportScopeItem());

      expect(await screen.findByRole("tooltip")).toHaveTextContent(
        words("desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.fullModel")
      );
    });

    test("GIVEN a report whose filter only picks the model version THEN its scope can't run", async () => {
      server.use(
        http.get("/api/v2/dryrun/123", () =>
          HttpResponse.json({ data: [{ ...Mock.b, resource_filter: { isOrphan: false } }] })
        )
      );
      const { component } = setup();

      render(component);

      await openDryRunMenu();

      expect(getReportScopeItem()).toHaveAttribute("aria-disabled", "true");

      await userEvent.hover(getReportScopeItem());

      expect(await screen.findByRole("tooltip")).toHaveTextContent(
        words("desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.fullModel")
      );
    });

    test("GIVEN no reports THEN the report's scope can't run", async () => {
      server.use(http.get("/api/v2/dryrun/123", () => HttpResponse.json({ data: [] })));
      const { component } = setup();

      render(component);

      await openDryRunMenu();

      expect(getReportScopeItem()).toHaveAttribute("aria-disabled", "true");

      await userEvent.hover(getReportScopeItem());

      expect(await screen.findByRole("tooltip")).toHaveTextContent(
        words("desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.noReport")
      );
    });

    test("WHEN the applied filter switches to JSON THEN it shows the exact resource filter in place", async () => {
      const { component } = setup();

      render(component);

      const scope = await findScope();

      await expandScope(scope);
      await userEvent.click(
        within(scope).getByRole("button", {
          name: words("view.json"),
        })
      );

      expect(within(scope).getByTestId("code-editor-content")).toHaveTextContent(
        JSON.stringify(Mock.b.resource_filter, null, 2).replace(/\s+/g, " ")
      );
      expect(
        within(scope).queryByRole("grid", {
          name: words("desiredState.complianceCheck.scope.filter.title"),
        })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    test("WHEN 'This report's scope' is clicked THEN it posts the report's filter and context and selects the new report", async () => {
      const report: DryRun = {
        ...Mock.b,
        resource_filter: { ...Mock.b.resource_filter, serviceInstance: [instance.id] },
        // A key another client stored, which "This report's scope" keeps.
        context: {
          web_instance_labels: { [instance.id]: Mock.filteredInstanceLabel },
          other_client_key: "kept",
        },
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

      await openDryRunMenu();
      // Enabled once the model version's status is known.
      await waitFor(() => expect(getReportScopeItem()).not.toHaveAttribute("aria-disabled"));
      await userEvent.click(getReportScopeItem());

      await waitFor(() =>
        expect(body).toEqual({ filter: report.resource_filter, context: report.context })
      );
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "ReportListSelect" })).toHaveTextContent(
          datePresenter.getFull(Mock.a.date)
        )
      );
      const toast = await screen.findByTestId("ToastAlert");

      expect(toast).toHaveTextContent(words("desiredState.complianceCheck.report.started"));
      // The new report is selected on this page, so the toast doesn't link to it.
      expect(toast).not.toHaveTextContent(words("desiredState.complianceCheck.report.view"));
    });

    test("GIVEN a report on a version that is no longer active THEN it warns and blocks a scope its filter can't target", async () => {
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

      await expandScope(scope);

      expect(
        within(scope).getByText(words("desiredState.complianceCheck.scope.value.wasLatestIntent"))
      ).toBeVisible();
      expect(
        within(scope).queryByText(words("desiredState.complianceCheck.scope.value.latestIntent"))
      ).not.toBeInTheDocument();

      await openDryRunMenu();

      expect(getReportScopeItem()).toHaveAttribute("aria-disabled", "true");

      await userEvent.hover(getReportScopeItem());

      // Mock.b's filter has a status condition, which can't target an older model version.
      expect(await screen.findByRole("tooltip")).toHaveTextContent(
        words("resources.resourceActions.confirm.version.blockedBy.statusFilter")
      );
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

      await expandScope(scope);

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

    test("GIVEN the model version's status can't be looked up THEN the report's scope can't run", async () => {
      server.use(http.get("/api/v2/desiredstate", () => HttpResponse.json({ data: [] })));
      const { component } = setup();

      render(component);

      const scope = await findScope();

      await waitForModelVersionStatus();
      expect(
        within(scope).queryByText(words("desiredState.complianceCheck.scope.notActive"))
      ).not.toBeInTheDocument();

      await openDryRunMenu();

      expect(getReportScopeItem()).toHaveAttribute("aria-disabled", "true");

      await userEvent.hover(getReportScopeItem());

      expect(await screen.findByRole("tooltip")).toHaveTextContent(
        words("desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.unknownStatus")
      );
    });

    test("GIVEN a halted environment THEN the whole Dry run button is disabled", async () => {
      const { component } = setup("", { ...EnvironmentDetails.env, halted: true });

      render(component);

      await findScope();

      expect(
        screen.getByRole("button", { name: words("desiredState.complianceCheck.action.dryRun") })
      ).toBeDisabled();
      expect(
        screen.getByRole("button", {
          name: words("desiredState.complianceCheck.action.dryRun.toggle"),
        })
      ).toBeDisabled();
    });
  });
});
