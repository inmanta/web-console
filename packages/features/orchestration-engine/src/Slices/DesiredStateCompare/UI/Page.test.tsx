import { act } from "react";
import { Route, Routes, useLocation } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { delay, http, HttpResponse } from "msw";
import { Diff, Resource, words, getFeatureRoutes } from "@inmanta/web-console-core";
import { SearchHelper } from "@inmanta/web-console-core/Routing";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
import {
  findResourceListRows,
  getResourceListGroupRows,
  getResourceListRow,
  getResourceListRows,
  selectResource,
} from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/Spec/resourceListQueries";
import { getAttributeValueOrId } from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/helpers";
import {
  MockedDependencyProvider,
  DesiredStateDiff,
  stubRoute,
} from "@inmanta/web-console-test-utils";
import * as DesiredStateVersionsMock from "@inmanta/web-console-test-utils/Data/DesiredStateVersions";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import { path } from "../Core/Route";
import { Page } from "./Page";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const environment = "aaa";
const searchHelper = new SearchHelper();

/**
 * Returns the first item that matches, and throws when none does, so a changed mock fails with a
 * clear message instead of an undefined further down.
 */
const getFirstMatch = <Item,>(
  items: Item[],
  isMatch: (item: Item) => boolean,
  description: string
): Item => {
  const match = items.find(isMatch);

  if (match === undefined) {
    throw new Error(`The mock data has no ${description}.`);
  }

  return match;
};

// All model versions fit in one page, so the selects never load more or look one up.
const modelVersions = DesiredStateVersionsMock.response.data;
const activeModelVersion = getFirstMatch(
  modelVersions,
  ({ status }) => status === "active",
  "active model version"
);
const retiredModelVersion = getFirstMatch(
  modelVersions,
  ({ status }) => status === "retired",
  "retired model version"
);
const toModelVersion = String(activeModelVersion.version);
const fromModelVersion = String(retiredModelVersion.version);
// Another model version older than the "to" side, for the tests that change the "from" side.
const newFromModelVersion = String(
  getFirstMatch(
    modelVersions,
    ({ version }) =>
      version < activeModelVersion.version && version !== retiredModelVersion.version,
    "second model version older than the active one"
  ).version
);

const resourcesShownByDefault = DesiredStateDiff.resources.filter((resource) =>
  Diff.defaultStatuses.includes(resource.status)
);

/**
 * Shows the current pathname and search, so a test can check where a select navigated to.
 */
const LocationProbe: React.FC = () => {
  const { pathname, search } = useLocation();

  return <div data-testid="location">{JSON.stringify({ pathname, search })}</div>;
};

const getLocation = (): { pathname: string; search: string } =>
  JSON.parse(screen.getByTestId("location").textContent ?? "");

/**
 * Waits until the model version select of one side of the diff shows the given model version,
 * both in its text and in its name for screen readers. That also means the model versions to list
 * are loaded.
 */
const findModelVersionSelect = async (
  side: "from" | "to",
  modelVersion: string
): Promise<HTMLElement> => {
  const toggle = await screen.findByRole("button", {
    name: words("versionSelect.toggle")(
      words(`desiredState.compare.${side}ModelVersion`),
      words("modelVersion")(modelVersion)
    ),
  });

  expect(within(toggle).getByText(words("modelVersion")(modelVersion))).toBeVisible();

  return toggle;
};

/**
 * The option of the given model version in the open model version select.
 */
const getModelVersionOption = (modelVersion: number | string): HTMLElement => {
  const option = screen
    .getAllByRole("option")
    .find((candidate) => within(candidate).queryByText(words("modelVersion")(modelVersion)));

  if (!option) {
    throw new Error(`No option for model version ${modelVersion}`);
  }

  return option;
};

function setup(search = `?env=${environment}`) {
  const component = (
    <TestMemoryRouter
      initialEntries={[`/desiredstate/compare/${fromModelVersion}/${toModelVersion}${search}`]}
    >
      <QueryClientProvider client={testClient}>
        <MockedDependencyProvider
          features={[orchestrationEngineFeature]}
          routes={[...getFeatureRoutes([orchestrationEngineFeature]), stubRoute("ResourceDetails")]}
        >
          <Routes>
            <Route path={path} element={<Page />} />
          </Routes>
          <LocationProbe />
        </MockedDependencyProvider>
      </QueryClientProvider>
    </TestMemoryRouter>
  );

  return { component };
}

