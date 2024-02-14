/*eslint-disable testing-library/no-node-access*/
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import {
  render,
  act,
  queries,
  within as baseWithin,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { RemoteData, ServiceModel } from "@/Core";
import { getStoreInstance } from "@/Data";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
import { dependencies } from "@/Test";
import * as customQueries from "@/Test/Utils/custom-queries";
import {
  DependencyProvider,
  EnvironmentHandlerImpl,
  PrimaryRouteManager,
  words,
} from "@/UI";
import Canvas from "@/UI/Components/Diagram/Canvas";
import CustomRouter from "@/UI/Routing/CustomRouter";
import history from "@/UI/Routing/history";
import {
  mockedInstanceThree,
  mockedInstanceThreeServiceModel,
  mockedInstanceTwo,
  mockedInstanceTwoServiceModel,
  mockedInstanceWithReferences,
} from "./Mock";
import services from "./Mocks/services.json";
import "@testing-library/jest-dom";

const allQueries = {
  ...queries,
  ...customQueries,
};
const user = userEvent.setup();
const screen = baseWithin(document.body, allQueries);

const setup = (
  instance?: InstanceWithReferences,
  serviceModels: ServiceModel[] = services as unknown as ServiceModel[],
) => {
  const store = getStoreInstance();

  const environmentHandler = EnvironmentHandlerImpl(
    useLocation,
    PrimaryRouteManager(""),
  );

  store.dispatch.environment.setEnvironments(
    RemoteData.success([
      {
        id: "aaa",
        name: "env-a",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
      },
      {
        id: "bbb",
        name: "env-b",
        project_id: "ppp",
        repo_branch: "branch",
        repo_url: "repo",
        projectName: "project",
      },
    ]),
  );
  history.push("/?env=aaa");
  return (
    <CustomRouter history={history}>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{ ...dependencies, environmentHandler }}
        >
          <Routes>
            <Route
              path="/"
              element={
                <Canvas
                  services={serviceModels}
                  mainServiceName={"parent-service"}
                  instance={instance}
                />
              }
            />
            <Route
              path="/lsm/catalog/parent-service/inventory"
              element={<></>}
            />
          </Routes>
        </DependencyProvider>
      </StoreProvider>
    </CustomRouter>
  );
};

const deleteAndAssert = async (
  name: string,
  assertionTwo: number,
  assertionThree: number,
) => {
  const childContainer = await screen.findByText(name);
  await act(async () => {
    await user.click(childContainer);
  });

  const handle3 = document.querySelector('[data-action="delete"]') as Element;

  await act(async () => {
    await user.click(handle3);
  });
  //Delay has to be done as library base itself on listeners that are async
  await new Promise((resolve) => setTimeout(resolve, 100));

  const updatedEntities3 = document.querySelectorAll(
    '[data-type="app.ServiceEntityBlock"]',
  );
  const updatedConnectors3 = document.querySelectorAll(
    '[data-type="app.Link"]',
  );

  expect(updatedEntities3).toHaveLength(assertionTwo);
  expect(updatedConnectors3).toHaveLength(assertionThree);
};

const createShapeWithNameAndId = async (shapeName: string, name, id) => {
  const button = screen.getByLabelText("new-entity-button");
  await act(async () => {
    await user.click(button);
  });

  const select = screen.getByLabelText("service-picker");
  await act(async () => {
    await user.click(select);
  });
  await act(async () => {
    await user.click(screen.getByRole("option", { name: shapeName }));
  });

  const input1 = screen.getByLabelText("TextInput-name");
  await act(async () => {
    await user.type(input1, name);
  });

  const input2 = screen.getByLabelText("TextInput-service_id");
  await act(async () => {
    await user.type(input2, id);
  });

  await act(async () => {
    await user.click(screen.getByLabelText("confirm-button"));
  });
};

