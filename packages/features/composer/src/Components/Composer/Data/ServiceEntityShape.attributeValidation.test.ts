import { AttributeModel, InstanceAttributeModel, ServiceModel } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "./ServiceEntityShape";

const createAttribute = (
  name: string,
  type: string,
  defaultValue: boolean | string | null = null
): AttributeModel =>
  ({
    name,
    type,
    modifier: "rw+",
    default_value: defaultValue,
    default_value_set: defaultValue !== null,
    validation_type: null,
    validation_parameters: null,
  }) as unknown as AttributeModel;

const serviceModel: ServiceModel = {
  name: "service",
  environment: "test",
  lifecycle: { initial_state: "start", states: [], transfers: [] },
  attributes: [
    createAttribute("enabled", "bool"),
    createAttribute("dry_run", "bool", false),
    createAttribute("maybe", "bool?"),
  ],
  config: {},
  embedded_entities: [],
  inter_service_relations: [],
  owned_entities: [],
  owner: null,
};

const createShape = (instanceAttributes: InstanceAttributeModel, isNew = false) => {
  const shape = new ServiceEntityShape({
    id: "shape",
    entityType: "core",
    serviceModel,
    instanceAttributes,
    readonly: false,
    isNew,
    lockedOnCanvas: false,
    relationsDictionary: {},
    rootEntities: {},
    interServiceRelations: {},
    embeddedEntities: {},
  });

  shape.validateAttributes();

  return shape;
};

describe("ServiceEntityShape attribute validation of booleans", () => {
  it.each([false, true])("counts a required boolean set to %s as filled", (value) => {
    expect(createShape({ enabled: value, dry_run: value }).hasAttributeValidationErrors).toBe(
      false
    );
  });

  it.each([undefined, null])("counts a required boolean that is %s as missing", (value) => {
    expect(createShape({ enabled: value, dry_run: false }).hasAttributeValidationErrors).toBe(true);
  });

  it("doesn't require an optional boolean", () => {
    expect(
      createShape({ enabled: true, dry_run: true, maybe: null }).hasAttributeValidationErrors
    ).toBe(false);
  });

  it("starts a new entity from its default values, so a default false counts as filled", () => {
    const shape = createShape({ enabled: true }, true);

    expect(shape.instanceAttributes.dry_run).toBe(false);
    expect(shape.hasAttributeValidationErrors).toBe(false);
  });

  it("keeps the values a new entity has over the defaults", () => {
    expect(createShape({ enabled: true, dry_run: true }, true).instanceAttributes.dry_run).toBe(
      true
    );
  });
});
