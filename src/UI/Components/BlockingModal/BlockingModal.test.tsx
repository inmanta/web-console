import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { BlockingModal } from "./BlockingModal";

test("Given BlockingModal When firing event twice Then Modal will appear and disappear", () => {
  render(<BlockingModal />);

  act(() => {
    document.dispatchEvent(new CustomEvent("halt-event"));
  });
  const modal = screen.getByLabelText("halting-blocker");
  expect(modal).toBeVisible();

  act(() => {
    document.dispatchEvent(new CustomEvent("halt-event"));
  });
  expect(modal).not.toBeVisible();
});
