import React from "react";
import { useContext } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalContext, ModalProvider } from "./ModalProvider";

/**
 * `MockedModalUser` is a React functional component that renders a button that imitates the flow for the Modal Provider.
 *
 * @returns {React.FC} A button that triggers a modal when clicked.
 */
const MockedModalUser = () => {
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
        })
      }
    >
      Click me
    </button>
  );
};

const setup = () => {
  return (
    <ModalProvider>
      <MockedModalUser />
    </ModalProvider>
  );
};

describe("ModalProvider", () => {
  it("should intialize single empty div when closed", () => {
    render(setup());
    expect(document.querySelector("div")).toBeDefined();
  });

  it("should open a model with correct content when triggerModal is triggered and close it when cancel navigation is triggered", async () => {
    render(setup());

    expect(screen.getByText("Click me")).toBeVisible();

    await userEvent.click(screen.getByText("Click me"));

    expect(screen.getByTestId("GlobalModal")).toBeVisible();
    expect(screen.getByTestId("content")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();

    expect(screen.getByLabelText("Close")).toBeVisible();

    await userEvent.click(screen.getByLabelText("Close"));

    expect(screen.queryByTestId("GlobalModal")).toBeNull();
    expect(screen.queryByTestId("content")).toBeNull();
    expect(screen.queryByText("Title")).toBeNull();
  });

  it("should close modal when button with closeModal function from provider is triggered", async () => {
    render(setup());

    expect(screen.getByText("Click me")).toBeVisible();

    await userEvent.click(screen.getByText("Click me"));

    expect(screen.getByTestId("GlobalModal")).toBeVisible();
    expect(screen.getByTestId("content")).toBeVisible();
    expect(screen.getByText("Title")).toBeVisible();

    expect(screen.getByLabelText("additionalCloseButton")).toBeVisible();

    await userEvent.click(screen.getByLabelText("additionalCloseButton"));

    expect(screen.queryByTestId("GlobalModal")).toBeNull();
    expect(screen.queryByTestId("content")).toBeNull();
    expect(screen.queryByText("Title")).toBeNull();
  });
});
