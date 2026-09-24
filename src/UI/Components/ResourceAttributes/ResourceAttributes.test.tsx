import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { AttributeClassifier, useExpansion } from "@/Data";
import { attributes as plainAttributes } from "@/Data/Common/AttributeClassifier/Mock";
import { environmentReferences, referenceAttributes } from "@/Data/Common/References/Mock";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { words } from "@/UI/words";
import { ResourceAttributes } from "./ResourceAttributes";

const classifier = new AttributeClassifier();

const View: React.FC<{ attributes: Record<string, unknown> }> = ({ attributes }) => {
  const [isExpanded, onToggle] = useExpansion();

  return (
    <ResourceAttributes
      attributes={attributes}
      classifier={classifier}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
  );
};

const renderView = (attributes: Record<string, unknown>) =>
  render(
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <View attributes={attributes} />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

test("hides the machinery keys and renders a whole-attribute reference in place of the null", () => {
  renderView(referenceAttributes);

  // references / mutators are not shown as attribute rows
  expect(screen.queryByText("references")).not.toBeInTheDocument();
  expect(screen.queryByText("mutators")).not.toBeInTheDocument();

  // the null `value` attribute shows a reference chip instead of a null
  expect(screen.getByText("value")).toBeVisible();
  expect(screen.getByRole("button", { name: /future::std::ComplianceReport/ })).toBeInTheDocument();
});

test("keeps a nested value and lists its replacement underneath", () => {
  renderView(referenceAttributes);

  expect(screen.getByText("api")).toBeVisible();
  expect(screen.getByText("api.'api_token'")).toBeVisible();
  expect(
    screen.getByRole("button", { name: /std::Environment\(name=CLOUDSMITH_API_KEY\)/ })
  ).toBeInTheDocument();
});

test("groups framework attributes under their own heading", () => {
  renderView(referenceAttributes);

  expect(screen.getByText(words("resources.attributes.frameworkGroup"))).toBeVisible();
  expect(screen.getByText("send_event")).toBeVisible();
});

test("notes how many mutators could not be displayed", () => {
  // withReferences carries only core::Replace mutators (all displayed); add one that
  // is not, so exactly one goes undisplayed and the note appears.
  renderView({
    ...referenceAttributes,
    mutators: [
      ...(referenceAttributes.mutators as unknown[]),
      { type: "core::SomethingElse", args: [] },
    ],
  });

  expect(screen.getByText(words("references.mutatorsNotDisplayed")(1))).toBeVisible();
});

test("counts a replacement whose destination matches no attribute as not displayed", () => {
  renderView({
    ...referenceAttributes,
    mutators: [
      ...(referenceAttributes.mutators as unknown[]),
      {
        type: "core::Replace",
        args: [
          { name: "value", type: "reference", id: environmentReferences[0].id },
          { name: "destination", type: "literal", value: "missing.'key'" },
        ],
      },
    ],
  });

  expect(screen.getByText(words("references.mutatorsNotDisplayed")(1))).toBeVisible();
});

test("a resource without references renders its attributes as plain rows", () => {
  renderView(plainAttributes);

  // no reference chips, the plain attributes are shown
  expect(screen.getByText("b")).toBeVisible();
  expect(within(screen.getByTestId("attribute-b")).getByText(plainAttributes.b)).toBeVisible();
  expect(screen.queryByRole("button", { name: /::/ })).not.toBeInTheDocument();
});
