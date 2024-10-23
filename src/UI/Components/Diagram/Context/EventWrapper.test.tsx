import React, { act, useContext, useEffect } from "react";
import "@testing-library/jest-dom";
import { screen } from "@testing-library/dom";
import { render } from "@testing-library/react";
import { ActionEnum } from "../interfaces";
import { ServiceEntityBlock } from "../shapes";
import { CanvasProvider } from "./CanvasProvider";
import { CanvasContext } from "./Context";
import { EventWrapper } from "./EventWrapper";

const setup = (testingComponent: JSX.Element) => {
  return (
    <CanvasProvider>
      <EventWrapper>{testingComponent}</EventWrapper>
    </CanvasProvider>
  );
};

describe("looseElement event handler -", () => {
  const TestingComponent = (): JSX.Element => {
    const { looseElement } = useContext(CanvasContext);

    return (
      <div>
        <span data-testid="looseElement">{looseElement.size}</span>
      </div>
    );
  };

  it("looseElement Event handler can successfully add and remove items", async () => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("looseElement")).toHaveTextContent("0");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("looseElement", {
          detail: JSON.stringify({ kind: "add", id: "1" }),
        }),
      );
    });
    expect(screen.getByTestId("looseElement")).toHaveTextContent("1");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("looseElement", {
          detail: JSON.stringify({ kind: "remove", id: "1" }),
        }),
      );
    });
    expect(screen.getByTestId("looseElement")).toHaveTextContent("0");
  });

  it("looseElement Event handler won't duplicate the same id", async () => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("looseElement")).toHaveTextContent("0");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("looseElement", {
          detail: JSON.stringify({ kind: "add", id: "1" }),
        }),
      );
    });
    expect(screen.getByTestId("looseElement")).toHaveTextContent("1");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("looseElement", {
          detail: JSON.stringify({ kind: "add", id: "1" }),
        }),
      );
    });
    expect(screen.getByTestId("looseElement")).toHaveTextContent("1");
  });
});

describe("dictToDisplay", () => {
  const TestingComponent = (): JSX.Element => {
    const { dictToDisplay } = useContext(CanvasContext);

    return (
      <div>
        <span data-testid="dictToDisplay">{JSON.stringify(dictToDisplay)}</span>
      </div>
    );
  };

  it("dictToDisplay Event handler assign the data correctly to the Context", async () => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("dictToDisplay")).toHaveTextContent("null");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("openDictsModal", {
          detail: JSON.stringify({ test: "value" }),
        }),
      );
    });
    expect(screen.getByTestId("dictToDisplay")).toHaveTextContent(
      '{"test":"value"}',
    );
  });
});

describe("cellToEdit", () => {
  const TestingComponent = (): JSX.Element => {
    const { cellToEdit } = useContext(CanvasContext);

    return (
      <div>
        <span data-testid="cellToEdit">{JSON.stringify(cellToEdit)}</span>
      </div>
    );
  };

  it("looseElement Event handler assign the data correctly to the Context", async () => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("cellToEdit")).toHaveTextContent("null");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("sendCellToSidebar", {
          detail: JSON.stringify({ test: "value" }),
        }),
      );
    });
    expect(screen.getByTestId("cellToEdit")).toHaveTextContent(
      '{\\"test\\":\\"value\\"}',
    );
  });
});

