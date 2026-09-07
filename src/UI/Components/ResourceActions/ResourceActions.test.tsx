import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { NonEmptyArray } from "@/Core/Language";
import { ResourceActionFilter } from "@/Data/Queries";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ResourceActionScope } from "./ResourceActionConfirmModal";
import { ResourceActions } from "./ResourceActions";

const filter: ResourceActionFilter = { isOrphan: false, agent: { eq: ["internal"] } };
const deployLabel = words("resources.compoundStateSummary.deploy");
const repairLabel = words("resources.compoundStateSummary.repair");
const toggleLabel = words("resources.resourceActions.toggle");

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

function setup(props: React.ComponentProps<typeof ResourceActions> = { filter }) {
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

    render(setup({ scopes: filteredScopes }));

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

    render(setup({ scopes: filteredScopes }));

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

    render(setup({ scopes: instanceScopes }));

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

    render(setup({ scopes: emptyThenFull }));

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

    render(setup({ scopes: mixedScopes }));

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
    render(setup({ scopes: orphanScope }));

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
    render(setup({ filter, disabledReason: "nope" }));

    expect(screen.getByRole("button", { name: toggleLabel })).toBeDisabled();
    expect(screen.getByRole("button", { name: deployLabel })).toBeDisabled();
  });
});
