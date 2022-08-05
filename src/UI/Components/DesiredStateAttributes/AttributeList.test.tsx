import React from "react";
import { render, screen } from "@testing-library/react";
import { AttributeList } from "./AttributeList";
import { attributes, classified } from "./Data";

test("Given the AttributeList component When rendered with the monospace variant Then the font-family is correct", async () => {
  render(<AttributeList attributes={classified} variant="monospace" />);
  const singleLineValue = await screen.findByText(attributes["b"]);
  expect(singleLineValue).toHaveStyle("font-family: monospace");
  const multiLineValue = await screen.findByText(attributes["f"]);
  expect(multiLineValue).toHaveStyle("font-family: monospace");
});
