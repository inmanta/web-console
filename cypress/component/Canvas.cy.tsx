import React from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
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
import instance from "@/UI/Components/Diagram/Mocks/instance.json";
import services from "@/UI/Components/Diagram/Mocks/services.json";

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

const hexToRgb = (hex) => {
  const rValue = parseInt(hex.substring(0, 2), 16);
  const gValue = parseInt(hex.substring(2, 4), 16);
  const bValue = parseInt(hex.substring(4), 16);
  return `rgb(${rValue}, ${gValue}, ${bValue})`;
};

const createShape = (
  shapeName: string,
  name: string,
  id: string,
  force?: boolean,
) => {
  cy.getAriaLabel("new-entity-button").click();
  cy.getAriaLabel("Options menu").click();
  cy.get(".pf-c-select__menu-item").contains(shapeName).click({ force });
  cy.getAriaLabel("TextInput-name").type(name);
  cy.getAriaLabel("TextInput-service_id").type(id);
  cy.getAriaLabel("confirm-button").click();
};

const validateShape = (
  shapeName: string,
  name: string,
  id: string,
  headerColor: string,
) => {
  cy.get('[joint-selector="headerLabel"]')
    .contains(shapeName)
    .should("be.visible");

  cy.getJointSelector("header")
    .invoke("css", "fill")
    .then((value) => {
      expect(value).to.eq(hexToRgb(headerColor));
    });

  cy.getJointSelector("headerLabel").contains(shapeName).should("be.visible");

  cy.getJointSelector("itemLabel_name_value").should("have.text", name);
  cy.getJointSelector("itemLabel_should_deploy_fail").should(
    "have.text",
    "should_deploy" + "\u2026",
  );
  cy.getJointSelector("itemLabel_should_deploy_fail").trigger("mouseover");
  cy.contains("should_deploy_fail").should("be.visible");
  cy.getJointSelector("itemLabel_should_deploy_fail").trigger("mouseout");

  cy.getJointSelector("itemLabel_should_deploy_fail_value").should(
    "have.text",
    "false",
  );
  cy.getJointSelector("itemLabel_service_id_value").should("have.text", id);
};

