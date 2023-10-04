import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
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
} from "@/UI";
import Canvas from "@/UI/Components/Diagram/Canvas";
import { mockedInstanceWithReferences } from "./Mock";
import services from "./Mocks/services.json";
import "@testing-library/jest-dom";
import { Colors } from "./shapes";

const allQueries = {
  ...queries,
  ...customQueries,
};
const user = userEvent.setup();
const screen = baseWithin(document.body, allQueries);

const setup = (instance?: InstanceWithReferences) => {
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

  return (
    <MemoryRouter initialEntries={[{ search: "?env=aaa" }]}>
      <StoreProvider store={store}>
        <DependencyProvider
          dependencies={{ ...dependencies, environmentHandler }}
        >
          <Canvas
            services={services as unknown as ServiceModel[]}
            mainServiceName={"parent-service"}
            instance={instance}
          />
        </DependencyProvider>
      </StoreProvider>
    </MemoryRouter>
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
  await new Promise((r) => setTimeout(r, 10));

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

  const select = screen.getByLabelText("Options menu");
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
      rotate: jest.fn().mockImplementation(() => ({
        translate: jest.fn().mockImplementation(() => ({
          rotate: jest.fn(),
        })),
      })),
      rotateFromVector: jest
        .fn()
        .mockImplementation(() => global.SVGSVGElement),
      scale: jest.fn().mockImplementation(() => global.SVGSVGElement),
      scaleNonUniform: jest.fn().mockImplementation(() => global.SVGSVGElement),
      skewX: jest.fn().mockImplementation(() => global.SVGSVGElement),
      skewY: jest.fn().mockImplementation(() => global.SVGSVGElement),
      translate: jest.fn().mockImplementation(() => ({
        multiply: jest.fn().mockImplementation(() => ({
          multiply: jest.fn().mockImplementation(() => global.SVGSVGElement),
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
    expect(header).toHaveAttribute("fill", Colors.core);

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
    expect(header).toHaveAttribute("fill", Colors.base);

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

  it("renders created embedded entity successfully", async () => {
    const component = setup();
    render(component);
    const name = "name-001";
    const button = screen.getByLabelText("new-entity-button");

    await act(async () => {
      await user.click(button);
    });

    //create shape
    const select = screen.getByLabelText("Options menu");
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
    expect(header).toHaveAttribute("fill", Colors.embedded);

    const nameValue = screen.getByJointSelector("itemLabel_name_value");
    expect(nameValue).toHaveTextContent(name);
  });

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
  //   const containerSelect = screen.getByLabelText("Options menu");
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
  //   await new Promise((r) => setTimeout(r, 10));

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

  //   await new Promise((r) => setTimeout(r, 10));

  //   const highlight = document.querySelector(".joint-highlight-mask");
  //   await new Promise((r) => setTimeout(r, 10));

  //   expect(highlight).toBeVisible();
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

    const selectMenu = screen.getByLabelText("Options menu");
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

  it("deletes correctly ", async () => {
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
});