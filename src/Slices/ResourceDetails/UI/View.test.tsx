import { act } from "react";
import { Page } from "@patternfly/react-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Resource } from "@/Core/Domain";
import { EnvironmentDetails, MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ResourceDetails } from "@S/ResourceDetails/Data/Mock";
import { View } from "./View";

function setup(halted = false) {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider env={{ ...EnvironmentDetails.env, halted }}>
          <Page>
            <View id={"abc"} />
          </Page>
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
describe("ResourceDetailsView", () => {
  const server = setupServer();

  beforeAll(() => server.listen());
  beforeEach(() => server.resetHandlers());
  afterEach(() => testClient.clear());
  afterAll(() => server.close());

  test("GIVEN The Resource details view THEN details data is fetched immediately", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      })
    );
    const { component } = setup();

    render(component);
    expect(screen.getByLabelText("ResourceDetails-Loading")).toBeVisible();

    expect(await screen.findByLabelText("ResourceDetails-Success")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN The Resource details view WHEN the user clicks on the requires tab AND the requires table is empty THEN the empty state is shown", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({
          data: { ...ResourceDetails.a, requires_status: {} },
        });
      })
    );
    const { component } = setup();

    render(component);
    expect(await screen.findByLabelText("ResourceDetails-Success")).toBeVisible();

    await userEvent.click(
      screen.getAllByRole("tab", {
        name: words("resources.requires.title"),
      })[0]
    );

    expect(await screen.findByLabelText("ResourceRequires-Empty")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN The Resource details view WHEN the user clicks on the requires tab THEN the requires table is shown", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      })
    );
    const { component } = setup();

    render(component);
    expect(await screen.findByLabelText("ResourceDetails-Success")).toBeVisible();

    await userEvent.click(
      screen.getAllByRole("tab", {
        name: words("resources.requires.title"),
      })[0]
    );
    expect(await screen.findByRole("grid", { name: "ResourceRequires-Success" })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN The Resource details view THEN shows status label", async () => {
    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      })
    );
    const { component } = setup();

    render(component);

    expect(await screen.findByTestId("Status-deployed")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN ResourceLogsView WHEN clicking download button THEN downloads the file content", async () => {
    const fileId = "abc123";
    const fileContent = "file content";
    const base64Content = btoa(fileContent);

    server.use(
      http.get("/api/v2/resource/abc", () => {
        return HttpResponse.json({ data: ResourceDetails.a });
      }),
      http.get(`/api/v1/file/${fileId}`, () => {
        return HttpResponse.json({ content: base64Content });
      })
    );

    const { component } = setup();
    render(component);

    // Wait for the ResourceDetails to load
    await screen.findByLabelText("ResourceDetails-Success");

    // Find and click the download button
    const downloadButton = await screen.findByRole("button", { name: words("resources.file.get") });
    await userEvent.click(downloadButton);

    // Wait for the code viewer with content to load
    const codeEditor = await screen.findByText(fileContent);
    expect(codeEditor).toBeVisible();
  });

  describe("Deploy split button", () => {
    const deployLabel = words("resources.compoundStateSummary.deploy");
    const repairLabel = words("resources.compoundStateSummary.repair");

    // A single resource is a filter of one, pinned to its identity on the latest released intent.
    const expectedFilter = {
      isOrphan: false,
      resourceType: { eq: [ResourceDetails.a.resource_type] },
      agent: { eq: [ResourceDetails.a.agent] },
      resourceIdValue: { eq: [ResourceDetails.a.id_attribute_value] },
    };

    test("WHEN opening the menu THEN it lists Deploy and Repair with their hints", async () => {
      server.use(
        http.get("/api/v2/resource/abc", () => HttpResponse.json({ data: ResourceDetails.a }))
      );

      const { component } = setup();
      render(component);
      await screen.findByLabelText("ResourceDetails-Success");

      await userEvent.click(
        screen.getByRole("button", { name: words("resources.resourceActions.toggle") })
      );

      expect(
        await screen.findByRole("menuitem", {
          name: new RegExp(
            `${deployLabel}.*${words("resources.resourceActions.deploy.hint")}`,
            "i"
          ),
        })
      ).toBeVisible();
      expect(
        screen.getByRole("menuitem", {
          name: new RegExp(
            `${repairLabel}.*${words("resources.resourceActions.repair.hint")}`,
            "i"
          ),
        })
      ).toBeVisible();
    });

    test("WHEN clicking Deploy THEN posts an incremental deploy scoped to this resource", async () => {
      let body: unknown;

      server.use(
        http.get("/api/v2/resource/abc", () => HttpResponse.json({ data: ResourceDetails.a })),
        http.post("/api/v2/deploy_filtered", async ({ request }) => {
          body = await request.json();

          return HttpResponse.json({});
        })
      );

      const { component } = setup();
      render(component);
      await screen.findByLabelText("ResourceDetails-Success");

      await userEvent.click(screen.getByRole("button", { name: deployLabel }));

      await waitFor(() =>
        expect(body).toEqual({
          filter: expectedFilter,
          agent_trigger_method: "push_incremental_deploy",
        })
      );

      // The user gets confirmation the action was accepted.
      expect(
        await screen.findByText(words("resources.resourceActions.success")(deployLabel))
      ).toBeVisible();
    });

    test("WHEN opening the menu and clicking Repair THEN posts a full deploy scoped to this resource", async () => {
      let body: unknown;

      server.use(
        http.get("/api/v2/resource/abc", () => HttpResponse.json({ data: ResourceDetails.a })),
        http.post("/api/v2/deploy_filtered", async ({ request }) => {
          body = await request.json();

          return HttpResponse.json({});
        })
      );

      const { component } = setup();
      render(component);
      await screen.findByLabelText("ResourceDetails-Success");

      await userEvent.click(
        screen.getByRole("button", { name: words("resources.resourceActions.toggle") })
      );
      await userEvent.click(
        await screen.findByRole("menuitem", { name: new RegExp(`^${repairLabel}`, "i") })
      );

      await waitFor(() =>
        expect(body).toEqual({
          filter: expectedFilter,
          agent_trigger_method: "push_full_deploy",
        })
      );
    });

    test("WHEN the environment is halted THEN the split button is disabled", async () => {
      server.use(
        http.get("/api/v2/resource/abc", () => HttpResponse.json({ data: ResourceDetails.a }))
      );

      const { component } = setup(true);
      render(component);
      await screen.findByLabelText("ResourceDetails-Success");

      expect(screen.getByRole("button", { name: deployLabel })).toBeDisabled();
    });

    test("WHEN the resource is orphaned THEN the split button is disabled", async () => {
      server.use(
        http.get("/api/v2/resource/abc", () =>
          HttpResponse.json({ data: { ...ResourceDetails.a, status: Resource.Status.orphaned } })
        )
      );

      const { component } = setup();
      render(component);
      await screen.findByLabelText("ResourceDetails-Success");

      expect(screen.getByRole("button", { name: deployLabel })).toBeDisabled();
    });
  });
});