describe("Canvas.cy.tsx", () => {
  it("creates a core shape", () => {
    const component = setup();

    cy.mount(component);
    //check if canvas is rendered
    cy.get(".canvas").should("be.visible");
    const name = "parent-name-001";
    const id = "parent-id-001";
    //append entity
    createShape("parent-service", name, id);

    //verify visibility and attributes of shape
    validateShape("parent-service", name, id, "f0ab00");
  });

  it("creates a non-core shape", () => {
    const component = setup();
    const name = "child-name-001";
    const id = "child-id-001";

    cy.mount(component);
    //append entity
    createShape("child-service", name, id, true);

    //verify visibility and attributes of shape
    validateShape("child-service", name, id, "0066CC");
  });

  it("creates a shape and its embedded entity, then make successful them", () => {
    const component = setup();

    cy.mount(component);

    const name = "child-name-001";
    const id = "child-id-001";

    createShape("container-service", name, id, true);
    validateShape("container-service", name, id, "0066CC");

    //append embedded entity

    cy.getAriaLabel("new-entity-button").click();
    cy.getAriaLabel("Options menu").click();
    cy.get(".pf-c-select__menu-item")
      .contains("child_container (container-service)")
      .click({ force: true });

    const container_name = "child-name-001";
    cy.getAriaLabel("TextInput-name").type(container_name);
    cy.getAriaLabel("confirm-button").click();

    //verify visibility and attributes of embedded shape

    cy.get('[joint-selector="headerLabel"]')
      .contains("child_container")
      .should("be.visible");

    cy.getInstanceShape("child_container").within(() => {
      cy.getJointSelector("header")
        .invoke("css", "fill")
        .then((value) => {
          expect(value).to.eq(hexToRgb("009596"));
        });

      cy.getJointSelector("itemLabel_name_value").should("have.text", name);

      //connect shapes
      cy.getJointSelector("body").click();
    });

    cy.getInstanceShape("container-service").then((element) => {
      const { left, top } = element.position();
      cy.get(".handle.link")
        .trigger("mousedown")
        .trigger("mousemove", { clientX: left, clientY: top });

      cy.getInstanceShape("container-service").within(() => {
        cy.get(".joint-highlight-mask").should("be.visible");
      });

      cy.root().get(".handle.link").trigger("mouseup");
    });

    cy.get('[data-type="app.Link"]').should("be.visible");
  });

  it("creates a shape that has inter-service relations and make successful connection", () => {
    const component = setup();

    cy.mount(component);

    const parentName = "parent-name-002";
    const parentId = "parent-id-002";
    createShape("parent-service", parentName, parentId);

    const childName = "child-name-002";
    const childId = "child-id-002";
    createShape("child-service", childName, childId, true);

    cy.getInstanceShape("child-service").within(() => {
      cy.getJointSelector("body").click({ force: true });
    });

    cy.getInstanceShape("parent-service").then((element) => {
      const { left, top } = element.position();
      cy.get(".handle.link")
        .trigger("mousedown")
        .trigger("mousemove", { clientX: left, clientY: top });

      cy.getInstanceShape("parent-service").within(() => {
        cy.get(".joint-highlight-mask").should("be.visible");
      });

      cy.root().get(".handle.link").trigger("mouseup");
    });

    cy.get('[data-type="app.Link"]').should("be.visible");
  });

  it("display a shape with candidate attributes", () => {
    const instanceCopy: InstanceWithReferences = JSON.parse(
      JSON.stringify(instance),
    );
    instanceCopy.instance.data.candidate_attributes =
      instanceCopy.instance.data.active_attributes;
    instanceCopy.instance.data.active_attributes = null;

    const component = setup(instanceCopy as unknown as InstanceWithReferences);
    cy.mount(component);

    cy.getInstanceShape(instance.instance.data.service_entity).should(
      "be.visible",
    );
    cy.getJointSelector("info").should("be.visible").trigger("mouseover");

    cy.contains("Candidate Attributes").should("be.visible");
    cy.getJointSelector("info").trigger("mouseout");
    cy.contains("Candidate Attributes").should("not.exist");
  });

  it("display a shape with active attributes", () => {
    const component = setup(instance as unknown as InstanceWithReferences);
    cy.mount(component);

    cy.getInstanceShape(instance.instance.data.service_entity).should(
      "be.visible",
    );
    cy.getJointSelector("info").should("be.visible").trigger("mouseover");

    cy.contains("Active Attributes").should("be.visible");
    cy.getJointSelector("info").trigger("mouseout");
    cy.contains("Active Attributes").should("not.exist");
  });

  it("display a collapsible shape that has truncated values and dict values that should open in modal", () => {
    const component = setup(instance as unknown as InstanceWithReferences);
    cy.mount(component);

    cy.getInstanceShape(instance.instance.data.service_entity).should(
      "be.visible",
    );

    cy.getJointSelector("labelsGroup_1").within(() => {
      cy.get(".record-item-label").should("have.length", 4);
    });
    cy.getJointSelector("button").click();

    cy.getJointSelector("labelsGroup_1").within(() => {
      cy.get(".record-item-label").should("have.length", 16);
    });

    cy.getJointSelector("itemLabel_customerLocationElid_value").should(
      "have.text",
      "1RTDN00KGA" + "\u2026",
    );
    cy.getJointSelector("itemLabel_ont_value").click();
    cy.getAriaLabel("dictModal").should("be.visible");
    cy.get(".pf-c-code-block__code").should(
      "have.text",
      JSON.stringify(instance.instance.data.active_attributes.ont, null, 2),
    );
  });

  it("can edit and delete displayed form", () => {
    const component = setup(instance as unknown as InstanceWithReferences);
    cy.mount(component);

    cy.getInstanceShape(instance.instance.data.service_entity)
      .should("be.visible")
      .click();

    cy.get(".handle.edit").click();
    cy.getAriaLabel("TextInput-orderId").should(
      "have.value",
      instance.instance.data.active_attributes.orderId,
    );
    cy.getAriaLabel("TextInput-orderId").clear().type("new_orderId");
    cy.getAriaLabel("TextInput-name").should(
      "have.value",
      instance.instance.data.active_attributes.name,
    );
    cy.getAriaLabel("TextInput-name").clear().type("new_name");
    cy.getAriaLabel("confirm-button").click();

    cy.getJointSelector("itemLabel_orderId_value").should(
      "have.text",
      "new_orderId",
    );
    cy.getJointSelector("itemLabel_name_value").should("have.text", "new_name");

    cy.get(".handle.delete").click();
    cy.get('[data-type="app.ServiceEntityBlock"]').should("not.exist");
  });
});
