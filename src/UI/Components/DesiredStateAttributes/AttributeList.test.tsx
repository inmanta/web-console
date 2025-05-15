import React from "react";
import { render, screen } from "@testing-library/react";
import { AttributeList } from "./AttributeList";
import { attributes, classified } from "./Data";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { QueryClientProvider } from "@tanstack/react-query";

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
  const multiLineValue = await screen.findByText(attributes["f"]);

  expect(multiLineValue).toHaveStyle("font-family:  var(--pf-t--global--font--family--mono)");
});
