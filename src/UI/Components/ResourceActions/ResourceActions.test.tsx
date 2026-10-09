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
const versionToggleLabel = words("resources.resourceActions.confirm.version.title");
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
const versionLabel = (version: number) =>
  words("resources.resourceActions.confirm.version.option")(String(version));

const versions = DesiredStatesMock.response.data;
const activeVersion = versions.find((version) => version.status === "active")!.version;
const candidateVersion = versions.find((version) => version.status === "candidate")!.version;

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
    const firstPage = versions.slice(0, MOCK_PAGE_SIZE);
    const notLoaded = versions.slice(MOCK_PAGE_SIZE);

    beforeEach(() => {
      body = undefined;
      server.use(
        http.get("/api/v2/desiredstate", ({ request }) =>
          HttpResponse.json(
            versionPage(versions, (version) => version.version, new URL(request.url))
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

      // The picker shows the active version once the versions are loaded.
      expect(await within(dialog).findByText(versionLabel(activeVersion))).toBeVisible();

      return dialog;
    };

    test("WHEN Dry run is chosen on a single resource THEN it opens the version picker without scopes and dry-runs the filter", async () => {
      render(setup());

      const dialog = await openDryRun();

      expect(within(dialog).queryByRole("radio")).not.toBeInTheDocument();

      await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

      await waitFor(() => expect(body).toEqual({ filter }));
    });

    test("WHEN another version is picked THEN the chosen scope is pinned to that version", async () => {
      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionToggleLabel }));
      await userEvent.click(
        screen.getByRole("option", { name: new RegExp(versionLabel(candidateVersion)) })
      );
      await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

      // The version replaces isOrphan, which the server does not accept alongside it.
      await waitFor(() =>
        expect(body).toEqual({ filter: { agent: filter.agent, modelVersion: candidateVersion } })
      );
    });

    test("WHEN the chosen scope filters on status THEN the version stays on the active one", async () => {
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

      expect(within(dialog).getByRole("button", { name: versionToggleLabel })).toBeDisabled();
      expect(
        within(dialog).getByText(words("resources.resourceActions.confirm.version.locked"))
      ).toBeVisible();

      await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

      await waitFor(() => expect(body).toEqual({ filter: statusFilter }));
    });

    test("WHEN the scope leaves isOrphan unset THEN the dry run runs on the latest released version", async () => {
      // Without a version selector the server resolves each resource at its own latest version,
      // so orphans would pull in older versions and the dry run would be rejected.
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

    test("WHEN the picker is opened with the keyboard THEN the search box has focus and Down moves to the first version", async () => {
      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      within(dialog).getByRole("button", { name: versionToggleLabel }).focus();
      await userEvent.keyboard("{Enter}");

      await waitFor(() => expect(screen.getByLabelText(searchLabel)).toHaveFocus());

      await userEvent.keyboard("{ArrowDown}");

      expect(screen.getAllByRole("option")[0]).toHaveFocus();
    });

    test("WHEN the list is scrolled to its end THEN the next versions load", async () => {
      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionToggleLabel }));
      expect(screen.getAllByRole("option")).toHaveLength(firstPage.length);

      fireEvent.scroll(screen.getByRole("listbox"));

      expect(
        await screen.findByRole("option", { name: new RegExp(versionLabel(notLoaded[0].version)) })
      ).toBeVisible();
      await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(versions.length));
    });

    test("WHEN digits of a loaded version are typed THEN the list narrows to it without a lookup", async () => {
      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionToggleLabel }));

      // The lookup waits for a pause in typing, so the clock is moved past that pause instead of
      // waiting it out. Leading zeros still read as the version.
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      try {
        fireEvent.change(screen.getByLabelText(searchLabel), {
          target: { value: `0${activeVersion}` },
        });
        act(() => {
          vi.runOnlyPendingTimers();
        });
      } finally {
        vi.useRealTimers();
      }

      const narrowed = firstPage.filter((version) =>
        String(version.version).startsWith(String(activeVersion))
      );

      expect(screen.getAllByRole("option")).toHaveLength(narrowed.length);
      expect(
        screen.getByRole("option", { name: new RegExp(versionLabel(activeVersion)) })
      ).toBeVisible();
      // A lookup would have added a query for the typed version.
      expect(
        testClient
          .getQueryCache()
          .findAll({ queryKey: getDesiredStateVersionKey.single(String(activeVersion)) })
      ).toEqual([]);
    });

    test("WHEN looking up a version fails THEN the list says so instead of finding nothing", async () => {
      server.use(
        http.get("/api/v2/desiredstate", ({ request }) =>
          new URL(request.url).searchParams.has("filter.version")
            ? HttpResponse.json({ message: "lookup failed" }, { status: 500 })
            : HttpResponse.json(
                versionPage(versions, (version) => version.version, new URL(request.url))
              )
        )
      );
      const oldest = notLoaded[notLoaded.length - 1].version;

      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionToggleLabel }));
      await userEvent.type(screen.getByLabelText(searchLabel), String(oldest));

      expect(
        await screen.findByText(
          words("resources.resourceActions.confirm.version.lookupError")(String(oldest))
        )
      ).toBeVisible();
      expect(
        screen.queryByText(words("resources.resourceActions.confirm.version.noResults"))
      ).not.toBeInTheDocument();
    });

    test("WHEN a version that isn't loaded is typed THEN it is looked up and can be picked", async () => {
      const oldest = notLoaded[notLoaded.length - 1].version;

      render(setup({ scopes: filteredScopes, tooltips }));

      const dialog = await openDryRun();

      await userEvent.click(within(dialog).getByRole("button", { name: versionToggleLabel }));
      await userEvent.type(screen.getByLabelText(searchLabel), String(oldest));

      // Nothing loaded matches, so the list only shows the lookup running.
      expect(screen.getAllByRole("option")).toEqual([
        screen.getByRole("option", { name: words("loading") }),
      ]);

      const found = await screen.findByRole("option", { name: new RegExp(versionLabel(oldest)) });

      expect(screen.getAllByRole("option")).toHaveLength(1);
      await userEvent.click(found);
      await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

      await waitFor(() =>
        expect(body).toEqual({ filter: { agent: filter.agent, modelVersion: oldest } })
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
      const [newest, older, unexported] = historyData.map((log) => Number(log.version));
      const dateOf = (version: number) =>
        historyData.find((log) => Number(log.version) === version)!.timestamp;
      // The model version the server resolves each instance version to; null is never exported.
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
      const instanceVersionLabel = (version: number) =>
        words("resources.resourceActions.confirm.version.instanceOption")(String(version));
      const mapsTo = words("resources.resourceActions.confirm.version.mapsTo");

      beforeEach(() => {
        modelVersionOf = { [newest]: activeVersion, [older]: candidateVersion, [unexported]: null };
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

        // The picker shows the newest instance version once the history is loaded.
        expect(await within(dialog).findByText(instanceVersionLabel(newest))).toBeVisible();

        return dialog;
      };

      const pickInstanceVersion = async (dialog: HTMLElement, version: number) => {
        await userEvent.click(within(dialog).getByRole("button", { name: versionToggleLabel }));
        await userEvent.click(
          screen.getByRole("option", { name: new RegExp(instanceVersionLabel(version)) })
        );
      };

      test("WHEN Dry run is chosen THEN the dialog names the instance and shows its newest version with the model version behind it", async () => {
        const dialog = await openInstanceDryRun();
        const toggle = within(dialog).getByRole("button", { name: versionToggleLabel });

        expect(
          within(dialog).getByText(
            words("resources.resourceActions.confirm.titleFor")(dryRunLabel, instance.name)
          )
        ).toBeVisible();
        expect(
          await within(toggle).findByText(mapsTo(String(modelVersionOf[newest])))
        ).toBeVisible();
        expect(
          within(toggle).getByText(new CustomDatePresenter().getFull(dateOf(newest)))
        ).toBeVisible();

        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() => expect(body).toEqual({ filter: instanceFilter }));
      });

      test("WHEN an earlier instance version is picked THEN the filter pins that instance version", async () => {
        const dialog = await openInstanceDryRun();

        await pickInstanceVersion(dialog, older);
        expect(
          await within(dialog).findByText(mapsTo(String(modelVersionOf[older])))
        ).toBeVisible();
        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() =>
          expect(body).toEqual({
            filter: { serviceInstance: instanceFilter.serviceInstance, instanceVersion: older },
          })
        );
      });

      test("WHEN a picked instance version was never released THEN it says so and blocks the dry run", async () => {
        const dialog = await openInstanceDryRun();

        await pickInstanceVersion(dialog, unexported);

        expect(
          await within(dialog).findByText(
            words("resources.resourceActions.confirm.version.unexported")(String(unexported))
          )
        ).toBeVisible();
        expect(within(dialog).getByRole("button", { name: dryRunLabel })).toBeDisabled();
      });

      test("WHEN the newest instance version is not released yet THEN the default falls back to the latest released one", async () => {
        modelVersionOf[newest] = null;

        const dialog = await openInstanceDryRun();

        expect(
          await within(dialog).findByText(
            words("resources.resourceActions.confirm.version.unexported.default")(String(newest))
          )
        ).toBeVisible();

        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() => expect(body).toEqual({ filter: instanceFilter }));
      });

      test("WHEN an instance version number is searched THEN only that version is listed", async () => {
        const dialog = await openInstanceDryRun();

        await userEvent.click(within(dialog).getByRole("button", { name: versionToggleLabel }));
        await userEvent.type(screen.getByLabelText(searchLabel), String(unexported));

        expect(
          await screen.findByRole("option", { name: new RegExp(instanceVersionLabel(unexported)) })
        ).toBeVisible();
        expect(screen.getAllByRole("option")).toHaveLength(1);
      });

      test("WHEN an instance version that isn't loaded is typed THEN it is looked up and can be picked", async () => {
        // The history pages two versions at a time, so the oldest one isn't loaded.
        server.use(
          http.get("/lsm/v1/service_inventory/:entity/:id/log", ({ request }) =>
            HttpResponse.json(
              versionPage(historyData, (log) => Number(log.version), new URL(request.url), 2)
            )
          )
        );
        modelVersionOf[unexported] = candidateVersion;

        const dialog = await openInstanceDryRun();

        await userEvent.click(within(dialog).getByRole("button", { name: versionToggleLabel }));
        await userEvent.type(screen.getByLabelText(searchLabel), String(unexported));

        // Nothing loaded matches, so the list only shows the lookup running.
        expect(screen.getAllByRole("option")).toEqual([
          screen.getByRole("option", { name: words("loading") }),
        ]);

        await userEvent.click(
          await screen.findByRole("option", { name: new RegExp(instanceVersionLabel(unexported)) })
        );
        expect(
          await within(dialog).findByText(mapsTo(String(modelVersionOf[unexported])))
        ).toBeVisible();
        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() =>
          expect(body).toEqual({
            filter: {
              serviceInstance: instanceFilter.serviceInstance,
              instanceVersion: unexported,
            },
          })
        );
      });

      test("WHEN the model version type is used THEN the filter pins a model version instead", async () => {
        const dialog = await openInstanceDryRun();

        await userEvent.click(
          within(dialog).getByRole("button", {
            name: words("resources.resourceActions.confirm.version.type.model"),
          })
        );
        expect(await within(dialog).findByText(versionLabel(activeVersion))).toBeVisible();

        await userEvent.click(within(dialog).getByRole("button", { name: versionToggleLabel }));
        await userEvent.click(
          screen.getByRole("option", { name: new RegExp(versionLabel(candidateVersion)) })
        );
        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() =>
          expect(body).toEqual({
            filter: {
              serviceInstance: instanceFilter.serviceInstance,
              modelVersion: candidateVersion,
            },
          })
        );
      });

      test("WHEN the owned scope is chosen THEN the version stays on the latest one", async () => {
        const dialog = await openInstanceDryRun();

        // Pick an earlier version first, so the lock has something to override.
        await pickInstanceVersion(dialog, older);
        await userEvent.click(
          within(dialog).getByRole("radio", {
            name: new RegExp(words("resources.resourceActions.confirm.owned.title"), "i"),
          })
        );

        expect(within(dialog).getByRole("button", { name: versionToggleLabel })).toBeDisabled();
        expect(
          within(dialog).getByText(words("resources.resourceActions.confirm.version.owned.locked"))
        ).toBeVisible();

        await userEvent.click(within(dialog).getByRole("button", { name: dryRunLabel }));

        await waitFor(() => expect(body).toEqual({ filter: ownedFilter }));
      });
    });
  });
});
