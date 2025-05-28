import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CanvasContext, defaultCanvasContext } from "../Context";
import { ErrorsContainer } from "./ErrorsContainer";

describe("Given a Validation component", () => {
  const setup = (
    isDirty: boolean,
    interServiceRelationsOnCanvas: typeof defaultCanvasContext.interServiceRelationsOnCanvas
  ) => {
    return (
      <CanvasContext.Provider
        value={{
          ...defaultCanvasContext,
          isDirty,
          interServiceRelationsOnCanvas,
        }}
      >
        <ErrorsContainer />
      </CanvasContext.Provider>
    );
  };

  it.each`
    isDirty  | interServiceRelationsOnCanvas
    ${false} | ${new Map()}
    ${true}  | ${new Map()}
    ${false} | ${new Map().set("1", { name: "test", relations: [{ name: "relation-test", currentAmount: 0, min: 1 }] })}
    ${false} | ${new Map().set("1", { name: "test", relations: [{ name: "relation-test", currentAmount: 1, min: 1 }] })}
    ${true}  | ${new Map().set("1", { name: "test", relations: [{ name: "relation-test", currentAmount: 1, min: 1 }] })}
  `(
    "when requirements for render are not met should not render",
    ({ isDirty, interServiceRelationsOnCanvas }) => {
      render(setup(isDirty, interServiceRelationsOnCanvas));
      expect(screen.queryByTestId("Error-container")).toBeNull();
    }
  );

  it("when requirements for render are  met should render", async () => {
    const isDirty = true;
    const interServiceRelationsOnCanvas = new Map().set("1", {
      name: "test",
      relations: [{ name: "relation-test", currentAmount: 0, min: 1 }],
    });

    render(setup(isDirty, interServiceRelationsOnCanvas));
    expect(screen.queryByTestId("Error-container")).toBeDefined();
    expect(screen.getByText("Errors found: 1")).toBeDefined();

    await userEvent.click(screen.getByLabelText("Danger alert details"));

    expect(
      screen.getByText("Expected at least 1 relation-test inter-service relation(s) for test")
    ).toBeDefined();
  });

  it("when multiple errors are found should render adequate amount of errors", async () => {
    const isDirty = true;
    const interServiceRelationsOnCanvas = new Map().set("1", {
      name: "test",
      relations: [{ name: "relation-test", currentAmount: 0, min: 1 }, { name: "relation-test2", currentAmount: 0, min: 1 }],
    });

    render(setup(isDirty, interServiceRelationsOnCanvas));
    expect(screen.queryByTestId("Error-container")).toBeDefined();
    expect(screen.getByText("Errors found: 2")).toBeDefined();

    await userEvent.click(screen.getByLabelText("Danger alert details"));

    expect(
      screen.getByText("Expected at least 1 relation-test inter-service relation(s) for test")
    ).toBeDefined();
    expect(
      screen.getByText("Expected at least 1 relation-test2 inter-service relation(s) for test")
    ).toBeDefined();
  });
});
