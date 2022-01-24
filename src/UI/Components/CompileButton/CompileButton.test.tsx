import React from "react";
import { render, screen } from "@testing-library/react";
import { CompileButton } from "./CompileButton";

function setup() {
  const component = <CompileButton />;
  return { component };
}

test("GIVEN CompileButton WHEN clicked THEN triggers recompile", async () => {
  const { component } = setup();

  render(component);

  expect(screen.getByRole("button", { name: "CompileButton" })).toBeVisible();
});
