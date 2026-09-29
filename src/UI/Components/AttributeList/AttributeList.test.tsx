import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { attributes, classified } from "@/Data/Common/AttributeClassifier/Mock";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { words } from "@/UI/words";
import { AttributeList } from "./AttributeList";

test("Given the AttributeList component When rendered with the monospace variant Then the font-family is correct", async () => {
  const component = (
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <AttributeList attributes={classified} variant="monospace" />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );
  render(component);

  const singleLineValue = await screen.findByText(attributes["b"]);

  expect(singleLineValue).toHaveStyle("font-family:  var(--pf-t--global--font--family--mono)");
});

test("Given an empty single-line value When rendered Then it shows an empty marker without a copy button", () => {
  render(
    <QueryClientProvider client={testClient}>
      <MockedDependencyProvider>
        <AttributeList attributes={[{ kind: "SingleLine", key: "empty", value: "" }]} />
      </MockedDependencyProvider>
    </QueryClientProvider>
  );

  const cell = screen.getByTestId("attribute-empty");

  expect(cell).toHaveTextContent(words("attributes.emptyString"));
  expect(within(cell).queryByRole("button")).not.toBeInTheDocument();
});
