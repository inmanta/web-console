import { render, screen } from "@testing-library/react";
import { MockedDependencyProvider, stubRoute } from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { ResourceLink } from "./ResourceLink";

const resourceId = "std::File[agent,path=/tmp/a]";

describe("ResourceLink", () => {
  test("GIVEN the resource details route is registered THEN renders a link to it", () => {
    render(
      <TestMemoryRouter>
        <MockedDependencyProvider routes={[stubRoute("ResourceDetails", "/resources/:resourceId")]}>
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
        <MockedDependencyProvider>
          <ResourceLink resourceId={resourceId} isInline />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    );

    expect(screen.getByText(resourceId)).toBeVisible();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
