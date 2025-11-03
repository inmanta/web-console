import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MockedDependencyProvider } from "@/Test";
import { testClient } from "@/Test/Utils/react-query-setup";
import { AttributeList, getDefaultHeightEditor } from "./AttributeList";
import { ClassifiedAttribute } from "./ClassifiedAttribute";
import { attributes, classified } from "./Data";

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

test("Given the getHeightEditor function When called with different attribute types Then returns correct height for each type", async () => {
  const testCases = [
    {
      type: "Json",
      description: "short JSON content",
      attribute: {
        kind: "Json",
        key: "jsonShort",
        value: '{\n  "name": "test",\n  "value": 123\n}',
      },
      expected: "sizeToFit",
    },
    {
      type: "Json",
      description: "long JSON content",
      attribute: {
        kind: "Json",
        key: "jsonLong",
        value: "{\n" + Array(20).fill('  "key": "value",').join("\n") + "\n}",
      },
      expected: "300px",
    },
    {
      type: "Xml",
      description: "short XML content",
      attribute: {
        kind: "Xml",
        key: "xmlShort",
        value: "<root>\n  <element>value</element>\n</root>",
      },
      expected: "sizeToFit",
    },
    {
      type: "Xml",
      description: "long XML content",
      attribute: {
        kind: "Xml",
        key: "xmlLong",
        value: "<root>\n" + Array(20).fill("  <item>value</item>").join("\n") + "\n</root>",
      },
      expected: "300px",
    },
    {
      type: "Python",
      description: "short Python code",
      attribute: {
        kind: "Python",
        key: "pythonShort",
        value: "def hello():\n  print('Hello, world!')\n\nhello()",
      },
      expected: "sizeToFit",
    },
    {
      type: "Python",
      description: "long Python code",
      attribute: {
        kind: "Python",
        key: "pythonLong",
        value: "# Long Python code\n" + Array(20).fill("print('Line of code')").join("\n"),
      },
      expected: "300px",
    },
    {
      type: "Code",
      description: "short generic code",
      attribute: {
        kind: "Code",
        key: "codeShort",
        value: "function test() {\n  return true;\n}",
      },
      expected: "sizeToFit",
    },
    {
      type: "Code",
      description: "long generic code",
      attribute: {
        kind: "Code",
        key: "codeLong",
        value: "// Long code\n" + Array(20).fill("console.log('test');").join("\n"),
      },
      expected: "300px",
    },
    {
      type: "SingleLine",
      description: "non-code type",
      attribute: {
        kind: "SingleLine",
        key: "text",
        value: "This is just a regular text value",
      },
      expected: "sizeToFit",
    },
  ];

  testCases.forEach(({ attribute, expected }) => {
    const height = getDefaultHeightEditor(attribute as ClassifiedAttribute);
    expect(height).toBe(expected);
  });
});
