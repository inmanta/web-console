import { InstanceAttributeModel } from "@/Core";
import { CreateModifierHandler, FieldCreator, createFormState } from "../../ServiceInstanceForm";
import { childModel, containerModel, mockedInstanceWithRelations, parentModel } from "../Mocks";
import { defineObjectsForJointJS } from "../testSetup";
import { ServiceEntityBlock } from ".";

beforeAll(() => {
  defineObjectsForJointJS();
});

describe("ServiceEntityBlock constructor", () => {
  it("creates a new core entity", () => {
    const coreEntity = new ServiceEntityBlock({
      serviceModel: parentModel,
      isCore: true,
      isInEditMode: false,
    });

    expect(coreEntity.get("holderName")).toBe(undefined);
    expect(coreEntity.get("isEmbeddedEntity")).toBe(undefined);
    expect(coreEntity.get("isCore")).toBe(true);
    expect(coreEntity.attr("header/fill")).toBe("var(--pf-t--chart--color--yellow--300, #dca614)");
    expect(coreEntity.get("isInEditMode")).toBe(false);
    expect(coreEntity.get("items")).toStrictEqual([[], []]);
  });

  it("creates a new embedded entity", () => {
    const embeddedEntity = new ServiceEntityBlock({
      serviceModel: containerModel.embedded_entities[0],
      isCore: false,
      isInEditMode: false,
      isEmbeddedEntity: true,
      holderName: containerModel.name,
    });

    expect(embeddedEntity.get("holderName")).toBe(containerModel.name);
    expect(embeddedEntity.get("isEmbeddedEntity")).toBe(true);
    expect(embeddedEntity.get("isCore")).toBe(undefined);
    expect(embeddedEntity.attr("header/fill")).toBe(
      "var(--pf-t--chart--color--blue--400, #004d99)"
    );
    expect(embeddedEntity.get("isInEditMode")).toBe(false);
    expect(embeddedEntity.getName()).toBe(containerModel.embedded_entities[0].name);
    expect(embeddedEntity.attr("headerLabel/text")).toBe(containerModel.embedded_entities[0].name);
  });

  it("creates a new embedded entit with name equal to type if the type is present", () => {
    const embeddedEntity = new ServiceEntityBlock({
      serviceModel: {
        ...containerModel.embedded_entities[0],
        type: "test-type",
      },
      isCore: false,
      isInEditMode: false,
      isEmbeddedEntity: true,
      holderName: containerModel.name,
    });

    expect(embeddedEntity.get("holderName")).toBe(containerModel.name);
    expect(embeddedEntity.get("isEmbeddedEntity")).toBe(true);
    expect(embeddedEntity.get("isCore")).toBe(undefined);
    expect(embeddedEntity.attr("header/fill")).toBe(
      "var(--pf-t--chart--color--blue--400, #004d99)"
    );
    expect(embeddedEntity.get("isInEditMode")).toBe(false);

    expect(embeddedEntity.getName()).toBe(containerModel.embedded_entities[0].name);
    expect(embeddedEntity.attr("headerLabel/text")).toBe("test-type");
  });

  it("creates a new entity with inter-service relations", () => {
    const dispatchSpy = vi.spyOn(document, "dispatchEvent");

    const childEntity = new ServiceEntityBlock({
      serviceModel: childModel,
      isCore: false,
      isInEditMode: false,
    });

    expect(childEntity.get("holderName")).toBe(undefined);
    expect(childEntity.get("isEmbeddedEntity")).toBe(undefined);
    expect(childEntity.get("isCore")).toBe(undefined);
    expect(childEntity.get("isInEditMode")).toBe(false);
    expect(childEntity.attr("header/fill")).toBe("var(--pf-t--chart--color--purple--300, #5e40be)");
    expect(childEntity.get("relatedTo")).toMatchObject(new Map());

    expect(dispatchSpy).toHaveBeenCalledWith(
      new CustomEvent("addInterServiceRelationToTracker", {
        detail: {
          id: childEntity.id,
        },
      })
    );
  });

  it("creates a new entity with inter-service relations from inventory stencil", () => {
    const dispatchSpy = vi.spyOn(document, "dispatchEvent");
    const childEntity = new ServiceEntityBlock({
      serviceModel: childModel,
      isCore: false,
      isInEditMode: false,
      isFromInventoryStencil: true,
    });

    expect(childEntity.get("holderName")).toBe(undefined);
    expect(childEntity.get("isEmbeddedEntity")).toBe(undefined);
    expect(childEntity.get("isCore")).toBe(undefined);
    expect(childEntity.get("isInEditMode")).toBe(false);
    expect(childEntity.attr("header/fill")).toBe("var(--pf-t--chart--color--purple--300, #5e40be)");

    expect(dispatchSpy).toHaveBeenCalledTimes(0);
  });

  it.each`
    serviceModel                           | isCore   | isEmbeddedEntity
    ${parentModel}                         | ${false} | ${false}
    ${containerModel}                      | ${true}  | ${false}
    ${containerModel.embedded_entities[0]} | ${false} | ${true}
  `("it appends correctly attributes to the body", ({ serviceModel, isCore, isEmbeddedEntity }) => {
    const fieldCreator = new FieldCreator(new CreateModifierHandler());
    const fields = fieldCreator.attributesToFields(serviceModel.attributes);
    const attributes = createFormState(fields);

    const coreEntity = new ServiceEntityBlock({
      serviceModel,
      isCore,
      isEmbeddedEntity,
      isInEditMode: false,
      attributes,
    });

    expect(coreEntity.get("items")).toStrictEqual([
      [
        {
          id: "name",
          label: "name",
          span: 2,
        },
      ],
      [
        {
          id: "name_value",
          label: "",
        },
      ],
    ]);
  });
});

