import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ResourceActionFilter } from "@/Data/Queries";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { DeployActions } from "./DeployActions";
import { ScopeOption } from "./ResourceActionConfirmModal";

const filter: ResourceActionFilter = { isOrphan: false, agent: { eq: ["internal"] } };
const deployLabel = words("resources.compoundStateSummary.deploy");
const repairLabel = words("resources.compoundStateSummary.repair");
const toggleLabel = words("resources.deployActions.toggle");

const filteredScopes: ScopeOption[] = [
  {
    id: "filtered",
    title: words("resources.deployActions.confirm.filtered.title"),
    filter,
    detail: words("resources.deployActions.confirm.filtered.count")(3),
  },
  {
    id: "environment",
    title: words("resources.deployActions.confirm.environment.title"),
    filter: { isOrphan: false },
    detail: words("resources.deployActions.confirm.environment.count")(99),
  },
];

function setup(props: Partial<React.ComponentProps<typeof DeployActions>> = {}) {
  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider env={EnvironmentDetails.env}>
          <ModalProvider>
            <Page>
              <DeployActions filter={filter} {...props} />
            </Page>
          </ModalProvider>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

describe("DeployActions", () => {
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

  test("WHEN requireConfirm is set THEN Deploy opens a dialog showing the scope details and confirms against the first scope", async () => {
    let body: unknown;

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup({ requireConfirm: true, scopes: filteredScopes }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    // The details come straight from the scopes the view passes, no extra request.
    expect(within(dialog).getByText(/3 matched/)).toBeVisible();
    expect(within(dialog).getByText(/99 total/)).toBeVisible();

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

    render(setup({ requireConfirm: true, scopes: filteredScopes }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("radio", {
        name: new RegExp(words("resources.deployActions.confirm.environment.title"), "i"),
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

    const instanceScopes: ScopeOption[] = [
      {
        id: "instance",
        title: words("resources.deployActions.confirm.instance.title"),
        filter: { serviceInstance: ["abc"] },
        detail: words("resources.deployActions.confirm.instance.count")(3),
      },
      {
        id: "owned",
        title: words("resources.deployActions.confirm.owned.title"),
        filter: { serviceInstance: ["abc"], includeOwned: true },
        detail: words("resources.deployActions.confirm.owned.description")("l2Connect"),
      },
    ];

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup({ requireConfirm: true, scopes: instanceScopes }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    // The owned scope has no count, only a note naming the owned service types.
    expect(
      within(dialog).getByText(
        words("resources.deployActions.confirm.owned.description")("l2Connect")
      )
    ).toBeVisible();

    await userEvent.click(
      within(dialog).getByRole("radio", {
        name: new RegExp(words("resources.deployActions.confirm.owned.title"), "i"),
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

  test("WHEN a disabledReason is given THEN the control is disabled", async () => {
    render(setup({ disabledReason: "nope" }));

    expect(screen.getByRole("button", { name: toggleLabel })).toBeDisabled();
    expect(screen.getByRole("button", { name: deployLabel })).toBeDisabled();
  });
});
