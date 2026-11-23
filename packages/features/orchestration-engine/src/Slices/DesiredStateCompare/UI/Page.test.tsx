import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { Diff, Resource, words, getFeatureRoutes } from "@inmanta/web-console-core";
import { SearchHelper } from "@inmanta/web-console-core/Routing";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
import {
  findResourceListRows,
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
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { setupTestServer } from "@inmanta/web-console-test-utils/Utils/setupTestServer";
import { View } from "./Page";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

const environment = "aaa";
const fromModelVersion = "123";
const toModelVersion = "456";
const searchHelper = new SearchHelper();

/** The resources the page shows by default: every one but the unmodified. */
const shownResources = DesiredStateDiff.resources.filter(
  (resource) => resource.status !== "unmodified"
);

function setup(search = `?env=${environment}`) {
  const component = (
    <TestMemoryRouter initialEntries={[`/${search}`]}>
      <QueryClientProvider client={testClient}>
        <MockedDependencyProvider
          features={[orchestrationEngineFeature]}
          routes={[...getFeatureRoutes([orchestrationEngineFeature]), stubRoute("ResourceDetails")]}
        >
          <View from={fromModelVersion} to={toModelVersion} />
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
    http.get(`/api/v2/desiredstate/diff/${fromModelVersion}/${toModelVersion}`, () => {
      return HttpResponse.json(DesiredStateDiff.response);
    }),
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
  });

  afterAll(() => {
    server.close();
  });

  test("GIVEN DesiredStateCompare THEN the header shows both model versions", async () => {
    const { component } = setup();

    render(component);

    const heading = await screen.findByRole("heading", {
      name: words("desiredState.compare.title"),
    });
    // The versions also head the columns of the diff, so look for them in the page header only.
    const header = heading.closest("section");

    if (!header) {
      throw new Error("The heading is not in a page section");
    }

    expect(within(header).getByText(words("modelVersion")(fromModelVersion))).toBeVisible();
    expect(within(header).getByText(words("modelVersion")(toModelVersion))).toBeVisible();
  });

  test("GIVEN DesiredStateCompare THEN the resources show in one group per status, changes first", async () => {
    const { component } = setup();

    render(component);

    expect(await findResourceListRows()).toHaveLength(shownResources.length);

    const statusOrder: Diff.Status[] = [
      "modified",
      "added",
      "deleted",
      "agent_down",
      "undefined",
      "skipped_for_undefined",
    ];
    // The rows that head a group are the rows without a resource.
    const groupTitles = within(screen.getByRole("grid", { name: words("resources") }))
      .getAllByRole("row")
      .filter((row) => !row.hasAttribute("aria-current"))
      .map((row) => row.textContent);

    expect(groupTitles).toEqual(
      statusOrder.map(
        (status) =>
          `${words(`desiredState.compare.status.${status}`)}${
            shownResources.filter((resource) => resource.status === status).length
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
    const firstResource = shownResources
      .filter((resource) => resource.status === "modified")
      .sort((a, b) => a.resource_id.localeCompare(b.resource_id))[0];

    expect(firstRow).toHaveAttribute("aria-current", "true");
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

    expect(previous).toBeDisabled();

    await userEvent.click(next);

    expect(getResourceListRows()[1]).toHaveAttribute("aria-current", "true");
    expect(previous).toBeEnabled();

    await userEvent.click(previous);

    expect(getResourceListRows()[0]).toHaveAttribute("aria-current", "true");

    rows[0].focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");

    expect(getResourceListRows()[2]).toHaveAttribute("aria-current", "true");
    expect(getResourceListRows()[2]).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");

    expect(getResourceListRows()[1]).toHaveAttribute("aria-current", "true");

    const listRows = getResourceListRows();

    await userEvent.click(listRows[listRows.length - 1]);

    expect(screen.getByRole("button", { name: words("next") })).toBeDisabled();
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

    expect(getResourceListRow(resource.resource_id)).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: getAttributeValueOrId(resource.resource_id),
      })
    ).toBeVisible();
  });

  test("GIVEN DesiredStateCompare WHEN the URL names a resource the filters hide THEN the first resource in the list is selected", async () => {
    // Unmodified resources are hidden by default.
    const [hiddenResource] = DesiredStateDiff.resources.filter(
      ({ status }) => status === "unmodified"
    );
    const search = searchHelper.stringify({
      env: environment,
      state: { DesiredStateCompare: { resource: hiddenResource.resource_id } },
    });
    const { component } = setup(search);

    render(component);

    const [firstRow] = await findResourceListRows();

    expect(firstRow).toHaveAttribute("aria-current", "true");
    expect(
      screen.queryByRole("heading", {
        level: 2,
        name: getAttributeValueOrId(hiddenResource.resource_id),
      })
    ).not.toBeInTheDocument();
  });

  test("GIVEN DesiredStateCompare WHEN StatusFilter = 'Added' THEN only 'Added' resources are shown", async () => {
    const { component } = setup();

    render(component);

    expect(await findResourceListRows()).toHaveLength(shownResources.length);

    expect(screen.queryByRole("listbox", { name: "StatusFilterOptions" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "StatusFilter" }));

    expect(screen.getByRole("listbox", { name: "StatusFilterOptions" })).toBeVisible();

    const statusOptions = screen.getAllByRole("option");

    expect(statusOptions).toHaveLength(6);

    await userEvent.click(screen.getByRole("button", { name: words("hideAll") }));

    await userEvent.click(statusOptions[0]);

    await waitFor(() =>
      expect(getResourceListRows()).toHaveLength(
        DesiredStateDiff.resources.filter((resource) => resource.status === "added").length
      )
    );

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare WHEN File Resource THEN it shows prompt that can fetch file content, and Retry fetches only the file that failed", async () => {
    const { component } = setup();

    render(component);

    await selectResource(DesiredStateDiff.resources[1].resource_id);

    const fileDiffLabel = words("desiredState.compare.changes")("hash");

    await userEvent.click(
      screen.getByRole("button", { name: words("desiredState.compare.file.show") })
    );

    expect(await screen.findByText(words("desiredState.compare.file.title"))).toBeVisible();
    expect(screen.getByLabelText(fileDiffLabel)).toBeVisible();

    await userEvent.click(
      screen.getByRole("button", {
        name: words("desiredState.compare.file.hideAriaLabel")(
          DesiredStateDiff.resources[1].resource_id
        ),
      })
    );

    expect(screen.queryByLabelText(fileDiffLabel)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: words("desiredState.compare.file.show") })
    );

    expect(await screen.findByRole("button", { name: words("retry") })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: words("desiredState.compare.file.show") })
    ).not.toBeInTheDocument();

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

    const table = screen.getByRole("grid", {
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

    const table = screen.getByRole("grid", {
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

    const table = screen.getByRole("grid", {
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
      screen.queryByRole("grid", {
        name: words("desiredState.compare.attributes")(resource.resource_id),
      })
    ).not.toBeInTheDocument();
  });

  test("GIVEN DesiredStateCompare page WHEN SearchFilter is used, ONLY show the resources matching the search value", async () => {
    const { component } = setup();

    render(component);

    expect(await findResourceListRows()).toHaveLength(shownResources.length);

    await userEvent.type(screen.getByRole("searchbox", { name: "SearchFilter" }), "std");

    await waitFor(() =>
      expect(getResourceListRows()).toHaveLength(
        shownResources.filter((resource) => resource.resource_id.includes("std")).length
      )
    );

    await userEvent.type(screen.getByRole("searchbox", { name: "SearchFilter" }), "44554");

    expect(await screen.findByText(words("noResults"))).toBeVisible();

    await userEvent.clear(screen.getByRole("searchbox", { name: "SearchFilter" }));

    expect(await findResourceListRows()).toHaveLength(shownResources.length);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
