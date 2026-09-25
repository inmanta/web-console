import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttributeClassifier, useExpansion } from "@/Data";
import { referenceAttributes } from "@/Data/Common/References/Mock";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { TestMemoryRouter } from "@/UI/Routing/TestMemoryRouter";
import { ResourceAttributesView } from "./ResourceAttributesView";

const classifier = new AttributeClassifier();

const View: React.FC = () => {
  const [isExpanded, onToggle] = useExpansion();

  return (
    <ResourceAttributesView
      attributes={referenceAttributes}
      classifier={classifier}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
  );
};

const renderView = () =>
  render(
    <QueryClientProvider client={testClient}>
      <TestMemoryRouter>
        <MockedDependencyProvider>
          <View />
        </MockedDependencyProvider>
      </TestMemoryRouter>
    </QueryClientProvider>
  );

test("the JSON view shows the attributes verbatim, machinery included", async () => {
  renderView();

  await userEvent.click(screen.getByRole("button", { name: "JSON" }));

  const editor = screen.getByTestId("code-editor-content");

  expect(editor).toHaveTextContent("mutators");
  expect(editor).toHaveTextContent("references");
});

test("toggling back to Structured restores the structured view", async () => {
  renderView();

  await userEvent.click(screen.getByRole("button", { name: "JSON" }));
  await userEvent.click(screen.getByRole("button", { name: "Structured" }));

  // a structured-only element is back (the JSON view renders only the code editor)
  expect(screen.getByRole("button", { name: /future::std::ComplianceReport/ })).toBeInTheDocument();
});
