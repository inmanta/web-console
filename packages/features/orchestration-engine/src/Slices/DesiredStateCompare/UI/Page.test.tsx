import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { configureAxe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { Resource, words, getFeatureRoutes } from "@inmanta/web-console-core";
import { orchestrationEngineFeature } from "@inmanta/web-console-feature-orchestration-engine";
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

function setup() {
  const component = (
    <TestMemoryRouter initialEntries={[`/?env=${environment}`]}>
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

  test("GIVEN DesiredStateCompare THEN each diff entry links to its resource details page", async () => {
    const { component } = setup();

    render(component);

    await screen.findAllByTestId("DiffBlock");

    const resourceId = DesiredStateDiff.response.data[0].resource_id;
    const link = screen.getByRole("link", { name: resourceId });
    const href = link.getAttribute("href") ?? "";

    // The link points at the resource details page for this resource, keeping the environment.
    expect(href).toMatch(/^\/resources\//);
    expect(decodeURIComponent(href)).toContain(resourceId);
    expect(href).toContain(`env=${environment}`);
  });

  test("GIVEN DesiredStateCompare THEN shows 'Jump To' action with dropdown", async () => {
    const { component } = setup();

    render(component);

    const button = await screen.findByRole("button", { name: words("jumpTo") });

    expect(button).toBeVisible();
    expect(screen.queryByRole("menu", { name: "DiffSummaryList" })).not.toBeInTheDocument();

    await userEvent.click(button);

    const menu = await screen.findByRole("menu", { name: "DiffSummaryList" });
    expect(menu).toBeVisible();
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

  test("GIVEN DesiredStateCompare WHEN File Resource THEN it shows prompt that can fetch file content, and Retry fetches only the file that failed", async () => {
    const { component } = setup();

    render(component);

    const blocks = await screen.findAllByTestId("DiffBlock");

    await userEvent.click(within(blocks[1]).getByLabelText("Details"));

    const fileDiffLabel = words("desiredState.compare.attributeChanges")("hash");

    await userEvent.click(
      within(blocks[1]).getByRole("button", { name: words("desiredState.compare.file.show") })
    );

    expect(
      await within(blocks[1]).findByText(words("desiredState.compare.file.title"))
    ).toBeVisible();
    expect(within(blocks[1]).getByLabelText(fileDiffLabel)).toBeVisible();

    await userEvent.click(
      within(blocks[1]).getByRole("button", {
        name: words("desiredState.compare.file.hideAriaLabel")(
          DesiredStateDiff.resources[1].resource_id
        ),
      })
    );

    expect(within(blocks[1]).queryByLabelText(fileDiffLabel)).not.toBeInTheDocument();

    await userEvent.click(
      within(blocks[1]).getByRole("button", { name: words("desiredState.compare.file.show") })
    );

    expect(await within(blocks[1]).findByRole("button", { name: words("retry") })).toBeVisible();
    expect(
      within(blocks[1]).queryByRole("button", { name: words("desiredState.compare.file.show") })
    ).not.toBeInTheDocument();

    await userEvent.click(within(blocks[1]).getByRole("button", { name: words("retry") }));

    expect(
      await within(blocks[1]).findByText(words("desiredState.compare.file.title"))
    ).toBeVisible();
    expect(within(blocks[1]).getByLabelText(fileDiffLabel)).toBeVisible();
    expect(requestCountFile1234).toBe(3);
    expect(requestCountFile5678).toBe(2);

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateCompare WHEN a modified resource is opened THEN its attributes show in a table with both versions and the changed part marked", async () => {
    const { component } = setup();

    render(component);

    const resource = DesiredStateDiff.resources[7];
    const { ip } = resource.attributes;
    const blocks = await screen.findAllByTestId("DiffBlock");

    await userEvent.click(within(blocks[7]).getByLabelText("Details"));

    const table = within(blocks[7]).getByRole("grid", {
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

  test("GIVEN DesiredStateCompare WHEN a deleted resource is opened THEN it shows the deleted note and the new version as not present", async () => {
    const { component } = setup();

    render(component);

    const resource = DesiredStateDiff.resources[4];
    const blocks = await screen.findAllByTestId("DiffBlock");

    await userEvent.click(within(blocks[4]).getByLabelText("Details"));

    expect(within(blocks[4]).getByText(words("desiredState.compare.deleted"))).toBeVisible();

    const table = within(blocks[4]).getByRole("grid", {
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

  test("GIVEN DesiredStateCompare WHEN a resource with only a long value is opened THEN the value shows as a line diff without column headers", async () => {
    const { component } = setup();

    render(component);

    const resource = DesiredStateDiff.resources[2];
    const blocks = await screen.findAllByTestId("DiffBlock");

    await userEvent.click(within(blocks[2]).getByLabelText("Details"));

    await waitFor(() =>
      expect(
        within(blocks[2]).getByLabelText(
          words("desiredState.compare.attributeChanges")("next_version")
        )
      ).toBeVisible()
    );

    const table = within(blocks[2]).getByRole("grid", {
      name: words("desiredState.compare.attributes")(resource.resource_id),
    });

    expect(within(table).queryByRole("columnheader")).not.toBeInTheDocument();
  });

  test("GIVEN DesiredStateCompare WHEN a resource whose agent is down is opened THEN it shows the agent down note without a table", async () => {
    const { component } = setup();

    render(component);

    const resource = DesiredStateDiff.resources[8];
    const agentName = Resource.IdParser.getAgentName(resource.resource_id) ?? "";
    const blocks = await screen.findAllByTestId("DiffBlock");

    await userEvent.click(within(blocks[8]).getByLabelText("Details"));

    expect(
      within(blocks[8]).getByText(words("desiredState.compare.agent_down")(agentName))
    ).toBeVisible();
    expect(within(blocks[8]).queryByRole("grid")).not.toBeInTheDocument();
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
