import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ConfirmUserActionForm } from "./ConfirmUserActionForm";

test("GIVEN DeleteForm WHEN user clicks 'No' THEN closeModal is executed", async () => {
  const submit = vi.fn();
  const closeModal = vi.fn();

  render(<ConfirmUserActionForm onSubmit={submit} onCancel={closeModal} />);

  await userEvent.click(screen.getByRole("button", { name: "No" }));

  expect(closeModal).toHaveBeenCalledTimes(1);
});

test("GIVEN DeleteForm WHEN user clicks 'Yes' THEN submit is executed", async () => {
  const submit = vi.fn();
  const closeModal = vi.fn();

  render(<ConfirmUserActionForm onSubmit={submit} onCancel={closeModal} />);

  await userEvent.click(screen.getByRole("button", { name: "Yes" }));

  expect(submit).toHaveBeenCalledTimes(1);
});
