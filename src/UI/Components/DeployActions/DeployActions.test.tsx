import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { graphql, http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ResourceActionFilter } from "@/Data/Queries";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { DeployActions } from "./DeployActions";

const filter: ResourceActionFilter = { isOrphan: false, agent: { eq: ["internal"] } };
const deployLabel = words("resources.compoundStateSummary.deploy");
const toggleLabel = words("resources.deployActions.toggle");

function setup(props: Partial<React.ComponentProps<typeof DeployActions>> = {}) {
  return (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider env={EnvironmentDetails.env}>
          <Page>
            <DeployActions filter={filter} {...props} />
          </Page>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );
}

describe("DeployActions", () => {
  const server = setupServer();
  const queryLink = graphql.link("/api/v2/graphql");

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterEach(() => testClient.clear());
  afterAll(() => server.close());

  test("WHEN requireConfirm is not set THEN clicking Deploy runs immediately without a dialog", async () => {
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
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("WHEN requireConfirm is set THEN Deploy opens a dialog and confirms against the filter scope", async () => {
    let body: unknown;

    // Distinct counts per scope: the filtered scope matches fewer than the whole environment.
    server.use(
      queryLink.query(
        "CountResources",
        ({ variables }: { variables: { filter: ResourceActionFilter } }) =>
          HttpResponse.json({
            data: { data: { resources: { totalCount: variables.filter.agent ? 3 : 99 } } },
          })
      ),
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup({ requireConfirm: true }));

    await userEvent.click(screen.getByRole("button", { name: deployLabel }));

    const dialog = await screen.findByRole("dialog");
    // The count of matched resources is surfaced per scope so the operator sees the blast radius.
    expect(await within(dialog).findByText(/3 matched/)).toBeVisible();
    expect(within(dialog).getByText(/99 total/)).toBeVisible();

    await userEvent.click(within(dialog).getByRole("button", { name: deployLabel }));

    await waitFor(() =>
      expect(body).toEqual({ filter, agent_trigger_method: "push_incremental_deploy" })
    );
  });

  test("WHEN the environment scope is chosen THEN it confirms against all non-orphaned resources", async () => {
    let body: unknown;

    server.use(
      queryLink.query("CountResources", () =>
        HttpResponse.json({ data: { data: { resources: { totalCount: 42 } } } })
      ),
      http.post("/api/v2/deploy_filtered", async ({ request }) => {
        body = await request.json();

        return HttpResponse.json({});
      })
    );

    render(setup({ requireConfirm: true }));

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

  test("WHEN a disabledReason is given THEN the control is disabled", async () => {
    render(setup({ disabledReason: "nope" }));

    expect(screen.getByRole("button", { name: toggleLabel })).toBeDisabled();
    expect(screen.getByRole("button", { name: deployLabel })).toBeDisabled();
  });
});