beforeEach(() => {
  Object.defineProperty(window, "SVGAngle", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      new: jest.fn(),
      prototype: jest.fn(),
      SVG_ANGLETYPE_UNKNOWN: 0,
      SVG_ANGLETYPE_UNSPECIFIED: 1,
      SVG_ANGLETYPE_DEG: 2,
      SVG_ANGLETYPE_RAD: 3,
      SVG_ANGLETYPE_GRAD: 4,
    })),
  });
  Object.defineProperty(window, "ResizeObserver", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    })),
  });
  Object.defineProperty(global.SVGSVGElement.prototype, "createSVGMatrix", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      martix: jest.fn(() => [[]]),
      a: 0,
      b: 0,
      c: 0,
      d: 0,
      e: 0,
      f: 0,
      flipX: jest.fn().mockImplementation(() => global.SVGSVGElement),
      flipY: jest.fn().mockImplementation(() => global.SVGSVGElement),
      inverse: jest.fn().mockImplementation(() => global.SVGSVGElement),
      multiply: jest.fn().mockImplementation(() => global.SVGSVGElement),
      rotate: jest.fn().mockImplementation(() => global.SVGSVGElement),
      rotateFromVector: jest
        .fn()
        .mockImplementation(() => global.SVGSVGElement),
      scale: jest.fn().mockImplementation(() => global.SVGSVGElement),
      scaleNonUniform: jest.fn().mockImplementation(() => global.SVGSVGElement),
      skewX: jest.fn().mockImplementation(() => global.SVGSVGElement),
      skewY: jest.fn().mockImplementation(() => global.SVGSVGElement),
      translate: jest.fn().mockImplementation(() => ({
        multiply: jest.fn().mockImplementation(() => ({
          multiply: jest.fn().mockImplementation(() => ({
            inverse: jest.fn().mockImplementation(() => global.SVGSVGElement),
          })),
        })),
        rotate: jest.fn().mockImplementation(() => ({
          translate: jest.fn().mockImplementation(() => ({
            rotate: jest.fn().mockImplementation(() => ({
              translate: jest
                .fn()
                .mockImplementation(() => global.SVGSVGElement),
            })),
          })),
        })),
      })),
    })),
  });

  Object.defineProperty(global.SVGSVGElement.prototype, "createSVGPoint", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      x: 0,
      y: 0,
      matrixTransform: jest.fn().mockImplementation(() => ({
        x: 0,
        y: 0,
      })),
    })),
  });

  Object.defineProperty(global.SVGSVGElement.prototype, "createSVGTransform", {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      angle: 0,
      matrix: {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        multiply: jest.fn(),
      },
      setMatrix: jest.fn(),
      setTranslate: jest.fn(),
    })),
  });
  window.SVGPathElement = jest.fn();

  Object.defineProperty(global.SVGElement.prototype, "getComputedTextLength", {
    writable: true,
    value: jest.fn().mockReturnValue(0),
  });

  Object.defineProperty(global.SVGElement.prototype, "getBBox", {
    writable: true,
    value: jest.fn().mockReturnValue({
      x: 0,
      y: 0,
    }),
  });

  Object.defineProperty(global.SVGElement.prototype, "getScreenCTM", {
    writable: true,
    value: jest.fn().mockReturnValue(0),
  });

  Object.defineProperty(Document.prototype, "elementFromPoint", {
    writable: true,
    value: jest.fn().mockReturnValue(null),
  });
});

