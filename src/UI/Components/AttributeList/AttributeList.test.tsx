import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { attributes, classified } from "@/Data/Common/AttributeClassifier/Mock";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
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
