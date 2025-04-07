import React, { act, useContext, useEffect } from "react";
import { dia } from "@inmanta/rappid";
import "@testing-library/jest-dom";
import { screen } from "@testing-library/dom";
import { render, renderHook } from "@testing-library/react";
import { ActionEnum, EventActionEnum } from "../interfaces";
import { ComposerPaper } from "../paper";
import { ServiceEntityBlock } from "../shapes";
import { defineObjectsForJointJS } from "../testSetup";
import { CanvasProvider } from "./CanvasProvider";
import { CanvasContext } from "./Context";
import { EventWrapper } from "./EventWrapper";
import {
  dispatchAddInterServiceRelationToTracker,
  dispatchLooseElement,
  dispatchRemoveInterServiceRelationFromTracker,
  dispatchSendCellToSidebar,
  dispatchUpdateInterServiceRelations,
  dispatchUpdateServiceOrderItems,
  dispatchUpdateStencil,
} from "./dispatchers";

const setup = (testingComponent: JSX.Element) => {
  return (
    <CanvasProvider>
      <EventWrapper>{testingComponent}</EventWrapper>
    </CanvasProvider>
  );
};

describe("looseElement event handler - triggered when entity is being added to the canvas, gets or loose connection to other entity - keep track on the unconnected entities", () => {
  const TestingComponent = (): JSX.Element => {
    const { looseElement } = useContext(CanvasContext);

    return (
      <div>
        <span data-testid="looseElement">{looseElement.size}</span>
      </div>
    );
  };

  it("looseElement Event handler can successfully add and remove items", async() => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("looseElement")).toHaveTextContent("0");

    await act(async() => {
      dispatchLooseElement(EventActionEnum.ADD, "1");
    });
    expect(screen.getByTestId("looseElement")).toHaveTextContent("1");

    await act(async() => {
      dispatchLooseElement(EventActionEnum.REMOVE, "1");
    });
    expect(screen.getByTestId("looseElement")).toHaveTextContent("0");
  });

  it("looseElement Event handler won't duplicate the same id", async() => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("looseElement")).toHaveTextContent("0");

    await act(async() => {
      dispatchLooseElement(EventActionEnum.ADD, "1");
    });
    expect(screen.getByTestId("looseElement")).toHaveTextContent("1");

    await act(async() => {
      dispatchLooseElement(EventActionEnum.ADD, "1");
    });
    expect(screen.getByTestId("looseElement")).toHaveTextContent("1");
  });
});

