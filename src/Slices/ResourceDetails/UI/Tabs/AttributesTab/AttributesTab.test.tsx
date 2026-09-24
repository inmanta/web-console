import React from "react";
import { useLocation } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { environmentReferences } from "@/Data/Common/References/Mock";
import { a, withReferences } from "@/Slices/ResourceDetails/Data/Mock/ResourceDetails";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
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

test("the JSON view shows details.attributes verbatim, machinery included", async () => {
  renderTab(withReferences);

  await userEvent.click(screen.getByRole("button", { name: "JSON" }));

  const editor = screen.getByTestId("code-editor-content");

  expect(editor).toHaveTextContent("mutators");
  expect(editor).toHaveTextContent("references");
});

test("toggling back to Structured restores the structured view", async () => {
  renderTab(withReferences);

  await userEvent.click(screen.getByRole("button", { name: "JSON" }));
  await userEvent.click(screen.getByRole("button", { name: "Structured" }));

  // a structured-only element is back (the JSON view renders only the code editor)
  expect(screen.getByRole("button", { name: /future::std::ComplianceReport/ })).toBeInTheDocument();
});

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
