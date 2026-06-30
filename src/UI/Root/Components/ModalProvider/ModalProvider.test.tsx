import { useContext } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BACKDROP_CLASS, ModalContext, ModalProvider, Params } from "./ModalProvider";

const MockedModalUser = ({ overrides = {} }: { overrides?: Partial<Params> }) => {
  const { triggerModal, closeModal } = useContext(ModalContext);

  return (
    <button
      onClick={() =>
        triggerModal({
          title: "Title",
          content: (
            <div data-testid="content">
              <button aria-label="additionalCloseButton" onClick={closeModal}>
                Close
              </button>
            </div>
          ),
          ...overrides,
        })
      }
    >
      Click me
    </button>
  );
};

const setup = (overrides: Partial<Params> = {}) =>
  render(
    <ModalProvider>
      <MockedModalUser overrides={overrides} />
    </ModalProvider>
  );

describe("ModalProvider", () => {
  describe("Initial state", () => {
    it("does not render the modal on mount", () => {
      setup();
      expect(screen.queryByTestId("GlobalModal")).toBeNull();
    });

    it("renders children correctly", () => {
      setup();
      expect(screen.getByText("Click me")).toBeVisible();
    });
  });

  describe("triggerModal", () => {
    it("opens the modal with title and content", async () => {
      setup();

      await userEvent.click(screen.getByText("Click me"));

      expect(screen.getByTestId("GlobalModal")).toBeVisible();
      expect(screen.getByTestId("content")).toBeVisible();
      expect(screen.getByText("Title")).toBeVisible();
    });

    it("renders a custom description when provided", async () => {
      setup({ description: <p data-testid="modal-description">My description</p> });

      await userEvent.click(screen.getByText("Click me"));

      expect(screen.getByTestId("modal-description")).toBeVisible();
    });

    it("renders footer actions when provided", async () => {
      setup({ actions: <button data-testid="confirm-btn">Confirm</button> });

      await userEvent.click(screen.getByText("Click me"));

      expect(screen.getByTestId("confirm-btn")).toBeVisible();
    });

    it("does not render a footer when no actions are provided", async () => {
      setup({ actions: null });

      await userEvent.click(screen.getByText("Click me"));

      expect(screen.queryByRole("contentinfo")).toBeNull();
    });

    it("uses custom ariaLabel and dataTestId when provided", async () => {
      setup({ ariaLabel: "custom-aria", dataTestId: "custom-test-id" });

      await userEvent.click(screen.getByText("Click me"));

      expect(screen.getByTestId("custom-test-id")).toBeVisible();
    });
  });

  describe("closeModal", () => {
    it("closes the modal and calls cancelCb via the built-in close button", async () => {
      const cancelCb = vi.fn();
      setup({ cancelCb });

      await userEvent.click(screen.getByText("Click me"));
      expect(screen.getByTestId("GlobalModal")).toBeVisible();

      await userEvent.click(screen.getByLabelText("Close"));

      expect(screen.queryByTestId("GlobalModal")).toBeNull();
      expect(cancelCb).toHaveBeenCalledTimes(1);
    });

    it("closes the modal and calls cancelCb via a consumer-provided close button", async () => {
      const cancelCb = vi.fn();
      setup({ cancelCb });

      await userEvent.click(screen.getByText("Click me"));
      expect(screen.getByTestId("GlobalModal")).toBeVisible();

      await userEvent.click(screen.getByLabelText("additionalCloseButton"));

      expect(screen.queryByTestId("GlobalModal")).toBeNull();
      expect(cancelCb).toHaveBeenCalledTimes(1);
    });

    it("re-opens cleanly after being closed", async () => {
      setup();

      await userEvent.click(screen.getByText("Click me"));
      expect(screen.getByTestId("GlobalModal")).toBeVisible();

      await userEvent.click(screen.getByLabelText("Close"));
      expect(screen.queryByTestId("GlobalModal")).toBeNull();

      await userEvent.click(screen.getByText("Click me"));
      expect(screen.getByTestId("GlobalModal")).toBeVisible();
    });

    it("does not throw when no cancelCb is provided", async () => {
      setup();

      await userEvent.click(screen.getByText("Click me"));

      await expect(userEvent.click(screen.getByLabelText("Close"))).resolves.not.toThrow();
    });
  });

  describe("backdrop press", () => {
    const getBackdrop = () => {
      const backdrop = document.querySelector(`.${BACKDROP_CLASS}`);
      if (!backdrop) {
        throw new Error(`Backdrop .${BACKDROP_CLASS} not found`);
      }

      return backdrop;
    };

    it("closes when the press starts on the backdrop", async () => {
      setup();

      await userEvent.click(screen.getByText("Click me"));

      fireEvent.mouseDown(getBackdrop());

      expect(screen.queryByTestId("GlobalModal")).toBeNull();
    });

    it("stays open when the press starts inside the dialog and ends on the backdrop", async () => {
      setup();

      await userEvent.click(screen.getByText("Click me"));

      // Press begins on the modal content (e.g. selecting text) and is released
      // on the backdrop - must not close the modal. The decision is made on
      // mousedown, so a backdrop release after an inside press is a no-op.
      fireEvent.mouseDown(screen.getByTestId("content"));
      fireEvent.mouseUp(getBackdrop());

      expect(screen.getByTestId("GlobalModal")).toBeVisible();
    });

    it("does not close when showClose is false", async () => {
      setup({ showClose: false });

      await userEvent.click(screen.getByText("Click me"));

      fireEvent.mouseDown(getBackdrop());

      expect(screen.getByTestId("GlobalModal")).toBeVisible();
    });
  });

  describe("showClose prop", () => {
    it("hides the built-in close button when showClose is false", async () => {
      setup({ showClose: false });

      await userEvent.click(screen.getByText("Click me"));

      expect(screen.queryByLabelText("Close")).toBeNull();
    });

    it("shows the built-in close button by default", async () => {
      setup();

      await userEvent.click(screen.getByText("Click me"));

      expect(screen.getByLabelText("Close")).toBeVisible();
    });
  });
});
