import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Resource } from "@/Core/Domain";
import { NonEmptyArray } from "@/Core/Language";
import { ResourceActionFilter, getDesiredStateVersionKey } from "@/Data/Queries";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { CustomDatePresenter } from "@/UI/Utils";
import * as DesiredStatesMock from "@S/DesiredState/Data/Mock";
import { historyData } from "@S/ServiceInstanceDetails/Test/mockData";
import { ResourceActionScope } from "./ResourceActionConfirmModal";
import { ResourceActions } from "./ResourceActions";
import { ResourceActionInstance } from "./types";

const filter: ResourceActionFilter = { isOrphan: false, agent: { eq: ["internal"] } };
const deployLabel = words("resources.compoundStateSummary.deploy");
const repairLabel = words("resources.compoundStateSummary.repair");
const toggleLabel = words("resources.resourceActions.toggle");
const dryRunLabel = words("resources.resourceActions.dryRun");
const versionSelectLabel = words("resources.resourceActions.confirm.version.title");
const searchLabel = words("resources.resourceActions.confirm.version.search");

/**
 * Whether a version meets the `filter.version=ge:N` / `le:N` bounds of a mocked list request, the
 * way the server narrows a version search.
 */
const withinVersionBounds = (version: number, url: URL): boolean =>
  url.searchParams.getAll("filter.version").every((bound) => {
    const [operator, value] = bound.split(":");

    return operator === "ge" ? version >= Number(value) : version <= Number(value);
  });
const MOCK_PAGE_SIZE = 5;

/**
 * A mocked page of a version list, newest first, the way the server pages it: the versions within
 * the request's bounds and below its `end` cursor, a few at a time, linking to the next page.
 */
const versionPage = <Item,>(
  items: Item[],
  versionOf: (item: Item) => number,
  url: URL,
  pageSize = MOCK_PAGE_SIZE
) => {
  const end = url.searchParams.get("end");
  const matching = items.filter(
    (item) =>
      withinVersionBounds(versionOf(item), url) && (end === null || versionOf(item) < Number(end))
  );
  const data = matching.slice(0, pageSize);
  const next =
    matching.length > data.length
      ? `${url.pathname}?limit=20&sort=version.desc&end=${versionOf(data[data.length - 1])}`
      : undefined;

  return { data, links: { self: url.pathname, next } };
};
const modelVersionLabel = (modelVersion: number) =>
  words("resources.resourceActions.confirm.version.modelOption")(String(modelVersion));

const modelVersions = DesiredStatesMock.response.data;
const activeModelVersion = modelVersions.find(
  (modelVersion) => modelVersion.status === "active"
)!.version;
const candidateModelVersion = modelVersions.find(
  (modelVersion) => modelVersion.status === "candidate"
)!.version;

const filteredScopes: NonEmptyArray<ResourceActionScope> = [
  {
    id: "filtered",
    title: words("resources.resourceActions.confirm.filtered.title"),
    filter,
    count: 3,
  },
  {
    id: "environment",
    title: words("resources.resourceActions.confirm.environment.title"),
    filter: { isOrphan: false },
    detail: words("resources.resourceActions.confirm.environment.note"),
    count: 99,
  },
];

const tooltips = {
  deploy: "deploy tooltip from page",
  repair: "repair tooltip from page",
  dryRun: "dry run tooltip from page",
};

