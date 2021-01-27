/// <reference types="Cypress" />
describe("Service instance diagnostics", function () {
  beforeEach(() => {
    cy.server();
    cy.route({
      method: "GET",
      url: "**/api/v2/project",
      response: "fixture:lsm/diag_projects.json",
    });
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_catalog/test_service",
      response: "fixture:lsm/diag_catalog.json",
    });
  });

  it("Should show/hide diagnostics modal on click", function () {
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_inventory/test_service",
      response: "fixture:lsm/diag_dep_error_instance.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/**/resources?current_version=*",
      response: "fixture:lsm/diag_dep_error_resources.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/api/v1/resource/unittest::Resource[internal,name=ad110da0-79c8-4f6d-9a31-80cbad026c9e],v=3?logs=True&log_action=deploy",
      response: "fixture:lsm/diag_dep_error_resource_logs.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/da8743f4-4881-444b-ba8d-b5680dbd7296/log",
      response: "fixture:lsm/diag_val_normal_log.json",
    });
    cy.route({
      method: "GET",
      url: "**/api/v1/compilereport/f2276a6d-97ac-4fca-8156-3f26ce56a594",
      response: "fixture:lsm/diag_val_normal_compile_report.json",
    });
    cy.visit("/lsm/catalog/test_service/inventory");
    cy.get("button#expand-toggle0").click();
    cy.get("#nav-toggle").click();
    cy.get("#rca-button").click();
  });
  it("Should show deployment failure", function () {
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_inventory/test_service",
      response: "fixture:lsm/diag_dep_error_instance.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/**/resources?current_version=*",
      response: "fixture:lsm/diag_dep_error_resources.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/api/v1/resource/unittest::Resource[internal,name=ad110da0-79c8-4f6d-9a31-80cbad026c9e],v=3?logs=True&log_action=deploy",
      response: "fixture:lsm/diag_dep_error_resource_logs.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/da8743f4-4881-444b-ba8d-b5680dbd7296/log",
      response: "fixture:lsm/diag_val_normal_log.json",
    });
    cy.route({
      method: "GET",
      url: "**/api/v1/compilereport/f2276a6d-97ac-4fca-8156-3f26ce56a594",
      response: "fixture:lsm/diag_val_normal_compile_report.json",
    });
    cy.visit("/lsm/catalog/test_service/inventory");
    cy.get("button#expand-toggle0").click();
    cy.get("#nav-toggle").click();
    cy.get("#rca-button").click();
    cy.get("#Deployment-status-error-message-details").should("be.visible");
    cy.get("#Deployment-status-ok-message").should("not.be.visible");
    cy.get("#Validation-status-ok-message").should("be.visible");
  });
  it("Should show validation failure", function () {
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_inventory/test_service",
      response: "fixture:lsm/diag_val_error_instance.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/**/resources?current_version=*",
      response: "fixture:lsm/diag_dep_normal_resources.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/3ae02d7e-eac2-4553-b87f-1359b343e986/log",
      response: "fixture:lsm/diag_val_error_log.json",
    });
    cy.route({
      method: "GET",
      url: "**/api/v1/compilereport/1346d146-fbcf-4df4-95a1-6df375664669",
      response: "fixture:lsm/diag_val_error_compile_report.json",
    });
    cy.visit("/lsm/catalog/test_service/inventory");
    cy.get("button#expand-toggle0").click();
    cy.get("#nav-toggle").click();
    cy.get("#rca-button").click();
    cy.get("#Deployment-status-error-message-details").should("not.be.visible");
    cy.get("#Deployment-status-ok-message").should("be.visible");
    cy.get("#Validation-status-error-message-details").should("be.visible");
    cy.get("#Validation-status-ok-message").should("not.be.visible");
  });
  it("Should show both deployment and validation failure", function () {
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_inventory/test_service",
      response: "fixture:lsm/diag_val_error_instance.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/**/resources?current_version=*",
      response: "fixture:lsm/diag_dep_error_resources.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/api/v1/resource/unittest::Resource[internal,name=ad110da0-79c8-4f6d-9a31-80cbad026c9e],v=3?logs=True&log_action=deploy",
      response: "fixture:lsm/diag_dep_error_resource_logs.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/3ae02d7e-eac2-4553-b87f-1359b343e986/log",
      response: "fixture:lsm/diag_val_error_log.json",
    });
    cy.route({
      method: "GET",
      url: "**/api/v1/compilereport/1346d146-fbcf-4df4-95a1-6df375664669",
      response: "fixture:lsm/diag_val_error_compile_report.json",
    });
    cy.visit("/lsm/catalog/test_service/inventory");
    cy.get("button#expand-toggle0").click();
    cy.get("#nav-toggle").click();
    cy.get("#rca-button").click();
    cy.get("#Deployment-status-error-message-details").should("be.visible");
    cy.get("#Deployment-status-ok-message").should("not.be.visible");
    cy.get("#Validation-status-error-message-details").should("be.visible");
    cy.get("#Validation-status-ok-message").should("not.be.visible");
  });
  it("Should show both deployment and validation status ok", function () {
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_inventory/test_service",
      response: "fixture:lsm/diag_normal_instance.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/**/resources?current_version=*",
      response: "fixture:lsm/diag_dep_normal_resources.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/3ae02d7e-eac2-4553-b87f-1359b343e986/log",
      response: "fixture:lsm/diag_val_normal_log.json",
    });
    cy.route({
      method: "GET",
      url: "**/api/v1/compilereport/027d0262-7247-424f-acb2-f05486ec2e5b",
      response: "fixture:lsm/diag_val_normal_compile_report.json",
    });
    cy.visit("/lsm/catalog/test_service/inventory");
    cy.get("button#expand-toggle0").click();
    cy.get("#nav-toggle").click();
    cy.get("#rca-button").click();
    cy.get("#Deployment-status-error-message-details").should("not.be.visible");
    cy.get("#Deployment-status-ok-message").should("be.visible");
    cy.get("#Validation-status-error-message-details").should("not.be.visible");
    cy.get("#Validation-status-ok-message").should("be.visible");
  });
  it("Should show validation failure on update_rejected", function () {
    cy.route({
      method: "GET",
      url: "**/lsm/v1/service_inventory/test_service",
      response: "fixture:lsm/diag_val_error_instance_update_rejected.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/**/resources?current_version=*",
      response: "fixture:lsm/diag_dep_normal_resources.json",
    });
    cy.route({
      method: "GET",
      url:
        "**/lsm/v1/service_inventory/test_service/3ae02d7e-eac2-4553-b87f-1359b343e986/log",
      response: "fixture:lsm/diag_val_error_log_update_rejected.json",
    });
    cy.route({
      method: "GET",
      url: "**/api/v1/compilereport/1346d146-fbcf-4df4-95a1-6df375664669",
      response: "fixture:lsm/diag_val_error_compile_report.json",
    });
    cy.visit("/lsm/catalog/test_service/inventory");
    cy.get("button#expand-toggle0").click();
    cy.get("#nav-toggle").click();
    cy.get("#rca-button").click();
    cy.get("#Deployment-status-error-message-details").should("not.be.visible");
    cy.get("#Deployment-status-ok-message").should("be.visible");
    cy.get("#Validation-status-error-message-details").should("be.visible");
    cy.get("#Validation-status-ok-message").should("not.be.visible");
  });
});
