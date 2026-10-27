import { render, screen } from "@testing-library/react";
import { routes } from "@/appFeatures";
import { TestMemoryRouter } from "@inmanta/web-console-core/Routing/TestMemoryRouter";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { ResourceLink } from "./ResourceLink";

const resourceId = "std::File[agent,path=/tmp/a]";

describe("ResourceLink", () => {
  test("GIVEN the resource details route is registered THEN renders a link to it", () => {
    render(
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <ResourceLink resourceId={resourceId} isInline />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    );

    expect(screen.getByRole("link", { name: resourceId }).getAttribute("href")).toMatch(
      /^\/resources\/std/
    );
  });

  test("GIVEN the resource details route is not registered THEN renders the id as plain text", () => {
    render(
      <TestMemoryRouter>
        <MockedDependencyProvider
          routes={routes.filter((route) => route("").kind !== "ResourceDetails")}
        >
          <ResourceLink resourceId={resourceId} isInline />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    );

    expect(screen.getByText(resourceId)).toBeVisible();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
