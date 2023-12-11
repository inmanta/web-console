import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { words } from "@/UI/words";
import { BlockingModal } from "./BlockingModal";

test("Given BlockingModal When firing event twice Then Modal will appear and disappear", () => {
  render(<BlockingModal />);

  act(() => {
    document.dispatchEvent(new CustomEvent("halt-event"));
  });
  const modalHalt = screen.getByLabelText("halting-blocker");
  const textHalt = screen.getByText(words("environment.halt.process"));
  expect(modalHalt).toBeVisible();
  expect(textHalt).toBeVisible();

  act(() => {
    document.dispatchEvent(new CustomEvent("halt-event"));
  });
  expect(modalHalt).not.toBeVisible();
  expect(textHalt).not.toBeVisible();

  act(() => {
    document.dispatchEvent(new CustomEvent("resume-event"));
  });
  const modal = screen.getByLabelText("halting-blocker");
  const text = screen.getByText(words("environment.resume.process"));
  expect(modal).toBeVisible();
  expect(text).toBeVisible();

  act(() => {
    document.dispatchEvent(new CustomEvent("resume-event"));
  });
  expect(modal).not.toBeVisible();
  expect(text).not.toBeVisible();
});
