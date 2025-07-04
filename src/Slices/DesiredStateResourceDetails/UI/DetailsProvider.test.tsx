import { act } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { configureAxe } from "jest-axe";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import * as VersionedResourceDetails from "@S/DesiredStateResourceDetails/Data/Mock";
import { DetailsProvider } from "./DetailsProvider";

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

function setup() {
  const component = (
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <DetailsProvider version="123" resourceId="abc" />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

  return { component };
}

describe("DetailsProvider", () => {
  const server = setupServer(
    http.get("/api/v2/desiredstate/123/resource/abc", () => {
      return HttpResponse.json({ data: VersionedResourceDetails.a });
    })
  );

  beforeAll(() => {
    server.listen();
  });
  afterAll(() => {
    server.close();
  });

  test("GIVEN DesiredStateResourceDetails page WHEN api returns details THEN shows details", async () => {
    const { component } = setup();

    render(component);

    expect(await screen.findByRole("generic", { name: "ResourceDetails-Success" })).toBeVisible();
    expect(screen.getByText("requires")).toBeVisible();

    await act(async () => {
      const results = await axe(document.body);

      expect(results).toHaveNoViolations();
    });
  });
});
