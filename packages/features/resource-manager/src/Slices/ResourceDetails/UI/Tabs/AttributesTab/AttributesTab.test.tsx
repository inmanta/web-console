import React from "react";
import { useLocation } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { environmentReferences } from "@inmanta/web-console-core/Common/References/Mock";
import {
  a,
  withReferences,
} from "@inmanta/web-console-feature-resource-manager/Slices/ResourceDetails/Data/Mock/ResourceDetails";
import { MockedDependencyProvider } from "@inmanta/web-console-test-utils";
import { TestMemoryRouter } from "@inmanta/web-console-test-utils/Utils/TestMemoryRouter";
import { testClient } from "@inmanta/web-console-test-utils/Utils/react-query-setup";
import { AttributesTab } from "./AttributesTab";

// Prints the current URL so a test can read the expansion state back out of it.
const LocationDisplay: React.FC = () => {
  const location = useLocation();

  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

const renderTab = (details: typeof a, url = "/") =>
  render(
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter initialEntries={[url]}>
        <MockedDependencyProvider>
          <AttributesTab details={details} />
          <LocationDisplay />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

test("a nested reference's expansion is kept in the URL and survives a remount", async () => {
  const { unmount } = renderTab(withReferences);
  const nodeId = environmentReferences[0].id;

  expect(screen.queryByText(nodeId)).not.toBeInTheDocument();

  await userEvent.click(
    screen.getByRole("button", { name: /std::Environment\(name=CLOUDSMITH_API_KEY\)/ })
  );

  expect(screen.getByText(nodeId)).toBeVisible();

  const url = screen.getByTestId("location").textContent ?? "";

  unmount();
  renderTab(withReferences, url);

  expect(screen.getByText(nodeId)).toBeVisible();
});
