import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoreProvider } from "easy-peasy";
import { RemoteData, ServiceModel } from "@/Core";
import { getStoreInstance } from "@/Data";
import { InstanceWithReferences } from "@/Data/Managers/GetInstanceWithRelations/interface";
import { dependencies } from "@/Test";
import {
  DependencyProvider,
  EnvironmentHandlerImpl,
  PrimaryRouteManager,
} from "@/UI";
import Canvas from "@/UI/Components/Diagram/Canvas";
import services from "./Mocks/services.json";
import "@testing-library/jest-dom";

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
});

const createShape = async (shapeName: string, name: string, id: string) => {
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
  console.log(screen.getByLabelText("TextInput-service_id"));
  await act(async () => {
    await userEvent.click(screen.getByLabelText("confirm-button"));
  });
};
// const validateShape = (
//   shapeName: string,
//   name: string,
//   id: string,
//   headerColor: string,
// ) => {
//   const headerLabel = document.querySelector('[joint-selector="headerLabel"]');
//   expect(headerLabel).toHaveTextContent(shapeName);
//   const header = document.querySelector('[joint-selector="header"]');
//   expect(header).toHaveAttribute(`fill:"#F0AB00"`);
//   // cy.getJointSelector("headerLabel").contains(shapeName).should("be.visible");
//   // cy.getJointSelector("itemLabel_name_value").should("have.text", name);
//   // cy.getJointSelector("itemLabel_should_deploy_fail").should(
//   //   "have.text",
//   //   "should_deploy" + "\u2026",
//   // );
//   // cy.getJointSelector("itemLabel_should_deploy_fail").trigger("mouseover");
//   // cy.contains("should_deploy_fail").should("be.visible");
//   // cy.getJointSelector("itemLabel_should_deploy_fail").trigger("mouseout");
//   // cy.getJointSelector("itemLabel_should_deploy_fail_value").should(
//   //   "have.text",
//   //   "false",
//   // );
//   // cy.getJointSelector("itemLabel_service_id_value").should("have.text", id);
// };

describe("Canvas.tsx", () => {
  it("render", async () => {
    const component = setup();
    render(component);
    const name = "name-001";
    const id = "id-001";
    await createShape("parent-service", name, id);
    // await validateShape("parent-service", name, id, "#F0AB00");
  });
});
