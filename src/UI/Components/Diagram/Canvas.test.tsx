/*eslint-disable testing-library/no-node-access*/
import React, { act } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { render, queries, within as baseWithin } from "@testing-library/react";
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
  editable: boolean = true,
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
                  editable={editable}
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
  const container = await screen.findByTestId("header-" + name);
  await act(async () => {
    await user.click(container);
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
  const updatedConnectors3 = document.querySelectorAll('[data-type="Link"]');

  expect(updatedEntities3).toHaveLength(assertionTwo);
  expect(updatedConnectors3).toHaveLength(assertionThree);
};

/**
 * Creates a shape with the specified name and ID.
 *
 * @param {string} shapeName - The name of the shape to be selected.
 * @param {string} name - The name to be entered in the TextInput field.
 * @param {string} id - The ID to be entered in the TextInput field.
 * @returns {Promise<void>}
 */
const createShapeWithNameAndId = async (
  shapeName: string,
  name: string,
  id: string,
) => {
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

    const clipboardItems = await navigator.clipboard.read();
    const blob = await clipboardItems[0].getType(clipboardItems[0].types[0]);
    const clipboardText = await blob.text();

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
    const connectors = document.querySelectorAll('[data-type="Link"]');

    expect(entities).toHaveLength(4);
    expect(attrIndicators).toHaveLength(4);
    expect(connectors).toHaveLength(3);

    await act(async () => {
      await user.hover(connectors[0]);
    });

    const removeLinkHandle = document.querySelector(
      ".joint-link_remove-circle",
    ) as Element;
    expect(removeLinkHandle).toBeInTheDocument();

    const labels = document.querySelectorAll(".joint-label-text");
    expect(labels[0]).toBeVisible();
    expect(labels[1]).toBeVisible();
    expect(labels[0]).toHaveTextContent("child-service");
    expect(labels[1]).toHaveTextContent("parent-service");
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

  it("deletes shape correctly", async () => {
    const component = setup(mockedInstanceWithReferences);
    render(component);

    const attrIndicators = await screen.findAllByJointSelector("info");
    const entities = document.querySelectorAll(
      '[data-type="app.ServiceEntityBlock"]',
    );
    const connectors = document.querySelectorAll('[data-type="Link"]');

    expect(entities).toHaveLength(4);
    expect(attrIndicators).toHaveLength(4);
    expect(connectors).toHaveLength(3);

    await deleteAndAssert("parent-service", 3, 1);
    await deleteAndAssert("child-service", 2, 1);
    await deleteAndAssert("child_container", 1, 0);
  });

  it("when editable prop is set to false, disable interactions", async () => {
    const component = setup(
      mockedInstanceWithReferences,
      services as unknown as ServiceModel[],
      false,
    );
    render(component);

    const attrIndicators = await screen.findAllByJointSelector("info");
    const entities = document.querySelectorAll(
      '[data-type="app.ServiceEntityBlock"]',
    );
    const connectors = document.querySelectorAll('[data-type="Link"]');

    expect(entities).toHaveLength(4);
    expect(attrIndicators).toHaveLength(4);
    expect(connectors).toHaveLength(3);

    expect(screen.getByLabelText("new-entity-button")).toBeDisabled();
    expect(screen.getByText("Deploy")).toBeDisabled();

    await act(async () => {
      await user.click(entities[0]);
    });

    const editHandle = document.querySelector(
      '[data-action="edit"]',
    ) as Element;
    expect(editHandle).toBeNull();

    const deleteHandle = document.querySelector(
      '[data-action="delete"]',
    ) as Element;
    expect(deleteHandle).toBeNull();

    const linkHandle = document.querySelector(
      '[data-action="link"]',
    ) as Element;
    expect(linkHandle).toBeNull();

    await act(async () => {
      await user.hover(connectors[0]);
    });

    const removeLinkHandle = document.querySelector(
      ".joint-link_remove-circle",
    ) as Element;
    expect(removeLinkHandle).toBeNull();

    const labels = document.querySelectorAll(".joint-label-text");
    expect(labels[0]).toBeVisible();
    expect(labels[1]).toBeVisible();
    expect(labels[0]).toHaveTextContent("child-service");
    expect(labels[1]).toHaveTextContent("parent-service");
  });
});
