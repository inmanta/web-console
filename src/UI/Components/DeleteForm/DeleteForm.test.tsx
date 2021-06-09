import React from "react";
import { DeleteForm } from "./DeleteForm";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("GIVEN DeleteForm WHEN user clicks 'No' THEN closeModal is executed", () => {
  const submit = jest.fn();
  const closeModal = jest.fn();
  render(<DeleteForm onSubmit={submit} onCancel={closeModal} />);

  userEvent.click(screen.getByRole("button", { name: "No" }));

  expect(closeModal).toBeCalledTimes(1);
  expect(fetchMock.mock.calls).toHaveLength(0);
});

test("GIVEN DeleteForm WHEN user clicks 'Yes' THEN submit is executed", () => {
  const submit = jest.fn();
  const closeModal = jest.fn();
  render(<DeleteForm onSubmit={submit} onCancel={closeModal} />);

  userEvent.click(screen.getByRole("button", { name: "Yes" }));

  expect(submit).toBeCalledTimes(1);
});
