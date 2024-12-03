import { InstanceAttributeModel } from "@/Core";
import {
  CreateModifierHandler,
  FieldCreator,
  createFormState,
} from "../../ServiceInstanceForm";
import {
  childModel,
  containerModel,
  mockedInstanceWithRelations,
  parentModel,
} from "../Mocks";
import { ServiceEntityBlock } from "../shapes";
import { defineObjectsForJointJS } from "../testSetup";
import { createComposerEntity, updateAttributes } from "./general";

beforeAll(() => {
  defineObjectsForJointJS();
});

describe("createComposerEntity", () => {
  it("creates a new core entity", () => {
    const coreEntity = createComposerEntity({
      serviceModel: parentModel,
      isCore: true,
      isInEditMode: false,
    });

    expect(coreEntity.get("holderName")).toBe(undefined);
    expect(coreEntity.get("isEmbedded")).toBe(undefined);
    expect(coreEntity.get("isCore")).toBe(true);
    expect(coreEntity.attr("header/fill")).toBe(
      "var(--pf-v5-global--palette--gold-400)",
    );
    expect(coreEntity.get("isInEditMode")).toBe(false);
    expect(coreEntity.get("items")).toStrictEqual([[], []]);
  });

  it("creates a new embedded entity", () => {
    const embeddedEntity = createComposerEntity({
      serviceModel: containerModel.embedded_entities[0],
      isCore: false,
      isInEditMode: false,
      isEmbedded: true,
      holderName: containerModel.name,
    });

    expect(embeddedEntity.get("holderName")).toBe(containerModel.name);
    expect(embeddedEntity.get("isEmbedded")).toBe(true);
    expect(embeddedEntity.get("isCore")).toBe(undefined);
    expect(embeddedEntity.attr("header/fill")).toBe(
      "var(--pf-v5-global--palette--blue-400)",
    );
    expect(embeddedEntity.get("isInEditMode")).toBe(false);
  });

  it("creates a new entity with inster-service relations", () => {
    const childEntity = createComposerEntity({
      serviceModel: childModel,
      isCore: false,
      isInEditMode: false,
    });

    expect(childEntity.get("holderName")).toBe(undefined);
    expect(childEntity.get("isEmbedded")).toBe(undefined);
    expect(childEntity.get("isCore")).toBe(undefined);
    expect(childEntity.get("isInEditMode")).toBe(false);
    expect(childEntity.attr("header/fill")).toBe(
      "var(--pf-v5-global--palette--purple-500)",
    );
    expect(childEntity.get("relatedTo")).toMatchObject(new Map());
  });

  it.each`
    serviceModel                           | isCore   | isEmbedded
    ${parentModel}                         | ${false} | ${false}
    ${containerModel}                      | ${true}  | ${false}
    ${containerModel.embedded_entities[0]} | ${false} | ${true}
  `(
    "it appends correctly attributes to the body",
    ({ serviceModel, isCore, isEmbedded }) => {
      const fieldCreator = new FieldCreator(new CreateModifierHandler());
      const fields = fieldCreator.attributesToFields(serviceModel.attributes);
      const attributes = createFormState(fields);

      const coreEntity = createComposerEntity({
        serviceModel,
        isCore,
        isEmbedded,
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
    },
  );
});

describe("updateAttributes", () => {
  it("set attributes, sanitizedAttrs and displayed items on initial update", () => {
    const instanceAsTable = new ServiceEntityBlock().setName(parentModel.name);
    const attributes = mockedInstanceWithRelations.instance
      .active_attributes as InstanceAttributeModel; // instance based on parent-service model
    const isInitial = true;

    updateAttributes(
      instanceAsTable,
      ["name", "service_id"],
      attributes,
      isInitial,
    );

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("items")).toMatchObject([
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

  it("when there is no key attributes only attributes and sanitizedAttrs are set", () => {
    const instanceAsTable = new ServiceEntityBlock().setName(parentModel.name);
    const attributes = mockedInstanceWithRelations.instance
      .active_attributes as InstanceAttributeModel; // instance based on parent-service model
    const isInitial = true;

    updateAttributes(instanceAsTable, [], attributes, isInitial);

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("items")).toMatchObject([[], []]);
  });

  it("sanitized Attributes won't be overridden if isInitial property is set to false or if there are sanitizedAttributes already set", () => {
    //sanitizedAttrs property is updated from the sidebar level as it requires fields to be present
    const instanceAsTable = new ServiceEntityBlock().setName(parentModel.name);
    const attributes = mockedInstanceWithRelations.instance
      .active_attributes as InstanceAttributeModel; // instance based on parent-service model
    const isInitial = true;

    updateAttributes(instanceAsTable, [], attributes, isInitial);

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("items")).toMatchObject([[], []]);

    const updatedIsInitial = false;
    const updatedAttributes = {
      name: "newName",
      service_id: "newId",
      should_deploy_fail: false,
    };

    updateAttributes(instanceAsTable, [], updatedAttributes, updatedIsInitial);

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "newName",
      service_id: "newId",
      should_deploy_fail: false,
    });

    const updatedIsInitial2 = true;

    updateAttributes(instanceAsTable, [], updatedAttributes, updatedIsInitial2);

    expect(instanceAsTable.get("sanitizedAttrs")).toMatchObject({
      name: "test12345",
      service_id: "123412",
      should_deploy_fail: false,
    });
    expect(instanceAsTable.get("instanceAttributes")).toMatchObject({
      name: "newName",
      service_id: "newId",
      should_deploy_fail: false,
    });
  });
});