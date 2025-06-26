import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { axe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider, Resource } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { Page } from "./Page";

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <Page version="123" />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}
describe("DesiredStateDetails", () => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });

  test("GIVEN DesiredStateDetails page THEN shows loading resource table", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", () => {
        return HttpResponse.json(Resource.responseFromVersion);
      })
    );
    const { component } = setup();

    render(component);

    expect(screen.getByRole("region", { name: "VersionResourcesTable-Loading" })).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateDetails page WHEN api returns no items THEN shows empty resource table", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", () => {
        return HttpResponse.json({
          ...Resource.responseFromVersion,
          data: [],
        });
      })
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("generic", {
        name: "VersionResourcesTable-Empty",
      })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateDetails page WHEN api returns error THEN shows error", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", () => {
        return HttpResponse.json(
          {
            message: "something went wrong",
          },
          { status: 500 }
        );
      })
    );
    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("region", {
        name: "VersionResourcesTable-Error",
      })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateDetails page WHEN api returns items THEN shows success resource table", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", () => {
        return HttpResponse.json(Resource.responseFromVersion);
      })
    );

    const { component } = setup();

    render(component);

    expect(
      await screen.findByRole("grid", {
        name: "VersionResourcesTable-Success",
      })
    ).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });

  test("GIVEN DesiredStateDetails page WHEN sorting changes AND we are not on the first page THEN we are sent back to the first page", async () => {
    server.use(
      http.get("/api/v2/desiredstate/123", ({ request }) => {
        if (request.url.includes("&end=fake-first-param")) {
          return HttpResponse.json({
            ...Resource.responseFromVersion,
            data: Resource.responseFromVersion.data.slice(0, 4),
          });
        }

        return HttpResponse.json({
          ...Resource.responseFromVersion,
          metadata: {
            total: 103,
            before: 0,
            after: 83,
            page_size: 20,
          },
          links: {
            self: "",
            next: "/fake-link?end=fake-first-param",
          },
        });
      })
    );
    const { component } = setup();

    render(component);
    await screen.findByRole("grid", { name: "VersionResourcesTable-Success" });
    expect(screen.getAllByLabelText("Resource Table Row")).toHaveLength(6);

    //go to next page
    await userEvent.click(screen.getByLabelText("Go to next page"));

    await screen.findByRole("grid", { name: "VersionResourcesTable-Success" });
    expect(screen.getAllByLabelText("Resource Table Row")).toHaveLength(4);

    //sort on the second page
    await userEvent.click(screen.getByRole("button", { name: "Type" }));

    await screen.findByRole("grid", { name: "VersionResourcesTable-Success" });
    expect(screen.getAllByLabelText("Resource Table Row")).toHaveLength(6);
  });
});