describe("updateServiceOrderItems", () => {
  const InstancesComponent = (): JSX.Element => {
    const { serviceOrderItems, setServiceOrderItems } =
      useContext(CanvasContext);

    useEffect(() => {
      const testInstances = new Map();

      testInstances.set("1", {
        attributes: "value1",
        id: "1",
        action: ActionEnum.CREATE,
      });
      testInstances.set("2", {
        attributes: "value2",
        id: "2",
        action: ActionEnum.CREATE,
      });
      setServiceOrderItems(testInstances);
    }, [setServiceOrderItems]);

    return (
      <div>
        <span data-testid="instancesIds">
          {JSON.stringify(Array.from(serviceOrderItems.keys()))}
        </span>
        {Array.from(serviceOrderItems.entries()).map((value) => (
          <div data-testid={value[0]} key={value[0]}>
            {JSON.stringify(value[1].attributes)}
          </div>
        ))}
      </div>
    );
  };

  it("updateServiceOrderItems Event handler won't assign the data when update is on the instance that isn't already in the Context", async () => {
    await act(async () => render(setup(<InstancesComponent />)));

    expect(screen.getByTestId("instancesIds")).toHaveTextContent('["1","2"]');

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateServiceOrderItems", {
          detail: {
            cell: new ServiceEntityBlock()
              .set("attributes", "value3")
              .set("id", "3"),
            action: ActionEnum.UPDATE,
          },
        }),
      );
    });

    expect(screen.getByTestId("instancesIds")).toHaveTextContent('["1","2"]');
  });

  it("updateServiceOrderItems Event handler will add instance to the Context", async () => {
    await act(async () => render(setup(<InstancesComponent />)));

    expect(screen.getByTestId("instancesIds")).toHaveTextContent('["1","2"]');

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateServiceOrderItems", {
          detail: {
            cell: new ServiceEntityBlock()
              .set("sanitizedAttrs", "value3")
              .set("id", "3"),
            action: ActionEnum.CREATE,
          },
        }),
      );
    });

    expect(screen.getByTestId("instancesIds")).toHaveTextContent(
      '["1","2","3"]',
    );
    expect(screen.getByTestId("3")).toHaveTextContent("value3");
  });

  it("updateServiceOrderItems Event handler updates correctly the instance", async () => {
    await act(async () => render(setup(<InstancesComponent />)));

    expect(screen.getByTestId("2")).toHaveTextContent("value2");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateServiceOrderItems", {
          detail: {
            cell: new ServiceEntityBlock()
              .set("sanitizedAttrs", "updatedValue2")
              .set("id", "2"),
            action: ActionEnum.UPDATE,
          },
        }),
      );
    });
    expect(screen.getByTestId("2")).toHaveTextContent("updatedValue2");
  });
});

describe("updateStencil", () => {
  const TestingComponent = (): JSX.Element => {
    const { stencilState, setStencilState } = useContext(CanvasContext);

    useEffect(() => {
      setStencilState({
        test: { current: 0, min: 0, max: 1 },
        test2: { current: 0, min: 0, max: null },
      });
    }, [setStencilState]);

    if (!stencilState) {
      return <div>Empty</div>;
    }

    return (
      <div>
        {Object.keys(stencilState).map((key) => (
          <span data-testid={`${key}-current`} key={`${key}-current`}>
            {stencilState[key].current}
          </span>
        ))}
        {Object.keys(stencilState).map((key) => (
          <div data-testid={key} key={`${key}-stencil_mock`}>
            <div data-testid={`${key}_body`} className={`${key}_body`} />
            <div data-testid={`${key}_bodyTwo`} className={`${key}_bodyTwo`} />
            <div data-testid={`${key}_text`} className={`${key}_text`} />
          </div>
        ))}
      </div>
    );
  };

  it("updateStencil Event handler assign the data correctly to the Context", async () => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("test-current")).toHaveTextContent("0");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("0");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: { name: "test", action: "add" },
        }),
      );
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("1");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("0");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: { name: "test2", action: "add" },
        }),
      );
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("1");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("1");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: { name: "test3", action: "add" },
        }),
      );
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("1");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("1");
    expect(screen.queryByTestId("test23-current")).toBeNull();

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: { name: "test", action: "remove" },
        }),
      );
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("0");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("1");

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: { name: "test2", action: "remove" },
        }),
      );
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("0");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("0");
  });

  it("updateStencil Event handler correctly apply classNames to the elements in the DOM", async () => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("test_body")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("test_bodyTwo")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("test_text")).not.toHaveClass(
      "stencil_text-disabled",
    );
    expect(screen.getByTestId("test2_body")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("test2_bodyTwo")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("test2_text")).not.toHaveClass(
      "stencil_text-disabled",
    );

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: { name: "test", action: "add" },
        }),
      );
    });

    //expect disabled classes as test got current increased to max value
    expect(screen.getByTestId("test_body")).toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("test_bodyTwo")).toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("test_text")).toHaveClass(
      "stencil_text-disabled",
    );

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: { name: "test2", action: "add" },
        }),
      );
    });

    //expect no disabled classes as test2 doesn't have max set
    expect(screen.getByTestId("test2_body")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("test2_bodyTwo")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("test2_text")).not.toHaveClass(
      "stencil_text-disabled",
    );

    await act(async () => {
      document.dispatchEvent(
        new CustomEvent("updateStencil", {
          detail: { name: "test", action: "remove" },
        }),
      );
    });

    //expect no disabled classes as test got current decreased to 0, below max value
    expect(screen.getByTestId("test_body")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("test_bodyTwo")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("test_text")).not.toHaveClass(
      "stencil_text-disabled",
    );
  });
});