describe("ServiceEntityBlock.updateEntityAttributes", () => {
  it("sets attributes, sanitizedAttrs and displayed items on initial update with a service model that has key attributes", () => {
    // Create a mock service model with key attributes
    const serviceModelWithKeyAttrs = {
      ...parentModel,
      key_attributes: ["name", "service_id"],
    };

    const instanceEntityBlock = new ServiceEntityBlock({
      serviceModel: serviceModelWithKeyAttrs,
      isCore: false,
      isInEditMode: false,
    });

    const attributes = mockedInstanceWithRelations.instance
      .active_attributes as InstanceAttributeModel; // instance based on parent-service model
    const isInitial = true;

    // Ensure sanitizedAttrs is not pre-initialized (fix the empty object issue)
    instanceEntityBlock.unset("sanitizedAttrs");

    instanceEntityBlock.updateEntityAttributes(attributes, isInitial);

    expect(instanceEntityBlock.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceEntityBlock.get("instanceAttributes")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceEntityBlock.get("items")).toMatchObject([
      [
        {
          id: "name",
          label: "name",
          span: 2,
        },
        {
          id: "service_id",
          label: "service_id",
          span: 2,
        },
      ],
      [
        {
          id: "name_value",
          label: "test12345",
        },
        {
          id: "service_id_value",
          label: "123412",
        },
      ],
    ]);
  });

  it("when there are no key attributes, only attributes and sanitizedAttrs are set without display items", () => {
    // Create a service model without key attributes (remove both key_attributes and service_identity)
    const serviceModelWithoutKeyAttrs = {
      ...parentModel,
      key_attributes: [], // Empty key attributes
      service_identity: undefined, // Remove service_identity to ensure no key attributes
    };

    const instanceEntityBlock = new ServiceEntityBlock({
      serviceModel: serviceModelWithoutKeyAttrs,
      isCore: false,
      isInEditMode: false,
    });

    const attributes = mockedInstanceWithRelations.instance
      .active_attributes as InstanceAttributeModel; // instance based on parent-service model
    const isInitial = true;

    // Ensure sanitizedAttrs is not pre-initialized (fix the empty object issue)
    instanceEntityBlock.unset("sanitizedAttrs");

    instanceEntityBlock.updateEntityAttributes(attributes, isInitial);

    expect(instanceEntityBlock.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceEntityBlock.get("instanceAttributes")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceEntityBlock.get("items")).toMatchObject([[], []]);
  });

  it("sanitized attributes won't be overridden when isInitial is false or when sanitizedAttrs already exist", () => {
    // sanitizedAttrs property is updated from the sidebar level as it requires fields to be present
    const serviceModelWithoutKeyAttrs = {
      ...parentModel,
      key_attributes: [], // Empty key attributes to focus on sanitized attrs behavior
      service_identity: undefined, // Remove service_identity to ensure no key attributes
    };

    const instanceEntityBlock = new ServiceEntityBlock({
      serviceModel: serviceModelWithoutKeyAttrs,
      isCore: false,
      isInEditMode: false,
    });

    const attributes = mockedInstanceWithRelations.instance
      .active_attributes as InstanceAttributeModel; // instance based on parent-service model
    const isInitial = true;

    // Ensure sanitizedAttrs is not pre-initialized (fix the empty object issue)
    instanceEntityBlock.unset("sanitizedAttrs");

    // First call with isInitial = true should set sanitizedAttrs
    instanceEntityBlock.updateEntityAttributes(attributes, isInitial);

    expect(instanceEntityBlock.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceEntityBlock.get("instanceAttributes")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });

    // Second call with isInitial = false should update instanceAttributes but not sanitizedAttrs
    const updatedAttributes = {
      name: "newName",
      service_id: "newId",
      should_deploy_fail: false,
    };

    instanceEntityBlock.updateEntityAttributes(updatedAttributes, false);

    expect(instanceEntityBlock.get("sanitizedAttrs")).toMatchObject({
      name: "test12345", // Should remain unchanged
      service_id: "123412", // Should remain unchanged
      should_deploy_fail: false,
    });
    expect(instanceEntityBlock.get("instanceAttributes")).toMatchObject({
      name: "newName", // Should be updated
      service_id: "newId", // Should be updated
      should_deploy_fail: false,
    });

    // Third call with isInitial = true but sanitizedAttrs already exist should not override sanitizedAttrs
    instanceEntityBlock.updateEntityAttributes(updatedAttributes, true);

    expect(instanceEntityBlock.get("sanitizedAttrs")).toMatchObject({
      name: "test12345", // Should remain unchanged
      service_id: "123412", // Should remain unchanged
      should_deploy_fail: false,
    });
    expect(instanceEntityBlock.get("instanceAttributes")).toMatchObject({
      name: "newName", // Should be updated
      service_id: "newId", // Should be updated
      should_deploy_fail: false,
    });
  });
});
