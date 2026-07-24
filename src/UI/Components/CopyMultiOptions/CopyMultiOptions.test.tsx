import React from "react";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { CopyMultiOptions } from "./CopyMultiOptions";

test("GIVEN CopyMultiOptions inside a clickable ancestor WHEN the toggle is clicked THEN the ancestor's click handler is not triggered", async () => {
  const onAncestorClick = vi.fn();

  render(
    <div onClick={onAncestorClick}>
      <CopyMultiOptions options={["value1", "value2"]} />
    </div>
  );

  await userEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));

  expect(onAncestorClick).not.toHaveBeenCalled();
});

test("GIVEN CopyMultiOptions inside a clickable ancestor WHEN an option is selected THEN the ancestor's click handler is not triggered", async () => {
  const onAncestorClick = vi.fn();

  render(
    <div onClick={onAncestorClick}>
      <CopyMultiOptions options={["value1", "value2"]} />
    </div>
  );

  await userEvent.click(screen.getByRole("button", { name: "Copy to clipboard" }));
  await userEvent.click(await screen.findByText("value1"));

  expect(onAncestorClick).not.toHaveBeenCalled();
});