describe("dictToDisplay - event handler that accepts dictionary value to display it in the modal as we aren't displaying those in the canvas", () => {
  const TestingComponent = (): JSX.Element => {
    const { dictToDisplay } = useContext(CanvasContext);

    return (
      <div>
        <span data-testid="dictToDisplay">{JSON.stringify(dictToDisplay)}</span>
      </div>
    );
  };

  it("dictToDisplay Event handler assign the data correctly to the Context", async() => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("dictToDisplay")).toHaveTextContent("null");

    await act(async() => {
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

describe("cellToEdit - event handler that receives cell object from the canvas to pass it to the Right Sidebar component", () => {
  it("sendCellToSidebar Event handler assign the data correctly to the Context", async() => {
    defineObjectsForJointJS();
    const { result } = renderHook(
      () => {
        const { cellToEdit } = useContext(CanvasContext);

        return cellToEdit;
      },
      {
        wrapper: ({ children }) => (
          <CanvasProvider>
            <EventWrapper>{children}</EventWrapper>
          </CanvasProvider>
        ),
      },
    );

    expect(result.current).toBeNull();

    const graph = new dia.Graph();
    const paper = new ComposerPaper({}, graph, true).paper;
    const cell = new ServiceEntityBlock();

    graph.addCell(cell);

    await act(async() => {
      dispatchSendCellToSidebar(paper.findViewByModel(cell));
    });

    expect(result.current).not.toBeNull();
    expect(result.current?.model.id).toEqual(cell.id);

    await act(async() => {
      dispatchSendCellToSidebar(null);
    });

    expect(result.current).toBeNull();
  });
});

describe("updateServiceOrderItems - event handler that keeps track of the elements of the instance that should be converted to the complete instance at the deploy", () => {
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

  it("updateServiceOrderItems Event handler won't assign the data when update is for the the inter-service relation instance that aren't added in the Context", async() => {
    await act(async() => render(setup(<InstancesComponent />)));

    expect(screen.getByTestId("instancesIds")).toHaveTextContent('["1","2"]');

    await act(async() => {
      const cell = new ServiceEntityBlock()
        .set("sanitizedAttrs", "value3")
        .set("id", "3");

      dispatchUpdateServiceOrderItems(cell, ActionEnum.UPDATE);
    });

    expect(screen.getByTestId("instancesIds")).toHaveTextContent('["1","2"]');
  });

  it("updateServiceOrderItems Event handler will add instance to the Context", async() => {
    await act(async() => render(setup(<InstancesComponent />)));

    expect(screen.getByTestId("instancesIds")).toHaveTextContent('["1","2"]');

    await act(async() => {
      const cell = new ServiceEntityBlock()
        .set("sanitizedAttrs", "value3")
        .set("id", "3");

      dispatchUpdateServiceOrderItems(cell, ActionEnum.CREATE);
    });

    expect(screen.getByTestId("instancesIds")).toHaveTextContent(
      '["1","2","3"]',
    );
    expect(screen.getByTestId("3")).toHaveTextContent("value3");
  });

  it("updateServiceOrderItems Event handler updates correctly the instance", async() => {
    await act(async() => render(setup(<InstancesComponent />)));

    expect(screen.getByTestId("2")).toHaveTextContent("value2");

    await act(async() => {
      const cell = new ServiceEntityBlock()
        .set("sanitizedAttrs", "updatedValue2")
        .set("id", "2");

      dispatchUpdateServiceOrderItems(cell, ActionEnum.UPDATE);
    });
    expect(screen.getByTestId("2")).toHaveTextContent("updatedValue2");
  });
});

describe("updateStencil - eventHandler that updates how many elements(embedded/inter-service relation) are in the canvas, to keep track to disable/enable stencil elements from the left sidebar", () => {
  const TestingComponent = (): JSX.Element => {
    const { stencilState, setStencilState } = useContext(CanvasContext);

    useEffect(() => {
      setStencilState({
        test: { currentAmount: 0, min: 0, max: 1 },
        test2: { currentAmount: 0, min: 0, max: null },
      });
    }, [setStencilState]);

    if (!stencilState) {
      return <div>Empty</div>;
    }

    return (
      <div>
        {Object.keys(stencilState).map((key) => (
          <span data-testid={`${key}-current`} key={`${key}-current`}>
            {stencilState[key].currentAmount}
          </span>
        ))}
        {Object.keys(stencilState).map((key) => (
          <div data-testid={key} key={`${key}-stencil_mock`}>
            <div data-testid={`body_${key}`} aria-labelledby={`body_${key}`} />
            <div
              data-testid={`bodyTwo_${key}`}
              aria-labelledby={`bodyTwo_${key}`}
            />
            <div data-testid={`text_${key}`} aria-labelledby={`text_${key}`} />
          </div>
        ))}
      </div>
    );
  };

  it("updateStencil Event handler assign the data correctly to the Context", async() => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("test-current")).toHaveTextContent("0");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("0");

    await act(async() => {
      dispatchUpdateStencil("test", EventActionEnum.ADD);
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("1");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("0");

    await act(async() => {
      dispatchUpdateStencil("test2", EventActionEnum.ADD);
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("1");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("1");

    await act(async() => {
      dispatchUpdateStencil("test3", EventActionEnum.ADD);
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("1");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("1");
    expect(screen.queryByTestId("test23-current")).toBeNull();

    await act(async() => {
      dispatchUpdateStencil("test", EventActionEnum.REMOVE);
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("0");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("1");

    await act(async() => {
      dispatchUpdateStencil("test2", EventActionEnum.REMOVE);
    });

    expect(screen.getByTestId("test-current")).toHaveTextContent("0");
    expect(screen.getByTestId("test2-current")).toHaveTextContent("0");
  });

  it("updateStencil Event handler correctly apply classNames to the elements in the DOM", async() => {
    render(setup(<TestingComponent />));

    expect(screen.getByTestId("body_test")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("bodyTwo_test")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("text_test")).not.toHaveClass(
      "stencil_text-disabled",
    );
    expect(screen.getByTestId("body_test2")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("bodyTwo_test2")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("text_test2")).not.toHaveClass(
      "stencil_text-disabled",
    );

    await act(async() => {
      dispatchUpdateStencil("test", EventActionEnum.ADD);
    });

    //expect disabled classes as test got current increased to max value
    expect(screen.getByTestId("body_test")).toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("bodyTwo_test")).toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("text_test")).toHaveClass(
      "stencil_text-disabled",
    );

    await act(async() => {
      dispatchUpdateStencil("test2", EventActionEnum.ADD);
    });

    //expect no disabled classes as test2 doesn't have max set
    expect(screen.getByTestId("body_test2")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("bodyTwo_test2")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("text_test2")).not.toHaveClass(
      "stencil_text-disabled",
    );

    await act(async() => {
      dispatchUpdateStencil("test", EventActionEnum.REMOVE);
    });

    //expect no disabled classes as test got current decreased to 0, below max value
    expect(screen.getByTestId("body_test")).not.toHaveClass(
      "stencil_accent-disabled",
    );
    expect(screen.getByTestId("bodyTwo_test")).not.toHaveClass(
      "stencil_body-disabled",
    );
    expect(screen.getByTestId("text_test")).not.toHaveClass(
      "stencil_text-disabled",
    );
  });
});

describe("addInterServiceRelationToTracker - eventHandler that adds to the Map inter-service relations with defined minimal count to the Map- it doesn't take care of verifying values, that is taken care of outside of the event handler", () => {
  it("adds successfully interServiceRelation to the Map", async() => {
    const { result } = renderHook(
      () => {
        const { interServiceRelationsOnCanvas } = useContext(CanvasContext);

        return interServiceRelationsOnCanvas;
      },
      {
        wrapper: ({ children }) => (
          <CanvasProvider>
            <EventWrapper>{children}</EventWrapper>
          </CanvasProvider>
        ),
      },
    );

    expect(result.current).toStrictEqual(new Map());

    await act(async() => {
      dispatchAddInterServiceRelationToTracker("1", "test", [
        { currentAmount: 0, min: 1, name: "test2" },
      ]);
    });

    expect(result.current).toStrictEqual(
      new Map().set("1", {
        name: "test",
        relations: [{ currentAmount: 0, min: 1, name: "test2" }],
      }),
    );
  });
});

describe("removeInterServiceRelationFromTracker - event handler that removes inter-service relations from the tracker, it happens when cell with given ID is removed from the canvas", () => {
  it("removes successfully the interServiceRationTracker from the Map", async() => {
    const { result } = renderHook(
      () => {
        const {
          interServiceRelationsOnCanvas,
          setInterServiceRelationsOnCanvas,
        } = useContext(CanvasContext);

        useEffect(() => {
          setInterServiceRelationsOnCanvas(
            new Map().set("1", {
              name: "test",
              relations: [{ currentAmount: 0, min: 1, name: "test2" }],
            }),
          );
        }, [setInterServiceRelationsOnCanvas]);

        return interServiceRelationsOnCanvas;
      },
      {
        wrapper: ({ children }) => (
          <CanvasProvider>
            <EventWrapper>{children}</EventWrapper>
          </CanvasProvider>
        ),
      },
    );

    expect(result.current).toStrictEqual(
      new Map().set("1", {
        name: "test",
        relations: [{ currentAmount: 0, min: 1, name: "test2" }],
      }),
    );

    await act(async() => {
      dispatchRemoveInterServiceRelationFromTracker("1");
    });

    expect(result.current).toStrictEqual(new Map());
  });
});

describe("updateInterServiceRelations", () => {
  it("updates successfully the interServiceRationTracker in the Map", async() => {
    const { result } = renderHook(
      () => {
        const {
          interServiceRelationsOnCanvas,
          setInterServiceRelationsOnCanvas,
        } = useContext(CanvasContext);

        useEffect(() => {
          setInterServiceRelationsOnCanvas(
            new Map().set("1", {
              name: "test",
              relations: [{ currentAmount: 0, min: 1, name: "test2" }],
            }),
          );
        }, [setInterServiceRelationsOnCanvas]);

        return interServiceRelationsOnCanvas;
      },
      {
        wrapper: ({ children }) => (
          <CanvasProvider>
            <EventWrapper>{children}</EventWrapper>
          </CanvasProvider>
        ),
      },
    );

    const name = "test2";
    const id = "1";

    await act(async() => {
      dispatchUpdateInterServiceRelations(EventActionEnum.ADD, name, id);
    });

    expect(result.current).toStrictEqual(
      new Map().set("1", {
        name: "test",
        relations: [{ currentAmount: 1, min: 1, name: "test2" }],
      }),
    );

    await act(async() => {
      dispatchUpdateInterServiceRelations(EventActionEnum.REMOVE, name, id);
    });

    expect(result.current).toStrictEqual(
      new Map().set("1", {
        name: "test",
        relations: [{ currentAmount: 0, min: 1, name: "test2" }],
      }),
    );
  });
});