function setup(props: React.ComponentProps<typeof ResourceActions> = { filter, tooltips }) {
  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider env={EnvironmentDetails.env}>
          <ModalProvider>
            <Page>
              <ResourceActions {...props} />
            </Page>
          </ModalProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

describe("ResourceActions", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterEach(() => testClient.clear());
  afterAll(() => server.close());

  test("WHEN Deploy is clicked THEN it triggers an incremental deploy against the filter", async () => {
    let body: unknown;

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup());

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    await waitFor(() =>
      expect(body).toEqual({ filter, agent_trigger_method: "push_incremental_deploy" })
    );
  });

  test("WHEN Repair is chosen from the menu THEN it triggers a full deploy against the filter", async () => {
    let body: unknown;

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup());

    await userEvent.click(screen.getByRole("button", { name: toggleLabel }));
    await userEvent.click(screen.getByRole("menuitem", { name: new RegExp(repairLabel, "i") }));

    await waitFor(() => expect(body).toEqual({ filter, agent_trigger_method: "push_full_deploy" }));
  });

  test("WHEN scopes are given THEN Deploy opens a dialog showing the scope details and confirms against the first scope", async () => {
    let body: unknown;

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup({ scopes: filteredScopes, tooltips }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    // The counts come straight from the scopes the view passes, no extra request.
    expect(within(dialog).getByText(/3 resources/)).toBeVisible();
    expect(within(dialog).getByText(/99 resources/)).toBeVisible();

    await userEvent.click(within(dialog).getByRole("button", { name: deployLabel }));

    await waitFor(() =>
      expect(body).toEqual({ filter, agent_trigger_method: "push_incremental_deploy" })
    );
  });

  test("WHEN the second scope is chosen THEN it confirms against that scope's filter", async () => {
    let body: unknown;

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup({ scopes: filteredScopes, tooltips }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("radio", {
        name: new RegExp(words("resources.resourceActions.confirm.environment.title"), "i"),
      })
    );
    await userEvent.click(within(dialog).getByRole("button", { name: deployLabel }));

    await waitFor(() =>
      expect(body).toEqual({
        filter: { isOrphan: false },
        agent_trigger_method: "push_incremental_deploy",
      })
    );
  });

  test("WHEN a service-instance owned scope is chosen THEN it deploys with includeOwned", async () => {
    let body: unknown;

    const instanceScopes: NonEmptyArray<ResourceActionScope> = [
      {
        id: "instance",
        title: words("resources.resourceActions.confirm.instance.title"),
        filter: { isOrphan: false, serviceInstance: ["abc"] },
        count: 3,
      },
      {
        id: "owned",
        title: words("resources.resourceActions.confirm.owned.title"),
        filter: { isOrphan: false, serviceInstance: ["abc"], includeOwned: true },
        detail: words("resources.resourceActions.confirm.owned.description")("l2Connect"),
      },
    ];

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup({ scopes: instanceScopes, tooltips }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    // The owned scope has no count, only a note naming the owned service types.
    expect(
      within(dialog).getByText(
        words("resources.resourceActions.confirm.owned.description")("l2Connect")
      )
    ).toBeVisible();

    await userEvent.click(
      within(dialog).getByRole("radio", {
        name: new RegExp(words("resources.resourceActions.confirm.owned.title"), "i"),
      })
    );
    await userEvent.click(within(dialog).getByRole("button", { name: deployLabel }));

    await waitFor(() =>
      expect(body).toEqual({
        filter: { isOrphan: false, serviceInstance: ["abc"], includeOwned: true },
        agent_trigger_method: "push_incremental_deploy",
      })
    );
  });

  test("WHEN a scope matches no resources THEN it preselects an actionable scope and blocks the empty one", async () => {
    const emptyThenFull: NonEmptyArray<ResourceActionScope> = [
      {
        id: "filtered",
        title: words("resources.resourceActions.confirm.filtered.title"),
        filter,
        count: 0,
      },
      {
        id: "environment",
        title: words("resources.resourceActions.confirm.environment.title"),
        filter: { isOrphan: false },
        detail: words("resources.resourceActions.confirm.environment.note"),
        count: 5,
      },
    ];

    render(setup({ scopes: emptyThenFull, tooltips }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: deployLabel });

    // The first scope matches nothing, so the dialog opens on the first actionable one instead of
    // opening with a dead confirm button.
    expect(
      within(dialog).getByRole("radio", {
        name: new RegExp(words("resources.resourceActions.confirm.environment.title"), "i"),
      })
    ).toBeChecked();
    expect(confirm).toBeEnabled();

    // Picking the empty scope blocks confirming (an empty deploy).
    await userEvent.click(
      within(dialog).getByRole("radio", {
        name: new RegExp(words("resources.resourceActions.confirm.filtered.title"), "i"),
      })
    );
    expect(confirm).toBeDisabled();
  });

  test("WHEN the chosen scope's filter does not exclude orphans THEN it notes they are skipped", async () => {
    // The note follows the selected scope's filter: it appears only when that filter can match
    // orphans (isOrphan true or unset), since only then does the counted set contain skipped orphans.
    const mixedScopes: NonEmptyArray<ResourceActionScope> = [
      {
        id: "excludes-orphans",
        title: words("resources.resourceActions.confirm.filtered.title"),
        filter: { isOrphan: false },
        count: 3,
      },
      {
        id: "includes-orphans",
        title: words("resources.resourceActions.confirm.environment.title"),
        filter: { isOrphan: true },
        count: 2,
      },
    ];

    render(setup({ scopes: mixedScopes, tooltips }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");

    // The preselected scope excludes orphans, so the note does not apply.
    expect(
      within(dialog).queryByText(words("resources.resourceActions.confirm.orphanNote"))
    ).not.toBeInTheDocument();

    // Selecting a scope whose filter can match orphans surfaces the note.
    await userEvent.click(
      within(dialog).getByRole("radio", {
        name: new RegExp(words("resources.resourceActions.confirm.environment.title"), "i"),
      })
    );
    expect(
      within(dialog).getByText(words("resources.resourceActions.confirm.orphanNote"))
    ).toBeVisible();
  });

  test("WHEN the chosen scope filter includes orphans THEN it is sent as-is, leaving the scheduler to reject it", async () => {
    let body: unknown;

    const orphanScope: NonEmptyArray<ResourceActionScope> = [
      {
        id: "filtered",
        title: words("resources.resourceActions.confirm.filtered.title"),
        filter: { isOrphan: true },
        count: 3,
      },
    ];

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    // The filter is passed through unchanged; an orphan filter reaches the backend (which rejects it
    // and surfaces an error toast) rather than being silently rewritten here.
    render(setup({ scopes: orphanScope, tooltips }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: deployLabel }));

    await waitFor(() =>
      expect(body).toEqual({
        filter: { isOrphan: true },
        agent_trigger_method: "push_incremental_deploy",
      })
    );
  });

  test("WHEN a disabledReason is given THEN the control is disabled", async () => {
    render(setup({ filter, disabledReason: "nope", tooltips }));

    expect(screen.getByRole("button", { name: toggleLabel })).toBeDisabled();
    expect(screen.getByRole("button", { name: deployLabel })).toBeDisabled();
  });

  test("WHEN the actions are hovered THEN they show the tooltips the page passed in", async () => {
    render(setup());

    await userEvent.hover(screen.getByText(deployLabel));
    expect(await screen.findByRole("tooltip")).toHaveTextContent(tooltips.deploy);

    await userEvent.click(screen.getByRole("button", { name: toggleLabel }));
    await userEvent.hover(screen.getByRole("menuitem", { name: new RegExp(repairLabel, "i") }));

    await waitFor(() => expect(screen.getByText(tooltips.repair)).toBeVisible());

    await userEvent.hover(screen.getByRole("menuitem", { name: new RegExp(dryRunLabel, "i") }));

    await waitFor(() => expect(screen.getByText(tooltips.dryRun)).toBeVisible());
  });

  describe("Dry run", () => {
    let body: unknown;
    const firstModelVersionPage = modelVersions.slice(0, MOCK_PAGE_SIZE);
    const notLoadedModelVersions = modelVersions.slice(MOCK_PAGE_SIZE);

    beforeEach(() => {
      body = undefined;
      server.use(
        http.get("/api/v2/desiredstate", ({ request }) =>
          HttpResponse.json(
            versionPage(modelVersions, (version) => version.version, new URL(request.url))
          )
        ),
        http.post("/api/v2/dryrun_filtered", async ({ request }) => {
          body = await request.json();

          return HttpResponse.json({ data: "dry-run-id" });
        })
      );
    });

    const openDryRun = async () => {
      await userEvent.click(screen.getByRole("button", { name: toggleLabel }));
      await userEvent.click(screen.getByRole("menuitem", { name: new RegExp(dryRunLabel, "i") }));

      const dialog = await screen.findByRole("dialog");

      // The version select shows the active model version once the model versions are loaded.
      expect(await within(dialog).findByText(modelVersionLabel(activeModelVersion))).toBeVisible();

      return dialog;
    };

    test("WHEN Dry run is chosen on a single resource THEN it opens the version field without scopes and dry-runs the filter", async () => {
      render(setup());

      const dialog = await openDryRun();

      expect(within(dialog).queryByRole("radio")).not.toBeInTheDocument();

      await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

      await waitFor(() => expect(body).toEqual({ filter }));
    });

    test("WHEN another model version is selected THEN the dry run runs against that model version", async () => {
      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionSelectLabel }));
      await userEvent.click(
        screen.getByRole("option", { name: new RegExp(modelVersionLabel(candidateModelVersion)) })
      );
      await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

      // The version replaces isOrphan, which the server does not accept alongside it.
      await waitFor(() =>
        expect(body).toEqual({
          filter: { agent: filter.agent, modelVersion: candidateModelVersion },
        })
      );
    });

    test("WHEN the chosen scope filters on status THEN the version select is blocked and the dry run uses the active model version", async () => {
      const statusFilter: ResourceActionFilter = {
        isOrphan: false,
        compliance: { eq: [Resource.COMPLIANCE.non_compliant] },
      };

      render(
        setup({
          scopes: [
            {
              id: "filtered",
              title: words("resources.resourceActions.confirm.filtered.title"),
              filter: statusFilter,
              count: 3,
            },
          ],
          tooltips,
        })
      );

      const dialog = await openDryRun();

      expect(within(dialog).getByRole("button", { name: versionSelectLabel })).toBeDisabled();
      expect(
        within(dialog).getByText(
          words("resources.resourceActions.confirm.version.blockedBy.statusFilter")
        )
      ).toBeVisible();

      await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

      await waitFor(() => expect(body).toEqual({ filter: statusFilter }));
    });

    test("WHEN the scope leaves isOrphan unset THEN the dry run runs against the active model version", async () => {
      // Without a version in the filter the server resolves each resource at the newest model
      // version it appears in, so orphans would pull in older model versions and the dry run would
      // be rejected.
      const unsetFilter: ResourceActionFilter = { agent: { eq: ["internal"] } };

      render(
        setup({
          scopes: [
            {
              id: "filtered",
              title: words("resources.resourceActions.confirm.filtered.title"),
              filter: unsetFilter,
              count: 3,
            },
          ],
          tooltips,
        })
      );

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

      await waitFor(() => expect(body).toEqual({ filter: { ...unsetFilter, isOrphan: false } }));
    });

    test("WHEN the version select is opened with the keyboard THEN the search box has focus and Down moves to the first version", async () => {
      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      within(dialog).getByRole("button", { name: versionSelectLabel }).focus();
      await userEvent.keyboard("{Enter}");

      await waitFor(() => expect(screen.getByLabelText(searchLabel)).toHaveFocus());

      await userEvent.keyboard("{ArrowDown}");

      expect(screen.getAllByRole("option")[0]).toHaveFocus();
    });

    test("WHEN the list is scrolled to its end THEN the next versions load", async () => {
      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionSelectLabel }));
      expect(screen.getAllByRole("option")).toHaveLength(firstModelVersionPage.length);

      fireEvent.scroll(screen.getByRole("listbox"));

      expect(
        await screen.findByRole("option", {
          name: new RegExp(modelVersionLabel(notLoadedModelVersions[0].version)),
        })
      ).toBeVisible();
      await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(modelVersions.length));
    });

    test("WHEN digits of a loaded version are searched THEN the list narrows to it without a lookup", async () => {
      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionSelectLabel }));

      // The lookup waits for a pause in typing, so the clock is moved past that pause instead of
      // waiting it out. Leading zeros still read as the version.
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      try {
        fireEvent.change(screen.getByLabelText(searchLabel), {
          target: { value: `0${activeModelVersion}` },
        });
        act(() => {
          vi.runOnlyPendingTimers();
        });
      } finally {
        vi.useRealTimers();
      }

      const narrowedModelVersions = firstModelVersionPage.filter((modelVersion) =>
        String(modelVersion.version).startsWith(String(activeModelVersion))
      );

      expect(screen.getAllByRole("option")).toHaveLength(narrowedModelVersions.length);
      expect(
        screen.getByRole("option", { name: new RegExp(modelVersionLabel(activeModelVersion)) })
      ).toBeVisible();
      // A lookup would have added a query for the searched version.
      expect(
        testClient
          .getQueryCache()
          .findAll({ queryKey: getDesiredStateVersionKey.single(String(activeModelVersion)) })
      ).toEqual([]);
    });

    test("WHEN looking up a version fails THEN the list says so instead of finding nothing", async () => {
      server.use(
        http.get("/api/v2/desiredstate", ({ request }) =>
          new URL(request.url).searchParams.has("filter.version")
            ? HttpResponse.json({ message: "lookup failed" }, { status: 500 })
            : HttpResponse.json(
                versionPage(modelVersions, (version) => version.version, new URL(request.url))
              )
        )
      );
      const oldestModelVersion = notLoadedModelVersions[notLoadedModelVersions.length - 1].version;

      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionSelectLabel }));
      await userEvent.type(screen.getByLabelText(searchLabel), String(oldestModelVersion));

      expect(
        await screen.findByText(
          words("resources.resourceActions.confirm.version.lookupError")(String(oldestModelVersion))
        )
      ).toBeVisible();
      expect(
        screen.queryByText(words("resources.resourceActions.confirm.version.noResults"))
      ).not.toBeInTheDocument();
    });

    test("WHEN a version that isn't loaded is searched THEN it is looked up and can be selected", async () => {
      const oldestModelVersion = notLoadedModelVersions[notLoadedModelVersions.length - 1].version;

      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionSelectLabel }));
      await userEvent.type(screen.getByLabelText(searchLabel), String(oldestModelVersion));

      // Nothing loaded matches, so the list only shows the lookup running.
      expect(screen.getAllByRole("option")).toEqual([
        screen.getByRole("option", { name: words("loading") }),
      ]);

      const lookedUpOption = await screen.findByRole("option", {
        name: new RegExp(modelVersionLabel(oldestModelVersion)),
      });

      expect(screen.getAllByRole("option")).toHaveLength(1);
      await userEvent.click(lookedUpOption);
      await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

      await waitFor(() =>
        expect(body).toEqual({ filter: { agent: filter.agent, modelVersion: oldestModelVersion } })
      );
    });

    describe("on a service instance", () => {
      const instance: ResourceActionInstance = {
        id: "abc",
        serviceEntity: "lsp",
        name: "demo-cpe-ring",
        renderState: (state) => state,
      };
      // The history is newest first.
      const [newestInstanceVersion, olderInstanceVersion, instanceVersionWithoutModelVersion] =
        historyData.map((log) => Number(log.version));
      const dateOfInstanceVersion = (instanceVersion: number) =>
        historyData.find((log) => Number(log.version) === instanceVersion)!.timestamp;
      // The model version each instance version maps to; null when there is none.
      let modelVersionOf: Record<number, number | null>;
      const instanceFilter: ResourceActionFilter = {
        isOrphan: false,
        serviceInstance: [instance.id],
      };
      const ownedFilter: ResourceActionFilter = { ...instanceFilter, includeOwned: true };
      const instanceScopes: NonEmptyArray<ResourceActionScope> = [
        {
          id: "instance",
          title: words("resources.resourceActions.confirm.instance.title"),
          filter: instanceFilter,
          count: 3,
        },
        {
          id: "owned",
          title: words("resources.resourceActions.confirm.owned.title"),
          filter: ownedFilter,
        },
      ];
      const instanceVersionLabel = (instanceVersion: number) =>
        words("resources.resourceActions.confirm.version.instanceOption")(String(instanceVersion));
      const mapsTo = words("resources.resourceActions.confirm.version.mapsTo");

      beforeEach(() => {
        modelVersionOf = {
          [newestInstanceVersion]: activeModelVersion,
          [olderInstanceVersion]: candidateModelVersion,
          [instanceVersionWithoutModelVersion]: null,
        };
        server.use(
          http.get("/lsm/v1/service_inventory/:entity/:id/log", ({ request }) =>
            HttpResponse.json(
              versionPage(historyData, (log) => Number(log.version), new URL(request.url))
            )
          ),
          http.post("/api/v2/graphql", async ({ request }) => {
            const { variables } = (await request.json()) as {
              variables: { filter: { instanceVersion: number } };
            };
            const modelVersion = modelVersionOf[variables.filter.instanceVersion];
            const edges = modelVersion === null ? [] : [{ node: { modelVersion } }];

            return HttpResponse.json({
              data: { data: { resources: { edges } }, errors: null, extensions: {} },
            });
          })
        );
      });

      const openInstanceDryRun = async () => {
        render(setup({ scopes: instanceScopes, tooltips, instance }));

        await userEvent.click(screen.getByRole("button", { name: toggleLabel }));
        await userEvent.click(screen.getByRole("menuitem", { name: new RegExp(dryRunLabel, "i") }));

        const dialog = await screen.findByRole("dialog");

        // The version select shows the newest instance version once the history is loaded.
        expect(
          await within(dialog).findByText(instanceVersionLabel(newestInstanceVersion))
        ).toBeVisible();

        return dialog;
      };

      const selectInstanceVersion = async (dialog: HTMLElement, instanceVersion: number) => {
        await userEvent.click(within(dialog).getByRole("button", { name: versionSelectLabel }));
        await userEvent.click(
          screen.getByRole("option", { name: new RegExp(instanceVersionLabel(instanceVersion)) })
        );
      };

      test("WHEN Dry run is chosen THEN the dialog names the instance and shows its newest version and the model version it maps to", async () => {
        const dialog = await openInstanceDryRun();
        const toggle = within(dialog).getByRole("button", { name: versionSelectLabel });

        expect(
          within(dialog).getByText(
            words("resources.resourceActions.confirm.titleFor")(dryRunLabel, instance.name)
          )
        ).toBeVisible();
        expect(
          await within(toggle).findByText(mapsTo(String(modelVersionOf[newestInstanceVersion])))
        ).toBeVisible();
        expect(
          within(toggle).getByText(
            new CustomDatePresenter().getFull(dateOfInstanceVersion(newestInstanceVersion))
          )
        ).toBeVisible();

        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() => expect(body).toEqual({ filter: instanceFilter }));
      });

      test("WHEN an older instance version is selected THEN the dry run runs against that instance version", async () => {
        const dialog = await openInstanceDryRun();

        await selectInstanceVersion(dialog, olderInstanceVersion);
        expect(
          await within(dialog).findByText(mapsTo(String(modelVersionOf[olderInstanceVersion])))
        ).toBeVisible();
        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() =>
          expect(body).toEqual({
            filter: {
              serviceInstance: instanceFilter.serviceInstance,
              instanceVersion: olderInstanceVersion,
            },
          })
        );
      });

      test("WHEN a selected instance version has no model version THEN it says so and blocks the dry run", async () => {
        const dialog = await openInstanceDryRun();

        await selectInstanceVersion(dialog, instanceVersionWithoutModelVersion);

        expect(
          await within(dialog).findByText(
            words("resources.resourceActions.confirm.version.noModelVersion.selected")(
              String(instanceVersionWithoutModelVersion)
            )
          )
        ).toBeVisible();
        expect(within(dialog).getByRole("button", { name: dryRunLabel })).toBeDisabled();
      });

      test("WHEN the newest instance version has no model version yet THEN the default falls back to the active model version", async () => {
        modelVersionOf[newestInstanceVersion] = null;

        const dialog = await openInstanceDryRun();

        expect(
          await within(dialog).findByText(
            words("resources.resourceActions.confirm.version.noModelVersion.default")(
              String(newestInstanceVersion)
            )
          )
        ).toBeVisible();

        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() => expect(body).toEqual({ filter: instanceFilter }));
      });

      test("WHEN an instance version number is searched THEN only that version is listed", async () => {
        const dialog = await openInstanceDryRun();

        await userEvent.click(within(dialog).getByRole("button", { name: versionSelectLabel }));
        await userEvent.type(
          screen.getByLabelText(searchLabel),
          String(instanceVersionWithoutModelVersion)
        );

        expect(
          await screen.findByRole("option", {
            name: new RegExp(instanceVersionLabel(instanceVersionWithoutModelVersion)),
          })
        ).toBeVisible();
        expect(screen.getAllByRole("option")).toHaveLength(1);
      });

      test("WHEN an instance version that isn't loaded is searched THEN it is looked up and can be selected", async () => {
        // The history pages two versions at a time, so the oldest one isn't loaded.
        server.use(
          http.get("/lsm/v1/service_inventory/:entity/:id/log", ({ request }) =>
            HttpResponse.json(
              versionPage(historyData, (log) => Number(log.version), new URL(request.url), 2)
            )
          )
        );
        modelVersionOf[instanceVersionWithoutModelVersion] = candidateModelVersion;

        const dialog = await openInstanceDryRun();

        await userEvent.click(within(dialog).getByRole("button", { name: versionSelectLabel }));
        await userEvent.type(
          screen.getByLabelText(searchLabel),
          String(instanceVersionWithoutModelVersion)
        );

        // Nothing loaded matches, so the list only shows the lookup running.
        expect(screen.getAllByRole("option")).toEqual([
          screen.getByRole("option", { name: words("loading") }),
        ]);

        await userEvent.click(
          await screen.findByRole("option", {
            name: new RegExp(instanceVersionLabel(instanceVersionWithoutModelVersion)),
          })
        );
        expect(
          await within(dialog).findByText(
            mapsTo(String(modelVersionOf[instanceVersionWithoutModelVersion]))
          )
        ).toBeVisible();
        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() =>
          expect(body).toEqual({
            filter: {
              serviceInstance: instanceFilter.serviceInstance,
              instanceVersion: instanceVersionWithoutModelVersion,
            },
          })
        );
      });

      test("WHEN the model version type is used THEN the dry run runs against a model version instead", async () => {
        const dialog = await openInstanceDryRun();

        await userEvent.click(
          within(dialog).getByRole("button", {
            name: words("resources.resourceActions.confirm.version.type.modelVersion"),
          })
        );
        expect(
          await within(dialog).findByText(modelVersionLabel(activeModelVersion))
        ).toBeVisible();

        await userEvent.click(within(dialog).getByRole("button", { name: versionSelectLabel }));
        await userEvent.click(
          screen.getByRole("option", { name: new RegExp(modelVersionLabel(candidateModelVersion)) })
        );
        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() =>
          expect(body).toEqual({
            filter: {
              serviceInstance: instanceFilter.serviceInstance,
              modelVersion: candidateModelVersion,
            },
          })
        );
      });

      test("WHEN the version type is switched after a selection THEN the dry run uses the default version again", async () => {
        const dialog = await openInstanceDryRun();

        await selectInstanceVersion(dialog, olderInstanceVersion);
        expect(
          await within(dialog).findByText(mapsTo(String(modelVersionOf[olderInstanceVersion])))
        ).toBeVisible();

        await userEvent.click(
          within(dialog).getByRole("button", {
            name: words("resources.resourceActions.confirm.version.type.modelVersion"),
          })
        );
        expect(
          await within(dialog).findByText(modelVersionLabel(activeModelVersion))
        ).toBeVisible();
        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() => expect(body).toEqual({ filter: instanceFilter }));
      });

      test("WHEN the owned scope is chosen THEN the version select is blocked and the dry run uses the active model version", async () => {
        const dialog = await openInstanceDryRun();

        // Select an older instance version first, so the owned scope has a selection to ignore.
        await selectInstanceVersion(dialog, olderInstanceVersion);
        await userEvent.click(
          within(dialog).getByRole("radio", {
            name: new RegExp(words("resources.resourceActions.confirm.owned.title"), "i"),
          })
        );

        expect(within(dialog).getByRole("button", { name: versionSelectLabel })).toBeDisabled();
        expect(
          within(dialog).getByText(
            words("resources.resourceActions.confirm.version.blockedBy.ownedServices")
          )
        ).toBeVisible();

        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() => expect(body).toEqual({ filter: ownedFilter }));
      });
    });
  });
});
