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

const filter: ResourceActionFilter = { isOrphan: false, agent: { eq: ["internal"] } };
const deployLabel = words("resources.compoundStateSummary.deploy");
const repairLabel = words("resources.compoundStateSummary.repair");
const toggleLabel = words("resources.deployActions.toggle");

type SetupProps =
  | { requireConfirm?: false; disabledReason?: string }
  | { requireConfirm: true; filteredCount: number; environmentCount: number };

function setup(props: SetupProps = {}, filterProp: ResourceActionFilter = filter) {
  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider env={EnvironmentDetails.env}>
          <ModalProvider>
            <Page>
              <DeployActions filter={filterProp} {...props} />
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

  test("WHEN requireConfirm is set THEN Deploy opens a dialog showing the passed counts and confirms against the filter", async () => {
    let body: unknown;

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup({ requireConfirm: true, filteredCount: 3, environmentCount: 99 }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    // The counts come straight from the view's props, no extra request.
    expect(within(dialog).getByText(/3 matched/)).toBeVisible();
    expect(within(dialog).getByText(/99 total/)).toBeVisible();

    await userEvent.click(within(dialog).getByRole("button", { name: deployLabel }));

    await waitFor(() =>
      expect(body).toEqual({ filter, agent_trigger_method: "push_incremental_deploy" })
    );
  });

  test("WHEN the environment scope is chosen THEN it confirms against all non-orphaned resources", async () => {
    let body: unknown;

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup({ requireConfirm: true, filteredCount: 3, environmentCount: 99 }));

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

  test("WHEN the chosen scope matches no resources THEN its confirm button is disabled", async () => {
    render(setup({ requireConfirm: true, filteredCount: 0, environmentCount: 5 }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: deployLabel });

    // Filtered scope matches nothing, so confirming (an empty deploy) is blocked.
    expect(confirm).toBeDisabled();

    // The whole-environment scope still has resources, so it re-enables confirm.
    await userEvent.click(
      within(dialog).getByRole("radio", {
        name: new RegExp(words("resources.deployActions.confirm.environment.title"), "i"),
      })
    );
    expect(confirm).toBeEnabled();
  });

  test("WHEN the confirm dialog is open THEN it notes that orphaned resources can't be deployed", async () => {
    const orphanNote = words("resources.deployActions.confirm.orphanNote");

    render(setup({ requireConfirm: true, filteredCount: 3, environmentCount: 9 }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(orphanNote)).toBeVisible();
  });

  test("WHEN the filter includes orphans THEN it is sent as-is, leaving the scheduler to reject it", async () => {
    let body: unknown;

    server.use(
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    // The filter is passed through unchanged; an orphan filter reaches the backend, which rejects it
    // (surfaced as an error toast), rather than being silently rewritten here.
    render(
      setup({ requireConfirm: true, filteredCount: 3, environmentCount: 9 }, { isOrphan: true })
    );

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
    render(setup({ disabledReason: "nope" }));

    expect(screen.getByRole("button", { name: toggleLabel })).toBeDisabled();
    expect(screen.getByRole("button", { name: deployLabel })).toBeDisabled();
  });
});
