import React from "react";
import { useLocation } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { environmentReferences } from "@/Data/Common/References/Mock";
import { a, withReferences } from "@/Slices/ResourceDetails/Data/Mock/ResourceDetails";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
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

test("hides the machinery keys and renders a whole-attribute reference in place of the null", () => {
  renderTab(withReferences);

  // references / mutators are not shown as attribute rows
  expect(screen.queryByText("references")).not.toBeInTheDocument();
  expect(screen.queryByText("mutators")).not.toBeInTheDocument();

  // the null `value` attribute shows a reference chip instead of a null
  expect(screen.getByText("value")).toBeVisible();
  expect(screen.getByRole("button", { name: /future::std::ComplianceReport/ })).toBeInTheDocument();
});

test("keeps a nested value and lists its replacement underneath", () => {
  renderTab(withReferences);

  expect(screen.getByText("api")).toBeVisible();
  expect(screen.getByText("api.'api_token'")).toBeVisible();
  expect(
    screen.getByRole("button", { name: /std::Environment\(name=CLOUDSMITH_API_KEY\)/ })
  ).toBeInTheDocument();
});

test("groups framework attributes under their own heading", () => {
  renderTab(withReferences);

  expect(screen.getByText(words("resources.attributes.frameworkGroup"))).toBeVisible();
  expect(screen.getByText("send_event")).toBeVisible();
});

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

test("notes how many mutators could not be displayed", () => {
  // withReferences carries only core::Replace mutators (all displayed); add one that
  // is not, so exactly one goes undisplayed and the note appears.
  const withUndisplayed = {
    ...withReferences,
    attributes: {
      ...withReferences.attributes,
      mutators: [
        ...(withReferences.attributes.mutators as unknown[]),
        { type: "core::SomethingElse", args: [] },
      ],
    },
  };

  renderTab(withUndisplayed);

  expect(screen.getByText(words("references.mutatorsNotDisplayed")(1))).toBeVisible();
});

test("counts a replacement whose destination matches no attribute as not displayed", () => {
  const withOrphan = {
    ...withReferences,
    attributes: {
      ...withReferences.attributes,
      mutators: [
        ...(withReferences.attributes.mutators as unknown[]),
        {
          type: "core::Replace",
          args: [
            { name: "value", type: "reference", id: environmentReferences[0].id },
            { name: "destination", type: "literal", value: "missing.'key'" },
          ],
        },
      ],
    },
  };

  renderTab(withOrphan);

  expect(screen.getByText(words("references.mutatorsNotDisplayed")(1))).toBeVisible();
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

test("a resource without references renders its attributes as plain rows", () => {
  renderTab(a);

  // no reference chips, the plain attributes are shown
  expect(screen.getByText("key1")).toBeVisible();
  expect(within(screen.getByTestId("attribute-key1")).getByText("modified_value")).toBeVisible();
  expect(screen.queryByRole("button", { name: /::/ })).not.toBeInTheDocument();
});