describe("Canvas.tsx", () => {
  it("renders canvas correctly", async () => {
    const component = setup();
    render(component);
  });

  it("navigating out of the View works correctly", async () => {
    const component = setup();
    render(component);
    expect(window.location.pathname).toEqual("/");

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Cancel" }));
    });
    expect(window.location.pathname).toEqual(
      "/lsm/catalog/parent-service/inventory",
    );
  });

  it("renders created core service successfully", async () => {
    const component = setup();
    render(component);
    const shapeName = "parent-service";
    const name = "name-001";
    const id = "id-001";

    await createShapeWithNameAndId(shapeName, name, id);

    //validate shape
    const headerLabel = await screen.findByJointSelector("headerLabel");
    expect(headerLabel).toHaveTextContent(shapeName);

    const header = screen.getByJointSelector("header");
    expect(header).toHaveClass("-core");

    const nameValue = screen.getByJointSelector("itemLabel_name_value");
    expect(nameValue).toHaveTextContent(name);

    const shouldDeployValue = screen.getByJointSelector(
      "itemLabel_should_deploy_fail_value",
    );
    expect(shouldDeployValue).toHaveTextContent("false");

    expect(
      screen.getByJointSelector("itemLabel_service_id_value"),
    ).toHaveTextContent(id);
  });

  it("renders created non-core service successfully", async () => {
    const component = setup();
    render(component);
    const shapeName = "child-service";
    const name = "name-001";
    const id = "id-001";

    await createShapeWithNameAndId(shapeName, name, id);

    //validate shape
    const headerLabel = await screen.findByJointSelector("headerLabel");
    expect(headerLabel).toHaveTextContent(shapeName);

    const header = screen.getByJointSelector("header");
    expect(header).not.toHaveClass("-core");
    expect(header).not.toHaveClass("-embedded");

    const nameValue = screen.getByJointSelector("itemLabel_name_value");
    expect(nameValue).toHaveTextContent(name);

    const shouldDeployValue = screen.getByJointSelector(
      "itemLabel_should_deploy_fail_value",
    );
    expect(shouldDeployValue).toHaveTextContent("false");

    expect(
      screen.getByJointSelector("itemLabel_service_id_value"),
    ).toHaveTextContent(id);
  });

  it("renders shapes with expandable attributes + with Dict value", async () => {
    const component = setup(mockedInstanceTwo, [mockedInstanceTwoServiceModel]);
    render(component);

    //wrapper that holds attr values
    const attrs = await screen.findByJointSelector("labelsGroup_1");

    expect(attrs.childNodes).toHaveLength(4);

    const button = await screen.findByJointSelector("toggleButton");
    await act(async () => {
      await user.click(button);
    });

    const attrsTwo = await screen.findByJointSelector("labelsGroup_1");
    expect(attrsTwo.childNodes).toHaveLength(9);

    const refreshedButton = await screen.findByJointSelector("toggleButton");
    await act(async () => {
      await user.click(refreshedButton);
    });

    const attrsThree = await screen.findByJointSelector("labelsGroup_1");
    expect(attrsThree.childNodes).toHaveLength(4);
  });

  it("renders shapes dict Value that can be viewed in dict Modal", async () => {
    const component = setup(mockedInstanceTwo, [mockedInstanceTwoServiceModel]);
    render(component);

    const button = await screen.findByJointSelector("toggleButton");
    await act(async () => {
      await user.click(button);
    });

    const dictValue = await screen.findByJointSelector(
      "itemLabel_dictOne_value",
    );
    await act(async () => {
      await user.click(dictValue.children[0]);
    });

    const modal = await screen.findByRole("dialog");
    expect(modal).toBeVisible();

    const title = document.querySelector(".pf-v5-c-modal-box__title");
    expect(title).toHaveTextContent(
      words("inventory.instanceComposer.dictModal")("dictOne"),
    );

    const value = document.querySelector(".pf-v5-c-code-block__code");
    expect(value).toHaveTextContent("{}");

    const copyButton = await screen.findByLabelText("Copy to clipboard");
    await act(async () => {
      await user.click(copyButton);
    });

    const clipboardText = await navigator.clipboard.readText();
    expect(clipboardText).toEqual("{}");

    const closeButton = await screen.findByLabelText("Close");
    await act(async () => {
      await user.click(closeButton);
    });

    expect(modal).not.toBeVisible();
  });

  it("renders created embedded entity successfully", async () => {
    const component = setup();
    render(component);
    const name = "name-001";
    const button = screen.getByLabelText("new-entity-button");

    await act(async () => {
      await user.click(button);
    });

    //create shape
    const select = screen.getByLabelText("service-picker");
    await act(async () => {
      await user.click(select);
    });

    await act(async () => {
      await user.click(
        screen.getByRole("option", {
          name: "child_container (container-service)",
        }),
      );
    });

    const input1 = screen.getByLabelText("TextInput-name");
    await act(async () => {
      await user.type(input1, name);
    });

    await act(async () => {
      await user.click(screen.getByLabelText("confirm-button"));
    });

    //validate shape
    const headerLabel = await screen.findByJointSelector("headerLabel");
    expect(headerLabel).toHaveTextContent("child_container");

    const header = screen.getByJointSelector("header");
    expect(header).toHaveClass("-embedded");

    const nameValue = screen.getByJointSelector("itemLabel_name_value");
    expect(nameValue).toHaveTextContent(name);
  });

  // // this test case fail to highlight after click on link button
  // it("highlights available entities to connect", async () => {
  //   const component = setup();
  //   render(component);
  //   const name = "name-001";
  //   const id = "id-001";
  //   await createShapeWithNameAndId("container-service", name, id);

  //   //create shape
  //   const button = screen.getByLabelText("new-entity-button");
  //   const containerName = "name-002";

  //   await act(async () => {
  //     await user.click(button);
  //   });

  //   //create embedded shape
  //   const containerSelect = screen.getByLabelText("service-picker");
  //   await act(async () => {
  //     await user.click(containerSelect);
  //   });
  //   await act(async () => {
  //     await user.click(
  //       screen.getByRole("option", {
  //         name: "child_container (container-service)",
  //       }),
  //     );
  //   });

  //   const containerInput = screen.getByLabelText("TextInput-name");
  //   await act(async () => {
  //     await user.type(containerInput, containerName);
  //   });

  //   await act(async () => {
  //     await user.click(screen.getByLabelText("confirm-button"));
  //   });
  //   await new Promise(process.nextTick);

  //   const shapes = document.querySelectorAll(
  //     '[data-type="app.ServiceEntityBlock"]',
  //   );

  //   await act(async () => {
  //     await user.click(shapes[0]);
  //   });

  //   const handle = document.querySelector('[data-action="link"]') as Element;
  //   await act(async () => {
  //     await user.pointer(
  //       // click at link element
  //       { keys: "[MouseLeft>]", target: handle },
  //     );
  //   });

  //   await new Promise(process.nextTick);

  //   const highlight = document.querySelector(".joint-highlight-mask");
  //   await new Promise(process.nextTick);

  //   expect(highlight).toBeVisible();
  // });

  // // this test case fail to connect shapes after pressing on link button in one shape and releasing it on another
  // it("connects core entity with embedded/related one together", async () => {
  //   const component = setup();
  //   render(component);
  //   const name = "name-001";
  //   const id = "id-001";
  //   await createShapeWithNameAndId("container-service", name, id);

  //   //create shape
  //   const button = screen.getByLabelText("new-entity-button");
  //   const containerName = "name-002";

  //   await act(async () => {
  //     await user.click(button);
  //   });

  //   //create embedded shape
  //   const containerSelect = screen.getByLabelText("service-picker");
  //   await act(async () => {
  //     await user.click(containerSelect);
  //   });
  //   await act(async () => {
  //     await user.click(
  //       screen.getByRole("option", {
  //         name: "child_container (container-service)",
  //       }),
  //     );
  //   });

  //   const containerInput = screen.getByLabelText("TextInput-name");
  //   await act(async () => {
  //     await user.type(containerInput, containerName);
  //   });

  //   await act(async () => {
  //     await user.click(screen.getByLabelText("confirm-button"));
  //   });
  //   await new Promise(process.nextTick);

  //   const shapes = document.querySelectorAll(
  //     '[data-type="app.ServiceEntityBlock"]',
  //   );

  //   await act(async () => {
  //     await user.click(shapes[0]);
  //   });

  //   const handle = document.querySelector('[data-action="link"]') as Element;
  //   await act(async () => {
  //     await user.pointer(
  //       // click at link element
  //       { keys: "[MouseLeft>]", target: handle },
  //       { keys: "[/MouseLeft]", target: shapes[1] },
  //     );
  //   });

  //   await new Promise(process.nextTick);

  //   const links = document.querySelectorAll('[data-type="app.Link"]');

  //   expect(links).toHaveLength(1);
  // });

  it("edits correctly services", async () => {
    const component = setup();
    render(component);

    const shapeName = "container-service";
    const name = "name-001";
    const id = "id-001";
    await createShapeWithNameAndId(shapeName, name, id);

    const headerLabel = await screen.findByJointSelector("headerLabel");
    expect(headerLabel).toHaveTextContent(shapeName);

    const shape = document.querySelector(
      '[data-type="app.ServiceEntityBlock"]',
    ) as Element;

    await act(async () => {
      await user.click(shape);
    });

    const handle = document.querySelector('[data-action="edit"]') as Element;

    await act(async () => {
      await user.click(handle);
    });

    const dialog = await screen.findByRole("dialog");

    expect(dialog).toBeVisible();

    const selectMenu = screen.getByLabelText("service-picker");
    expect(selectMenu).toBeDisabled();
    expect(selectMenu).toHaveTextContent("container-service");

    const nameInput = screen.getByLabelText("TextInput-name");
    expect(nameInput).toHaveValue(name);

    const newName = "new-name";
    await act(async () => {
      await user.type(nameInput, `{selectAll}{backspace}${newName}`);
    });

    const confirmButton = screen.getByLabelText("confirm-button");
    await act(async () => {
      await user.click(confirmButton);
    });

    const nameValue = screen.getByJointSelector("itemLabel_name_value");
    expect(nameValue).toHaveTextContent(newName);
  });

  it("renders deleting single instance correctly", async () => {
    const component = setup();
    render(component);

    const shapeName = "container-service";
    const name = "name-001";
    const id = "id-001";

    await createShapeWithNameAndId(shapeName, name, id);

    const headerLabel = await screen.findByJointSelector("headerLabel");
    expect(headerLabel).toHaveTextContent(shapeName);

    const shape = document.querySelector(
      '[data-type="app.ServiceEntityBlock"]',
    ) as Element;

    await act(async () => {
      await user.click(shape);
    });

    const handle = document.querySelector('[data-action="delete"]') as Element;

    await act(async () => {
      await user.click(handle);
    });

    const shape2 = document.querySelector(
      '[data-type="app.ServiceEntityBlock"]',
    ) as Element;

    expect(shape2).toBeNull();
  });

  it("renders correctly fetched instances", async () => {
    const component = setup(mockedInstanceWithReferences);
    render(component);

    const attrIndicators = await screen.findAllByJointSelector("info");
    const entities = document.querySelectorAll(
      '[data-type="app.ServiceEntityBlock"]',
    );
    const connectors = document.querySelectorAll('[data-type="app.Link"]');

    expect(entities).toHaveLength(4);
    expect(attrIndicators).toHaveLength(4);
    expect(connectors).toHaveLength(3);
  });

  it("renders correctly fetched instances with missing optional entities", async () => {
    const component = setup(mockedInstanceThree, [
      mockedInstanceThreeServiceModel,
    ]);
    render(component);

    const attrIndicators = await screen.findAllByJointSelector("info");
    const entities = document.querySelectorAll(
      '[data-type="app.ServiceEntityBlock"]',
    );
    expect(entities).toHaveLength(1);
    expect(attrIndicators).toHaveLength(1);
  });

  it("deletes shape correctly ", async () => {
    const component = setup(mockedInstanceWithReferences);
    render(component);

    const attrIndicators = await screen.findAllByJointSelector("info");
    const entities = document.querySelectorAll(
      '[data-type="app.ServiceEntityBlock"]',
    );
    const connectors = document.querySelectorAll('[data-type="app.Link"]');

    expect(entities).toHaveLength(4);
    expect(attrIndicators).toHaveLength(4);
    expect(connectors).toHaveLength(3);

    await deleteAndAssert("parent-service", 3, 1);
    await deleteAndAssert("child-service", 2, 1);
    await deleteAndAssert("child_container", 1, 0);
  });

  // // For some reason click on deleteButton doesn't trigger action
  // it("deletes links correctly ", async () => {
  //   //links in this test case cover all of the possible
  //   const component = setup(mockedInstanceWithReferences);
  //   render(component);

  //   await screen.findAllByJointSelector("info");
  //   const connectors = document.querySelectorAll('[data-type="app.Link"]');

  //   expect(connectors).toHaveLength(3);

  //   fireEvent.mouseEnter(connectors[0]);
  //   //Delay has to be done as library base itself on listeners that are async
  //   await new Promise(process.nextTick);

  //   const deleteButton = document.querySelector(
  //     '[data-tool-name="button"]',
  //   ) as Element;

  //   await act(async () => {
  //     await user.click(deleteButton);
  //   });

  //   const connectors2 = document.querySelectorAll('[data-type="app.Link"]');

  //   expect(connectors2).toHaveLength(2);
  // });

  it("creates valid object for order_api when creating entity from scratch", () => {});
  it("creates valid object for order_api when editing entity", () => {});

  it("WHEN strict_modifier_enforcement is set to false for some services THEN for only these instances and their connections editing/deleting is blocked", () => {});
  // it("zoom-in/zoom-out", async () => {
  //   // TODO: Resolve "TypeError: viewport.getCTM is not a function"
  //   const component = setup();
  //   render(component);

  //   const paper = document.querySelector(".joint-layers") as Element;
  //   //default value, that is set by the library but for some reason it doesn't apply it here(probably due to the mocked functions)
  //   paper.setAttribute("transform", "matrix(1,0,0,1,40,40)");

  //   const zoomIn = document.querySelector(".zoom-in") as Element;
  //   const zoomOut = document.querySelector(".zoom-out") as Element;

  //   await act(async () => {
  //     await user.click(zoomOut);
  //   });
  //   expect(paper.getAttribute("transform")).toEqual("matrix(1,05,05,1,42,42)");

  //   await act(async () => {
  //     await user.click(zoomIn);
  //   });
  //   expect(paper.getAttribute("transform")).toEqual("matrix(1,0,0,1,40,40)");
  // });
});
