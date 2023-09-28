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
import services from "./Mocks/services.json";
import "@testing-library/jest-dom";
import { Colors } from "./shapes";

const allQueries = {
  ...queries,
  ...customQueries,
};

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
    const button = screen.getByLabelText("new-entity-button");
    await act(async () => {
      await userEvent.click(button);
    });

    const select = screen.getByLabelText("Options menu");
    await act(async () => {
      await userEvent.click(select);
    });
    await act(async () => {
      await userEvent.click(screen.getByRole("option", { name: shapeName }));
    });

    const input1 = screen.getByLabelText("TextInput-name");
    await act(async () => {
      await userEvent.type(input1, name);
    });

    const input2 = screen.getByLabelText("TextInput-service_id");
    await act(async () => {
      await userEvent.type(input2, id);
    });

    await act(async () => {
      await userEvent.click(screen.getByLabelText("confirm-button"));
    });

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

    //create shape
    const button = screen.getByLabelText("new-entity-button");
    await act(async () => {
      await userEvent.click(button);
    });

    const select = screen.getByLabelText("Options menu");
    await act(async () => {
      await userEvent.click(select);
    });
    await act(async () => {
      await userEvent.click(screen.getByRole("option", { name: shapeName }));
    });

    const input1 = screen.getByLabelText("TextInput-name");
    await act(async () => {
      await userEvent.type(input1, name);
    });

    const input2 = screen.getByLabelText("TextInput-service_id");
    await act(async () => {
      await userEvent.type(input2, id);
    });

    await act(async () => {
      await userEvent.click(screen.getByLabelText("confirm-button"));
    });
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
      await userEvent.click(button);
    });

    //create shape
    const select = screen.getByLabelText("Options menu");
    await act(async () => {
      await userEvent.click(select);
    });

    await act(async () => {
      await userEvent.click(
        screen.getByRole("option", {
          name: "child_container (container-service)",
        }),
      );
    });

    const input1 = screen.getByLabelText("TextInput-name");
    await act(async () => {
      await userEvent.type(input1, name);
    });

    await act(async () => {
      await userEvent.click(screen.getByLabelText("confirm-button"));
    });

    //validate shape
    const headerLabel = screen.getByJointSelector("headerLabel");
    expect(headerLabel).toHaveTextContent("child_container");

    const header = screen.getByJointSelector("header");
    expect(header).toHaveAttribute("fill", Colors.embedded);

    const nameValue = screen.getByJointSelector("itemLabel_name_value");
    expect(nameValue).toHaveTextContent(name);
  });

  // it("renders created and connected service with embedded entity successfully", async () => {
  //   const component = setup();
  //   render(component);
  //   const name = "name-001";
  //   const id = "id-001";

  //   //create shape
  //   const button = screen.getByLabelText("new-entity-button");
  //   await act(async () => {
  //     await userEvent.click(button);
  //   });

  //   const select = screen.getByLabelText("Options menu");
  //   await act(async () => {
  //     await userEvent.click(select);
  //   });
  //   await act(async () => {
  //     await userEvent.click(
  //       screen.getByRole("option", { name: "container-service" }),
  //     );
  //   });

  //   const input1 = screen.getByLabelText("TextInput-name");
  //   await act(async () => {
  //     await userEvent.type(input1, name);
  //   });

  //   const input2 = screen.getByLabelText("TextInput-service_id");
  //   await act(async () => {
  //     await userEvent.type(input2, id);
  //   });

  //   await act(async () => {
  //     await userEvent.click(screen.getByLabelText("confirm-button"));
  //   });

  //   const containerName = "name-002";

  //   await act(async () => {
  //     await userEvent.click(button);
  //   });

  //   //create embedded shape
  //   const containerSelect = screen.getByLabelText("Options menu");
  //   await act(async () => {
  //     await userEvent.click(containerSelect);
  //   });
  //   await act(async () => {
  //     await userEvent.click(
  //       screen.getByRole("option", {
  //         name: "child_container (container-service)",
  //       }),
  //     );
  //   });

  //   const containerInput = screen.getByLabelText("TextInput-name");
  //   await act(async () => {
  //     await userEvent.type(containerInput, containerName);
  //   });

  //   await act(async () => {
  //     await userEvent.click(screen.getByLabelText("confirm-button"));
  //   });
  // });

  // it("renders created services with inter-service relation successfully", async () => {
  //   const component = setup();
  //   render(component);
  //   const name = "name-001";
  //   const id = "id-001";
  //   await createShape("parent-service", name, id);
  //   await validateShape("parent-service", name, id, "#F0AB00");
  // });

  // it("renders edits correctly services", async () => {
  //   const component = setup();
  //   render(component);
  //   const name = "name-001";
  //   const id = "id-001";
  //   await createShape("parent-service", name, id);
  //   await validateShape("parent-service", name, id, "#F0AB00");
  // });

  // it("renders deletes correctly services", async () => {
  //   const component = setup();
  //   render(component);
  //   const name = "name-001";
  //   const id = "id-001";
  //   await createShape("parent-service", name, id);
  //   await validateShape("parent-service", name, id, "#F0AB00");
  // });

  // it("renders deletes correctly connections between services", async () => {
  //   const component = setup();
  //   render(component);
  //   const name = "name-001";
  //   const id = "id-001";
  //   //embedded
  //   await createShape("parent-service", name, id);
  //   await validateShape("parent-service", name, id, "#F0AB00");
  //   //inter-service
  // });

  // it("renders truncated values and label correctly, appends tooltips onto them", async () => {
  //   const component = setup();
  //   render(component);
  //   const name = "name-001";
  //   const id = "id-001";
  //   //embedded
  //   await createShape("parent-service", name, id);
  //   await validateShape("parent-service", name, id, "#F0AB00");
  //   //inter-service
  // });
});
