import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import { configureAxe, toHaveNoViolations } from "jest-axe";
import { words } from "@/UI/words";
import { BlockingModal } from "./BlockingModal";

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});

test("Given BlockingModal When firing event twice Then Modal will appear and disappear", async () => {
  render(<BlockingModal />);

  act(() => {
    document.dispatchEvent(new CustomEvent("halt-event"));
  });
  const modalHalt = screen.getByLabelText("halting-blocker");
  const textHalt = screen.getByText(words("environment.halt.process"));
  expect(modalHalt).toBeVisible();
  expect(textHalt).toBeVisible();

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

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