describe("DesiredStateCompare", () => {
  // The file ending in 1234 fails on its second request only, the one ending in 5678 never fails.
  let requestCountFile1234 = 0;
  let requestCountFile5678 = 0;
  const server = setupTestServer(
    http.get("/api/v2/desiredstate/diff/:from/:to", () =>
      HttpResponse.json(DesiredStateDiff.response)
    ),
    http.get("/api/v2/desiredstate", () => HttpResponse.json(DesiredStateVersionsMock.response)),
    http.get("/api/v1/file/a47be15ee60a88c7bcc4bce900d921a8d34d1234", () => {
      requestCountFile1234++;

      if (requestCountFile1234 === 2) {
        return HttpResponse.json({ message: "error" }, { status: 500 });
      }

      return HttpResponse.json({ content: window.btoa("abcdefgh") });
    }),
    http.get("/api/v1/file/a47be15ee60a88c7bcc4bce900d921a8d34d5678", () => {
      requestCountFile5678++;

      return HttpResponse.json({ content: window.btoa("efghijkl") });
    })
  );

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    testClient.clear();
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  test("GIVEN DesiredStateCompare THEN the header shows both model versions in their selects", async () => {
    const { component } = setup();

    render(component);

    await findModelVersionSelect("from", fromModelVersion);
    await findModelVersionSelect("to", toModelVersion);
  });

  test("GIVEN DesiredStateCompare WHEN the model versions fail to load THEN both selects still show their model version, and an opened select says the list couldn't be loaded", async () => {
    server.use(
      http.get("/api/v2/desiredstate", ({ request }) => {
        const url = new URL(request.url);
        const [lowerBound] = url.searchParams.getAll("filter.version");

        if (!lowerBound) {
          return HttpResponse.json({ message: "error" }, { status: 500 });
        }
        const data = modelVersions.filter(({ version }) => `ge:${version}` === lowerBound);

        return HttpResponse.json({ data, links: { self: url.pathname } });
      })
    );
    const { component } = setup();

    render(component);

    await findModelVersionSelect("from", fromModelVersion);
    await userEvent.click(await findModelVersionSelect("to", toModelVersion));

    expect(
      await screen.findByText(words("desiredState.compare.modelVersionsLoadError"))
    ).toBeVisible();
    expect(screen.getAllByText(words("desiredState.compare.modelVersionsLoadError"))).toHaveLength(
      1
    );
  });

  test("GIVEN DesiredStateCompare WHEN the From model version isn't among the loaded model versions THEN it is looked up on its own and shows in its select", async () => {
    server.use(
      http.get("/api/v2/desiredstate", ({ request }) => {
        const url = new URL(request.url);
        const isLookup = url.searchParams.has("filter.version");
        const data = modelVersions.filter(
          ({ version }) => (String(version) === fromModelVersion) === isLookup
        );

        return HttpResponse.json({ data, links: { self: url.pathname } });
      })
    );
    const { component } = setup();

    render(component);

    await findModelVersionSelect("from", fromModelVersion);
  });

  test("GIVEN DesiredStateCompare WHEN the diff takes a while to load THEN the header and filters show, with the resource list and diff loading in their place", async () => {
    server.use(
      http.get("/api/v2/desiredstate/diff/:from/:to", async () => {
        await delay("infinite");
      })
    );
    const { component } = setup();

    render(component);

    await findModelVersionSelect("from", fromModelVersion);
    expect(
      await screen.findByText(words("desiredState.compare.loading.resources"))
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: new RegExp(words("filters")) })).toBeVisible();
    expect(screen.getByText(words("desiredState.compare.loading.diff"))).toBeInTheDocument();
    expect(screen.queryByRole("row", { selected: true })).not.toBeInTheDocument();
  });

  test("GIVEN DesiredStateCompare WHEN the From select is opened THEN the model versions from the To version on can't be selected", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(await findModelVersionSelect("from", fromModelVersion));

    for (const { version } of modelVersions) {
      const option = getModelVersionOption(version);

      if (version >= Number(toModelVersion)) {
        expect(option).toBeDisabled();
      } else {
        expect(option).toBeEnabled();
      }
    }
  });

  test("GIVEN DesiredStateCompare WHEN the To select is opened THEN the model versions up to the From version can't be selected", async () => {
    const { component } = setup();

    render(component);

    await userEvent.click(await findModelVersionSelect("to", toModelVersion));

    for (const { version } of modelVersions) {
      const option = getModelVersionOption(version);

      if (version <= Number(fromModelVersion)) {
        expect(option).toBeDisabled();
      } else {
        expect(option).toBeEnabled();
      }
    }
  });

  test("GIVEN DesiredStateCompare WHEN another model version is selected THEN the diff of the new model versions shows and the URL keeps its search, with the selected resource", async () => {
    const resource = DesiredStateDiff.resources[4];
    const search = searchHelper.stringify({
      env: environment,
      state: { DesiredStateCompare: { resource: resource.resource_id } },
    });
    // The new diff holds two resources, so it can't be mistaken for the previous one. The modified
    // one is listed first, so the selection only stays on the deleted one through the URL.
    const modifiedResource = getFirstMatch(
      DesiredStateDiff.resources,
      ({ status }) => status === "modified",
      "modified resource"
    );

    server.use(
      http.get(`/api/v2/desiredstate/diff/${newFromModelVersion}/${toModelVersion}`, () =>
        HttpResponse.json({ data: [modifiedResource, resource] })
      )
    );
    const { component } = setup(search);

    render(component);

    await findResourceListRows();
    await userEvent.click(await findModelVersionSelect("from", fromModelVersion));
    await userEvent.click(getModelVersionOption(newFromModelVersion));

    expect(getLocation()).toEqual({
      pathname: `/desiredstate/compare/${newFromModelVersion}/${toModelVersion}`,
      search,
    });
    await findModelVersionSelect("from", newFromModelVersion);
    await waitFor(() => expect(getResourceListRows()).toHaveLength(2));
    expect(getResourceListRows()[0]).toBe(getResourceListRow(modifiedResource.resource_id));
    expect(getResourceListRow(modifiedResource.resource_id)).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(getResourceListRow(resource.resource_id)).toHaveAttribute("aria-selected", "true");
  });

  test("GIVEN DesiredStateCompare WHEN another model version is selected and its diff loads fast THEN the previous diff stays until the new one replaces it, without loading placeholders", async () => {
    const newResources = resourcesShownByDefault.slice(0, 2);

    server.use(
      http.get(`/api/v2/desiredstate/diff/${newFromModelVersion}/${toModelVersion}`, async () => {
        await delay(100);

        return HttpResponse.json({ data: newResources });
      })
    );
    const { component } = setup();

    render(component);

    await findResourceListRows();
    await userEvent.click(await findModelVersionSelect("from", fromModelVersion));
    await userEvent.click(getModelVersionOption(newFromModelVersion));

    expect(getResourceListRows()).toHaveLength(resourcesShownByDefault.length);
    expect(
      screen.getByRole("columnheader", { name: words("modelVersion")(fromModelVersion) })
    ).toBeVisible();
    expect(
      screen.queryByText(words("desiredState.compare.loading.resources"))
    ).not.toBeInTheDocument();

    await waitFor(() => expect(getResourceListRows()).toHaveLength(newResources.length));
    expect(
      screen.getByRole("columnheader", { name: words("modelVersion")(newFromModelVersion) })
    ).toBeVisible();
    expect(
      screen.queryByText(words("desiredState.compare.loading.resources"))
    ).not.toBeInTheDocument();
  });

  test("GIVEN DesiredStateCompare THEN the resources show in one group per status, changes first", async () => {
    const { component } = setup();

    render(component);

    expect(await findResourceListRows()).toHaveLength(resourcesShownByDefault.length);

    const statusOrder: Diff.Status[] = [
      "modified",
      "added",
      "deleted",
      "agent_down",
      "undefined",
      "skipped_for_undefined",
    ];
    const groupTitles = getResourceListGroupRows().map((row) => row.textContent);

    expect(groupTitles).toEqual(
      statusOrder.map(
        (status) =>
          `${words(`desiredState.compare.status.${status}`)}${
            resourcesShownByDefault.filter((resource) => resource.status === status).length
          }`
      )
    );

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare THEN the first resource in the list is selected and its diff header links to its resource details page", async () => {
    const { component } = setup();

    render(component);

    const [firstRow] = await findResourceListRows();
    // The first group is modified, sorted by id.
    const firstResource = resourcesShownByDefault
      .filter((resource) => resource.status === "modified")
      .sort((a, b) => a.resource_id.localeCompare(b.resource_id))[0];

    expect(firstRow).toHaveAttribute("aria-selected", "true");
    expect(firstRow).toBe(getResourceListRow(firstResource.resource_id));
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: getAttributeValueOrId(firstResource.resource_id),
      })
    ).toBeVisible();

    const href =
      screen
        .getByRole("link", { name: words("desiredState.resourceDetails.title") })
        .getAttribute("href") ?? "";

    // The link points at the resource details page for this resource, keeping the environment.
    expect(href).toMatch(/^\/resources\//);
    expect(decodeURIComponent(href)).toContain(firstResource.resource_id);
    expect(href).toContain(`env=${environment}`);
  });

  test("GIVEN DesiredStateCompare WHEN Next, Previous and the arrow keys are used THEN the neighbouring resource in the list is selected", async () => {
    const { component } = setup();

    render(component);

    const rows = await findResourceListRows();
    const previous = screen.getByRole("button", { name: words("previous") });
    const next = screen.getByRole("button", { name: words("next") });

    expect(previous).toHaveAttribute("aria-disabled", "true");

    await userEvent.click(next);

    expect(getResourceListRows()[1]).toHaveAttribute("aria-selected", "true");
    expect(previous).not.toHaveAttribute("aria-disabled");

    await userEvent.click(previous);

    expect(getResourceListRows()[0]).toHaveAttribute("aria-selected", "true");

    rows[0].focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");

    expect(getResourceListRows()[2]).toHaveAttribute("aria-selected", "true");
    expect(getResourceListRows()[2]).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");

    expect(getResourceListRows()[1]).toHaveAttribute("aria-selected", "true");

    const listRows = getResourceListRows();

    await userEvent.click(listRows[listRows.length - 2]);
    await userEvent.click(next);

    expect(getResourceListRows()[listRows.length - 1]).toHaveAttribute("aria-selected", "true");
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(next).toHaveFocus();
  });

  test("GIVEN DesiredStateCompare WHEN the URL names a resource THEN that resource is selected", async () => {
    const resource = DesiredStateDiff.resources[4];
    const search = searchHelper.stringify({
      env: environment,
      state: { DesiredStateCompare: { resource: resource.resource_id } },
    });
    const { component } = setup(search);

    render(component);

    await findResourceListRows();

    expect(getResourceListRow(resource.resource_id)).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: getAttributeValueOrId(resource.resource_id),
      })
    ).toBeVisible();
  });

  test("GIVEN DesiredStateCompare WHEN the URL names a resource the filters hide THEN the first resource in the list is selected", async () => {
    const [hiddenResource] = DesiredStateDiff.resources.filter(
      ({ status }) => !Diff.defaultStatuses.includes(status)
    );
    const search = searchHelper.stringify({
      env: environment,
      state: { DesiredStateCompare: { resource: hiddenResource.resource_id } },
    });
    const { component } = setup(search);

    render(component);

    const [firstRow] = await findResourceListRows();

    expect(firstRow).toHaveAttribute("aria-selected", "true");
    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: getAttributeValueOrId(hiddenResource.resource_id),
      })
    ).not.toBeInTheDocument();
  });

  test("GIVEN DesiredStateCompare WHEN the statuses are changed in the filter drawer THEN only the resources with a ticked status show", async () => {
    const { component } = setup();
    const unmodifiedCount = DesiredStateDiff.resources.length - resourcesShownByDefault.length;
    const addedCount = DesiredStateDiff.resources.filter(({ status }) => status === "added").length;

    render(component);

    expect(await findResourceListRows()).toHaveLength(resourcesShownByDefault.length);

    expect(
      screen.getByText(
        words("desiredState.compare.filters.resourceCount")(
          resourcesShownByDefault.length,
          unmodifiedCount
        )
      )
    ).toBeVisible();

    // The badge counts every ticked status.
    const filtersToggle = screen.getByRole("button", {
      name: new RegExp(`^${Diff.defaultStatuses.length}\\s*${words("filters")}$`),
    });

    await userEvent.click(filtersToggle);

    expect(filtersToggle).toHaveAttribute("aria-pressed", "true");

    const unmodifiedCheckbox = await screen.findByRole("checkbox", {
      name: new RegExp(words("desiredState.compare.status.unmodified")),
    });

    expect(unmodifiedCheckbox).not.toBeChecked();

    await userEvent.click(unmodifiedCheckbox);

    expect(getResourceListRows()).toHaveLength(DesiredStateDiff.resources.length);
    expect(
      screen.getByText(
        words("desiredState.compare.filters.resourceCount")(DesiredStateDiff.resources.length, 0)
      )
    ).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(words("resources.filters.active.group.close")(words("status"))),
      })
    );

    // With every status unticked, the empty view offers to reset the filters to default.
    const emptyView = screen.getByLabelText("ResourceListWithDiffPane-Empty");

    expect(within(emptyView).getByText(words("empty.filtered.title"))).toBeVisible();
    expect(
      within(emptyView).getByText(words("empty.filtered.resetToDefault.message"))
    ).toBeVisible();
    expect(
      within(emptyView).getByRole("button", {
        name: words("resources.filters.active.resetToDefault"),
      })
    ).toBeVisible();
    // Unticking every status is a filter too, so the drawer doesn't say none are applied.
    expect(
      screen.queryByText(words("resources.filters.active.empty.title"))
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("checkbox", {
        name: new RegExp(words("desiredState.compare.status.added")),
      })
    );

    expect(getResourceListRows()).toHaveLength(addedCount);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });

    await userEvent.click(
      screen.getByRole("button", { name: words("resources.filters.active.resetToDefault") })
    );

    expect(getResourceListRows()).toHaveLength(resourcesShownByDefault.length);

    // The same toggle closes the drawer again.
    await userEvent.click(filtersToggle);

    expect(filtersToggle).toHaveAttribute("aria-pressed", "false");
  });

  test("GIVEN DesiredStateCompare WHEN File Resource THEN it shows prompt that can fetch file content, and Retry fetches only the file that failed", async () => {
    const { component } = setup();

    render(component);

    await selectResource(DesiredStateDiff.resources[1].resource_id);

    const fileDiffLabel = words("desiredState.compare.changes")("hash");
    const openHashRowKebab = () =>
      userEvent.click(screen.getByRole("button", { name: "Kebab toggle" }));
    const getCompareFileContentItem = () =>
      screen.getByRole("menuitem", { name: words("desiredState.compare.file.show") });

    await openHashRowKebab();
    await userEvent.click(getCompareFileContentItem());

    expect(await screen.findByText(words("desiredState.compare.file.title"))).toBeVisible();
    expect(screen.getByLabelText(fileDiffLabel)).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", { name: words("desiredState.compare.file.hide") })
    );

    expect(screen.queryByLabelText(fileDiffLabel)).not.toBeInTheDocument();

    await openHashRowKebab();
    await userEvent.click(getCompareFileContentItem());

    expect(await screen.findByRole("button", { name: words("retry") })).toBeVisible();

    await openHashRowKebab();

    expect(getCompareFileContentItem()).toBeDisabled();

    await userEvent.keyboard("{Escape}");

    await userEvent.click(screen.getByRole("button", { name: words("retry") }));

    expect(await screen.findByText(words("desiredState.compare.file.title"))).toBeVisible();
    expect(screen.getByLabelText(fileDiffLabel)).toBeVisible();
    expect(requestCountFile1234).toBe(3);
    expect(requestCountFile5678).toBe(2);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare WHEN a modified resource is selected THEN its attributes show in a table with both versions and the changed part marked", async () => {
    const { component } = setup();

    render(component);

    const resource = DesiredStateDiff.resources[7];
    const { ip } = resource.attributes;

    await selectResource(resource.resource_id);

    const table = screen.getByRole("table", {
      name: words("desiredState.compare.attributes")(resource.resource_id),
    });
    const headers = within(table)
      .getAllByRole("columnheader")
      .map((header) => header.textContent);

    expect(headers).toEqual([
      words("attribute"),
      words("modelVersion")(fromModelVersion),
      words("modelVersion")(toModelVersion),
    ]);

    const ipRow = within(table).getByRole("row", { name: /^ip / });
    const [fromCell, toCell] = within(ipRow).getAllByRole("cell");

    expect(fromCell).toHaveTextContent(ip.from_value_compare);
    expect(toCell).toHaveTextContent(ip.to_value_compare);
    // The two addresses only differ in their last character.
    expect(within(fromCell).getByText(ip.from_value_compare.slice(-1)).tagName).toBe("MARK");
    expect(within(toCell).getByText(ip.to_value_compare.slice(-1)).tagName).toBe("MARK");

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare WHEN a deleted resource is selected THEN it shows the deleted note and the new version as not present", async () => {
    const { component } = setup();

    render(component);

    const resource = DesiredStateDiff.resources[4];

    await selectResource(resource.resource_id);

    expect(screen.getByText(words("desiredState.compare.deleted"))).toBeVisible();

    const table = screen.getByRole("table", {
      name: words("desiredState.compare.attributes")(resource.resource_id),
    });
    const headers = within(table)
      .getAllByRole("columnheader")
      .map((header) => header.textContent);

    expect(headers).toEqual([
      words("attribute"),
      words("modelVersion")(fromModelVersion),
      words("modelVersion")(toModelVersion),
    ]);

    const [fromCell, toCell] = within(table).getAllByRole("cell");

    expect(fromCell).toHaveTextContent(resource.attributes.next_version.from_value_compare);
    expect(toCell).toHaveTextContent(words("desiredState.compare.notPresent"));
  });

  test("GIVEN DesiredStateCompare WHEN a resource with only a long value is selected THEN the value shows as a line diff without column headers", async () => {
    const { component } = setup();

    render(component);

    const resource = DesiredStateDiff.resources[2];

    await selectResource(resource.resource_id);

    await waitFor(() =>
      expect(
        screen.getByLabelText(words("desiredState.compare.changes")("next_version"))
      ).toBeVisible()
    );

    const table = screen.getByRole("table", {
      name: words("desiredState.compare.attributes")(resource.resource_id),
    });

    expect(within(table).queryByRole("columnheader")).not.toBeInTheDocument();
  });

  test("GIVEN DesiredStateCompare WHEN a resource whose agent is down is selected THEN it shows the agent down note without a table", async () => {
    const { component } = setup();

    render(component);

    const [resource] = DesiredStateDiff.resources.filter(({ status }) => status === "agent_down");
    const agentName = Resource.IdParser.getAgentName(resource.resource_id) ?? "";

    await selectResource(resource.resource_id);

    expect(screen.getByText(words("desiredState.compare.agent_down")(agentName))).toBeVisible();
    expect(
      screen.queryByRole("table", {
        name: words("desiredState.compare.attributes")(resource.resource_id),
      })
    ).not.toBeInTheDocument();
  });

  test("GIVEN DesiredStateCompare WHEN resource id filters are added THEN only the matching resources show, and Reset to default shows the default resources again", async () => {
    const { component } = setup();

    render(component);

    expect(await findResourceListRows()).toHaveLength(resourcesShownByDefault.length);

    await userEvent.click(screen.getByRole("button", { name: new RegExp(words("filters")) }));
    await userEvent.type(screen.getByRole("textbox", { name: words("type") }), "std{Enter}");

    expect(getResourceListRows()).toHaveLength(
      resourcesShownByDefault.filter((resource) => resource.resource_id.startsWith("std::")).length
    );

    await userEvent.type(screen.getByRole("textbox", { name: words("value") }), "44554{Enter}");

    const emptyView = screen.getByLabelText("ResourceListWithDiffPane-Empty");

    expect(within(emptyView).getByText(words("empty.filtered.title"))).toBeVisible();

    await userEvent.click(
      within(emptyView).getByRole("button", {
        name: words("resources.filters.active.resetToDefault"),
      })
    );

    expect(getResourceListRows()).toHaveLength(resourcesShownByDefault.length);
  });
});
