import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ClipboardCopyButton } from "./ClipboardCopyButton";

test("Given a ClipboardCopyButton, when the button is hovered, then a tooltip should be shown", async () => {
  render(
    <ClipboardCopyButton
      tooltipContent={"Tooltip content"}
      fullText="Full text to be copied"
    />
  );
  const button = await screen.findByLabelText("Copy to clipboard");
  userEvent.hover(button);
  expect(await screen.findByRole("tooltip")).toBeVisible();
});
