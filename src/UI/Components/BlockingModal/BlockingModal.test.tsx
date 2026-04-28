import { act } from "react";
import { render, screen } from "@testing-library/react";
import { configureAxe } from "jest-axe";
import { ModalProvider } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { BlockingModal } from "./BlockingModal";

const axe = configureAxe({
  rules: {
    region: { enabled: false },
    "aria-dialog-name": { enabled: false },
  },
});

const Component = () => (
  <ModalProvider>
    <BlockingModal />
  </ModalProvider>
);

test("Given BlockingModal WHEN firing corresponding events THEN Modal will appear and disappear", async () => {
  render(<Component />);

  expect(screen.queryByTestId("blocking-modal-message")).not.toBeInTheDocument();

  act(() => {
    document.dispatchEvent(new CustomEvent("halt-event"));
  });
  expect(screen.getByTestId("blocking-modal-message")).toHaveTextContent(
    words("environment.halt.process")
  );

  await act(async () => {
    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  act(() => {
    document.dispatchEvent(new CustomEvent("close-blocking-modal"));
  });
  expect(screen.queryByTestId("blocking-modal-message")).not.toBeInTheDocument();

  act(() => {
    document.dispatchEvent(new CustomEvent("resume-event"));
  });
  expect(screen.getByTestId("blocking-modal-message")).toHaveTextContent(
    words("environment.resume.process")
  );

  act(() => {
    document.dispatchEvent(new CustomEvent("close-blocking-modal"));
  });
  expect(screen.queryByTestId("blocking-modal-message")).not.toBeInTheDocument();
});
