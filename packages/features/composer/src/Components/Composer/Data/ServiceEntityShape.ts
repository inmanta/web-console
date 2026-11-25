import {
  EmbeddedEntity,
  Field,
  InstanceAttributeModel,
  ServiceInstanceModel,
  ServiceModel,
  ServiceOrderItemAction,
  ServiceOrderItemRequest,
  State,
  words,
} from "@inmanta/web-console-core";
import { sanitizeAttributes } from "@inmanta/web-console-core/Common";
import {
  createFormState,
  CreateModifierHandler,
  FieldCreator,
} from "@inmanta/web-console-core/FormState";
import { SuggestionVariables } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { SHAPE_HEADER_HEIGHT, SHAPE_ROW_HEIGHT, SHAPE_WIDTH } from "../config/shapeConfig";
import {
  getEmbeddedEntityMissingConnections,
  getInterServiceRelationMissingConnections,
} from "./Helpers/connectionValidationUtils";
import { RelationsDictionary } from "./Helpers/createRelationsDictionary";
import { findTopRootInstance } from "./Helpers/findTopRootInstance";
import { getEmbeddedEntityKey, getInterServiceRelationKey } from "./Helpers/shapeUtils";

/**
 * Base configuration for a service entity rendered on the composer canvas.
 */
export interface ServiceEntityBase {
  entityType: EntityShapeType;
  serviceModel: ServiceModel | EmbeddedEntity;
  instanceAttributes: InstanceAttributeModel;
  isNew: boolean;
  rootEntities: Record<string, string[]>;
  interServiceRelations: Record<string, string[]>;
  embeddedEntities: Record<string, string[]>;
  id: string;

  /** The lifecycle state of an existing instance; a new entity has none yet. */
  instanceState?: State;

  /**
   * The attribute sets of an existing instance, to view each of them; an embedded entity
   * carries its own slice of its root instance's sets. The editable one (getEditableSet)
   * is where `instanceAttributes` starts from.
   */
  attributeSets?: AttributeSets;
}

/**
 * The candidate and active attributes an existing instance has. Only the sets the instance
 * has are present.
 */
export interface AttributeSets {
  candidate?: InstanceAttributeModel;
  active?: InstanceAttributeModel;
}

/** The name of an attribute set: "candidate" or "active". */
export type AttributeSetName = keyof AttributeSets;

/**
 * The attribute sets of an existing instance: only the sets it has, or undefined when it has
 * neither, so an instance without sets offers none to view.
 */
export const getInstanceAttributeSets = (
  instance: Pick<ServiceInstanceModel, "candidate_attributes" | "active_attributes">
): AttributeSets | undefined =>
  instance.candidate_attributes || instance.active_attributes
    ? {
        ...(instance.candidate_attributes ? { candidate: instance.candidate_attributes } : {}),
        ...(instance.active_attributes ? { active: instance.active_attributes } : {}),
      }
    : undefined;

/**
 * Full configuration used to construct a `ServiceEntityShape`.
 */
export interface ServiceEntityOptions extends ServiceEntityBase {
  relationsDictionary: RelationsDictionary;
}

export type EntityShapeType = "core" | "embedded" | "relation";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

/**
 * A new entity's attributes with the default values of its model under them, the values its form
 * starts from (EntityForm). A new entity from a placeholder, such as a required embedded entity,
 * has none of its own yet, so without them its card would count the defaults as missing.
 *
 * @param serviceModel - The model of the entity
 * @param attributes - The attributes it has
 * @returns The attributes, with the defaults of the ones it doesn't have
 */
export const withDefaultValues = (
  serviceModel: ServiceModel | EmbeddedEntity,
  attributes: InstanceAttributeModel
): InstanceAttributeModel => {
  const fields = new FieldCreator(new CreateModifierHandler()).attributesToFields(
    serviceModel.attributes ?? []
  );

  return { ...createFormState(fields), ...attributes };
};

/**
 * Whether an embedded attribute has room for one more entity next to the ones assigned to it.
 *
 * @param attribute - The embedded attribute
 * @param assigned - The ids assigned to each attribute, by attribute name
 */
const hasRoomIn = (attribute: EmbeddedEntity, assigned: Map<string, string[]>): boolean =>
  attribute.upper_limit === null ||
  attribute.upper_limit === undefined ||
  (assigned.get(attribute.name) ?? []).length < Number(attribute.upper_limit);

/**
 * A service, embedded entity, or inter-service relation on the composer canvas.
 * Tracks its connections, attributes and position, and provides helpers for validation
 * and order-item generation. It holds no rendering state: the canvas draws it.
 * The composer changes it in place; CanvasActions says when that re-renders the canvas.
 */
export class ServiceEntityShape {
  readonly id: string;
  connections: Map<string, string[]>;
  serviceModel: ServiceModel | EmbeddedEntity;
  relationsDictionary: RelationsDictionary;
  instanceAttributes: InstanceAttributeModel;
  sanitizedAttrs: InstanceAttributeModel;
  isNew: boolean;
  entityType: EntityShapeType;
  hasAttributeValidationErrors: boolean;
  isLayersCollapsed: boolean;

  /** The lifecycle state of the existing instance this shape shows, if any. */
  instanceState: State | null;

  /** The attribute sets of the existing instance this shape shows, if any. */
  attributeSets: AttributeSets | null;

  /**
   * Whether the instance is staged to be deleted on deploy. The card stays on the canvas,
   * marked, so the delete can be undone; the shape's order item becomes the delete, and the
   * other shapes' order items leave out their references to it.
   */
  isMarkedForDeletion: boolean;

  /** Hidden because an ancestor collapsed its layers. */
  isHidden: boolean;
  parentIds: Set<string>;

  /**
   * The instances an existing instance relates to as it was loaded. Taking one of them off the
   * canvas keeps the relation (removeShape), so the update doesn't unlink it.
   */
  readonly recordedRelationIds: ReadonlySet<string>;

  /** The size the canvas measured for the card, used by the layouts. */
  size: Size;
  private _position: Point;

  constructor(initializationOptions: ServiceEntityOptions) {
    this.id = initializationOptions.id;
    this.connections = new Map<string, string[]>();
    this.serviceModel = initializationOptions.serviceModel;
    this.relationsDictionary = initializationOptions.relationsDictionary;
    this.instanceAttributes = initializationOptions.isNew
      ? withDefaultValues(
          initializationOptions.serviceModel,
          initializationOptions.instanceAttributes
        )
      : initializationOptions.instanceAttributes;
    this.sanitizedAttrs = structuredClone(this.instanceAttributes);
    this.isNew = initializationOptions.isNew;
    this.entityType = initializationOptions.entityType;
    this.hasAttributeValidationErrors = false;
    this.isLayersCollapsed = false;
    this.instanceState = initializationOptions.instanceState ?? null;
    this.attributeSets = initializationOptions.attributeSets ?? null;
    this.isMarkedForDeletion = false;
    this.isHidden = false;
    this.parentIds = new Set<string>();
    // An estimate until the canvas has measured the card
    this.size = {
      width: SHAPE_WIDTH,
      height: SHAPE_HEADER_HEIGHT + Math.max(1, this.getKeyAttributes().length) * SHAPE_ROW_HEIGHT,
    };
    this._position = { x: 0, y: 0 };

    const { interServiceRelations, embeddedEntities, rootEntities } = initializationOptions;

    this.recordedRelationIds = new Set(
      initializationOptions.isNew ? [] : Object.values(interServiceRelations).flat()
    );

    // add all existing inter-service relations and embedded entities to the connections map
    Object.entries(interServiceRelations).forEach(([relationType, relationId]) => {
      this.connections.set(relationType, relationId);
    });
    Object.entries(embeddedEntities).forEach(([entityType, entityId]) => {
      this.connections.set(entityType, entityId);
    });
    Object.entries(rootEntities).forEach(([entityType, entityId]) => {
      this.connections.set(entityType, entityId);
    });
    Object.values(rootEntities).forEach((ids) => {
      ids.forEach((id) => this.parentIds.add(id));
    });
  }

  /**
   * The position of the card's top-left corner.
   */
  getPosition(): Point {
    return { ...this._position };
  }

  /**
   * Moves the card's top-left corner.
   *
   * @returns the shape, to chain calls
   */
  setPosition(x: number, y: number): this {
    this._position = { x, y };

    return this;
  }

  /**
   * The card's bounding box on the canvas.
   */
  getBBox(): Point & Size {
    return { ...this._position, ...this.size };
  }

  /**
   * The name shown in the card header: "type - name" when both are set, otherwise either.
   */
  getDisplayName(): string {
    const typeName =
      "type" in this.serviceModel && this.serviceModel.type ? this.serviceModel.type : undefined;
    const serviceName = this.serviceModel.name;

    return typeName && serviceName
      ? words("instanceComposer.label.embeddedAs")(typeName, serviceName)
      : typeName || serviceName;
  }

  /**
   * The attribute that names this instance, and its value: the service identity, or for an
   * embedded entity its first key attribute. The value is empty while it isn't filled in.
   */
  getIdentity(): { name: string; value: string } | null {
    const name =
      ("service_identity" in this.serviceModel && this.serviceModel.service_identity) ||
      this.serviceModel.key_attributes?.[0];

    if (!name) {
      return null;
    }

    const value = this.instanceAttributes[name];

    return {
      name,
      value:
        value === undefined || value === null || typeof value === "object" ? "" : String(value),
    };
  }

  /**
   * The key attributes shown on the card, with their current values.
   */
  getDisplayAttributes(): Array<{ name: string; value: string }> {
    return this.getKeyAttributes().map((key) => {
      const value = this.instanceAttributes[key];

      if (value === undefined || value === null) {
        return { name: key, value: "" };
      }
      if (typeof value === "object" && !Array.isArray(value)) {
        return { name: key, value: "{...}" };
      }

      return { name: key, value: String(value) };
    });
  }

  getEntityType(): string {
    return "type" in this.serviceModel && this.serviceModel.type
      ? this.serviceModel.type
      : this.serviceModel.name;
  }

  getEntityName(): string {
    return this.serviceModel.name;
  }

  /**
   * Resolves the top root instance shape: an embedded shape climbs its parent
   * chain to the first non-embedded ancestor, a top-level shape is its own root.
   *
   * @param canvasState - The full canvas state map, keyed by shape id.
   * @returns The top root instance shape, or undefined if it can't be resolved.
   */
  getRootInstance(canvasState: Map<string, ServiceEntityShape>): ServiceEntityShape | undefined {
    return findTopRootInstance(this, canvasState);
  }

  /**
   * Builds the values that resolve `${...}` variables in a suggestion's parameter
   * name. An embedded shape's suggestions resolve against its owning instance -
   * entity_type, the identifying attribute, and id all belong to the service
   * instance, not the embedded part - so we resolve against the top root instance;
   * a top-level shape uses itself.
   *
   * The identifying attribute's value is read from the root's stored attributes,
   * which the form keeps in sync on every change; the suggestions query debounces,
   * so the one-render lag behind live typing is not observable.
   *
   * @param canvasState - The full canvas state map, keyed by shape id.
   * @returns The variable values, keyed by namespace (empty if no root resolves).
   */
  getSuggestionVariables(canvasState: Map<string, ServiceEntityShape>): SuggestionVariables {
    const source = this.getRootInstance(canvasState);

    if (!source) {
      return {};
    }

    const { serviceModel } = source;
    // The name of the attribute that identifies the instance (the model's `service_identity`).
    const identifyingAttributeName =
      "service_identity" in serviceModel ? serviceModel.service_identity : undefined;
    const identifyingAttributeValue = identifyingAttributeName
      ? source.instanceAttributes[identifyingAttributeName]
      : undefined;

    return {
      entity_type: serviceModel.name,
      identifying_attribute:
        identifyingAttributeValue === undefined ||
        identifyingAttributeValue === null ||
        identifyingAttributeValue === ""
          ? undefined
          : String(identifyingAttributeValue),
      instance_id: source.isNew ? undefined : String(source.id),
    };
  }

  addConnection(relationId: string, relationType: string) {
    const existing = this.connections.get(relationType) || [];
    if (existing.includes(relationId)) {
      return;
    }
    this.connections.set(relationType, [...existing, relationId]);
  }

  removeConnection(relationId: string, relationType: string) {
    const existing = this.connections.get(relationType);
    if (!existing) {
      return;
    }

    const updated = existing.filter((connection) => connection !== relationId);

    if (updated.length === 0) {
      this.connections.delete(relationType);
    } else {
      this.connections.set(relationType, updated);
    }
  }

  getConnections(): Map<string, string[]> {
    return this.connections;
  }

  /**
   * The ids connected under a relation type that count for its limits: all but the shapes on
   * the canvas staged to be deleted, which leave the order (getOrderItem). An id that isn't on
   * the canvas counts: it is a relation the instance has (addInstanceShapes).
   *
   * @param relationType - The key of the relation in the connections
   * @param canvasState - The shapes on the canvas
   * @returns The connected ids that count
   */
  getCountedConnections(
    relationType: string,
    canvasState: Map<string, ServiceEntityShape>
  ): string[] {
    return (this.connections.get(relationType) || []).filter(
      (connectedId) => !canvasState.get(connectedId)?.isMarkedForDeletion
    );
  }

  /**
   * The embedded entities this shape holds, by the attribute they fill. Two attributes can embed
   * the same type, say `port_a` and `port_b`, while the connections only know the type. An entity
   * fills the attribute its model is, while that has room; the others fill the first attribute of
   * their type with room. Read-only attributes get none: their entities aren't put on the canvas.
   * Only the connections that count are assigned (getCountedConnections).
   *
   * @param canvasState - The shapes on the canvas
   * @returns The ids of the embedded entities, keyed by the name of the attribute they fill
   */
  getEmbeddedIdsByAttribute(canvasState: Map<string, ServiceEntityShape>): Map<string, string[]> {
    const attributes = (this.serviceModel.embedded_entities ?? []).filter(
      (attribute) => attribute.modifier !== "r"
    );
    const assigned = new Map<string, string[]>(attributes.map((attribute) => [attribute.name, []]));
    const hasRoom = (attribute: EmbeddedEntity): boolean => hasRoomIn(attribute, assigned);
    const assign = (attribute: EmbeddedEntity, connectedId: string) =>
      assigned.get(attribute.name)?.push(connectedId);

    new Set(attributes.map(getEmbeddedEntityKey)).forEach((entityKey) => {
      const attributesOfType = attributes.filter(
        (attribute) => getEmbeddedEntityKey(attribute) === entityKey
      );
      const ownAttribute = (connectedId: string) =>
        attributesOfType.find(
          (attribute) => attribute.name === canvasState.get(connectedId)?.serviceModel.name
        );

      const unassigned = this.getCountedConnections(entityKey, canvasState).filter(
        (connectedId) => {
          const attribute = ownAttribute(connectedId);

          if (attribute && hasRoom(attribute)) {
            assign(attribute, connectedId);

            return false;
          }

          return true;
        }
      );

      // An attribute the update can't change only takes an entity when no other has room. With no
      // room anywhere, which only happens when the limits are broken, it stays in its own attribute.
      unassigned.forEach((connectedId) =>
        assign(
          attributesOfType.find(
            (attribute) => hasRoom(attribute) && !this.isLockedAttribute(attribute)
          ) ??
            attributesOfType.find(hasRoom) ??
            ownAttribute(connectedId) ??
            attributesOfType[0],
          connectedId
        )
      );
    });

    return assigned;
  }

  /**
   * Whether an embedded attribute can't take new entities: an "rw" attribute can only be set
   * while the instance is created.
   */
  private isLockedAttribute(attribute: EmbeddedEntity): boolean {
    return attribute.modifier === "rw" && !this.isNew;
  }

  /**
   * Whether a new embedded entity of a type has an attribute of this shape to go in: one of that
   * type that isn't read-only or locked, and has room for it next to the entities it holds.
   *
   * @param entityKey - The type of the embedded entity
   * @param canvasState - The shapes on the canvas
   * @returns true when there is an attribute for it, or undefined when no attribute has the type
   */
  private hasRoomForEmbedded(
    entityKey: string,
    canvasState: Map<string, ServiceEntityShape>
  ): boolean | undefined {
    const attributesOfType = (this.serviceModel.embedded_entities ?? []).filter(
      (attribute) => attribute.modifier !== "r" && getEmbeddedEntityKey(attribute) === entityKey
    );

    if (attributesOfType.length === 0) {
      return undefined;
    }

    const assigned = this.getEmbeddedIdsByAttribute(canvasState);

    return attributesOfType.some(
      (attribute) => !this.isLockedAttribute(attribute) && hasRoomIn(attribute, assigned)
    );
  }

  /**
   * Makes each embedded entity this shape holds show the attribute it fills
   * (getEmbeddedIdsByAttribute): a new link can put an entity in another attribute of its type,
   * the first with room, or in a parent that names the attribute differently.
   *
   * @param canvasState - The shapes on the canvas
   */
  syncEmbeddedAttributes(canvasState: Map<string, ServiceEntityShape>): void {
    this.getEmbeddedIdsByAttribute(canvasState).forEach((connectedIds, attributeName) => {
      const attribute = this.serviceModel.embedded_entities?.find(
        (embeddedEntity) => embeddedEntity.name === attributeName
      );

      connectedIds.forEach((connectedId) => {
        const connectedShape = canvasState.get(connectedId);

        if (
          attribute &&
          connectedShape?.entityType === "embedded" &&
          connectedShape.serviceModel.name !== attributeName
        ) {
          connectedShape.serviceModel = attribute;
        }
      });
    });
  }

  private getAllowedRelations():
    Record<string, { lower_limit: number; upper_limit: number | null }> | undefined {
    const entityType = this.getEntityType();
    const entityName = this.getEntityName();

    if (this.relationsDictionary[entityType]) {
      return this.relationsDictionary[entityType];
    }

    if (this.relationsDictionary[entityName]) {
      return this.relationsDictionary[entityName];
    }

    const matchedKey = Object.keys(this.relationsDictionary).find(
      (key) =>
        key.toLowerCase() === entityType.toLowerCase() ||
        key.toLowerCase() === entityName.toLowerCase()
    );

    return matchedKey ? this.relationsDictionary[matchedKey] : undefined;
  }

  /**
   * Whether new connections of a relation type are blocked on this shape: a relation marked
   * "rw" can only be set while the instance is created. New shapes are allowed to satisfy
   * their own rw requirements.
   */
  private isLockedRelation(relationType: string): boolean {
    let modifier: string | undefined;

    if ("inter_service_relations" in this.serviceModel) {
      const relation = this.serviceModel.inter_service_relations?.find(
        (rel) =>
          (rel.entity_type || rel.name).toLowerCase() === relationType.toLowerCase() ||
          rel.name.toLowerCase() === relationType.toLowerCase()
      );
      if (relation) {
        modifier = relation.modifier;
      }
    }

    if (!modifier && "embedded_entities" in this.serviceModel) {
      const embedded = this.serviceModel.embedded_entities?.find(
        (entity) => (entity.type || entity.name).toLowerCase() === relationType.toLowerCase()
      );
      if (embedded) {
        modifier = embedded.modifier;
      }
    }

    return modifier === "rw" && !this.isNew;
  }

  /**
   * Whether the service model lets this shape be linked to any other entity at all: through
   * one of its own inter-service relations or embedded entities, by belonging to a parent as an
   * embedded entity, or because another entity has a relation to it. It only looks at the
   * models, not at what is on the canvas, so a shape that can be linked keeps the option even
   * when its relations are full for now. Read-only ("r") relations never count, and neither do
   * "rw" relations of an instance that already exists.
   */
  canHaveConnections(): boolean {
    const allowedRelations = this.getAllowedRelations();

    return (
      !!allowedRelations &&
      Object.keys(allowedRelations).some((relationType) => !this.isLockedRelation(relationType))
    );
  }

  /**
   * Whether this shape has room for a link to the target: the models allow the relation, it
   * isn't locked, and it is below its upper limit, counting only the connections that count
   * (getCountedConnections).
   */
  validateConnection(
    targetEntity: ServiceEntityShape,
    canvasState: Map<string, ServiceEntityShape>
  ): boolean {
    const relationType = targetEntity.getEntityType();
    const allowedRelations = this.getAllowedRelations();

    if (!allowedRelations) {
      return false;
    }

    const relationKey = allowedRelations[relationType]
      ? relationType
      : Object.keys(allowedRelations).find(
          (key) => key.toLowerCase() === relationType.toLowerCase()
        );

    const rules = relationKey ? allowedRelations[relationKey] : undefined;

    if (!rules) {
      return false;
    }

    // An embedded entity goes in one attribute of its type, which needs room of its own
    const hasRoomForEmbedded =
      targetEntity.entityType === "embedded"
        ? this.hasRoomForEmbedded(relationType, canvasState)
        : undefined;

    if (hasRoomForEmbedded !== undefined) {
      return hasRoomForEmbedded;
    }

    if (this.isLockedRelation(relationType)) {
      return false;
    }

    const existingConnections = this.getCountedConnections(
      relationKey || relationType,
      canvasState
    );

    // Check if adding this connection would exceed the upper limit
    if (rules.upper_limit !== undefined && rules.upper_limit !== null) {
      if (existingConnections.length >= rules.upper_limit) {
        return false;
      }
    }

    return true;
  }

  /**
   * Whether this shape is missing required connections: whether getMissingConnections lists any,
   * so the order and the card agree on what is valid.
   */
  isMissingConnections(canvasState: Map<string, ServiceEntityShape>): boolean {
    return this.getMissingConnections(canvasState).length > 0;
  }

  /**
   * Gets a list of missing connections for this shape: the relations and embedded entities
   * below their lower limit, and, for an embedded entity on its own, a parent. An embedded entity
   * can never stand alone: when none of its parents requires it, it still needs one of them.
   * Shapes staged to be deleted don't count (getCountedConnections).
   *
   * @param canvasState - The shapes on the canvas
   * @returns Array of { name: string, missing: number, required: number } objects
   */
  getMissingConnections(canvasState: Map<string, ServiceEntityShape>): Array<{
    type: "embedded" | "relation" | "parent";
    entityType: string;
    name: string;
    missing: number;
    required: number;
  }> {
    const missing: Array<{
      type: "embedded" | "relation" | "parent";
      entityType: string;
      name: string;
      missing: number;
      required: number;
    }> = [];

    // Embedded entities can never be standalone - they must always have at least one connection.
    // When an embedded entity is standalone, we want to show which parent entities (core, embedded,
    // or inter-service relations) it is allowed to belong to.
    if (this.entityType === "embedded") {
      const totalConnections = Array.from(this.connections.keys()).reduce(
        (sum, relationType) => sum + this.getCountedConnections(relationType, canvasState).length,
        0
      );
      if (totalConnections === 0) {
        // Use the relationsDictionary to find all valid parents for this embedded entity.
        // In createRelationsDictionary, embedded entities are keyed by `entity.type || entity.name`,
        // which matches getEntityName() for embedded shapes.
        const relationsForEmbedded = this.getAllowedRelations();

        const interServiceTargets = new Set(
          "inter_service_relations" in this.serviceModel
            ? this.serviceModel.inter_service_relations.map((relation) =>
                (relation.entity_type || relation.name).toLowerCase()
              )
            : []
        );

        // Do not report declared inter-service targets as missing "parent" relations.
        const parents = Object.entries(relationsForEmbedded ?? {}).filter(
          ([parentName]) => !interServiceTargets.has(parentName.toLowerCase())
        );
        const requiredParents = parents.filter(([, parentRules]) => parentRules.lower_limit > 0);

        requiredParents.forEach(([parentName, parentRules]) => {
          missing.push({
            type: "parent",
            entityType: parentName,
            name: parentName,
            missing: parentRules.lower_limit,
            required: parentRules.lower_limit,
          });
        });

        // None of its parents requires it, but it still needs one of them.
        if (requiredParents.length === 0) {
          const parentNames = parents.map(([parentName]) => parentName).join(" or ");

          missing.push({
            type: "parent",
            entityType: "",
            name: parentNames || this.getEntityName(),
            missing: 1,
            required: 1,
          });
        }
      }
    }

    // Check embedded entities
    if ("embedded_entities" in this.serviceModel) {
      for (const embeddedEntity of this.serviceModel.embedded_entities) {
        const missingConnection = getEmbeddedEntityMissingConnections(
          this,
          embeddedEntity,
          canvasState
        );
        if (missingConnection) {
          missing.push({ ...missingConnection, type: "embedded" });
        }
      }
    }

    // Check inter-service relations
    if ("inter_service_relations" in this.serviceModel) {
      for (const relation of this.serviceModel.inter_service_relations) {
        const missingConnection = getInterServiceRelationMissingConnections(
          this,
          relation,
          canvasState
        );
        if (missingConnection) {
          missing.push({ ...missingConnection, type: "relation" });
        }
      }
    }

    return missing;
  }

  getSanitizedAttributes(): InstanceAttributeModel {
    return this.sanitizedAttrs;
  }

  /**
   * Which attribute set the composer works on, and so where `instanceAttributes` started from:
   * the candidate set while the instance has one, otherwise the active set. The other set, when
   * the instance has both, can only be viewed. A new entity has no sets yet, so no set name.
   */
  getEditableSet(): AttributeSetName | null {
    if (this.attributeSets?.candidate) {
      return "candidate";
    }

    return this.attributeSets?.active ? "active" : null;
  }

  /**
   * Validates the current attributes of this shape against its service model definition.
   * Uses the same field/attribute pipeline as the EntityForm, but without rendering the form.
   *
   * This method is intentionally lightweight: it focuses on type correctness and basic shape,
   * deferring any deeper semantic validation to the backend (as with the regular instance forms).
   */
  validateAttributes(): void {
    // Some shapes (e.g. relation-only) might not have attributes to validate
    if (!("attributes" in this.serviceModel) || !this.serviceModel.attributes) {
      this.hasAttributeValidationErrors = false;

      return;
    }

    try {
      const isInEditMode = !this.isNew;
      const fieldCreator = new FieldCreator(new CreateModifierHandler(), isInEditMode);
      const fields: Field[] = fieldCreator.attributesToFields(this.serviceModel.attributes);

      // Run through the sanitizer to ensure the current attributes are structurally sound
      // We always validate against the sanitized attributes, as those are what the form works with
      const sanitized = sanitizeAttributes(
        fields,
        this.sanitizedAttrs ?? this.instanceAttributes ?? {}
      );

      // Helper: determine if a value should be considered "empty" for validation purposes
      const isEmptyValue = (value: unknown): boolean => {
        if (value === null || value === undefined) {
          return true;
        }
        if (typeof value === "string") {
          return value.trim() === "";
        }
        if (Array.isArray(value)) {
          return value.length === 0;
        }
        if (typeof value === "object") {
          return Object.keys(value as Record<string, unknown>).length === 0;
        }

        return false;
      };

      // Only check top-level required fields; nested/dict-list details are handled by the full form
      const hasMissingRequiredValues = fields.some((field) => {
        if (field.isOptional) {
          return false;
        }

        const value = sanitized[field.name as keyof InstanceAttributeModel];

        switch (field.kind) {
          case "Enum":
          case "Text":
          case "Textarea":
          case "Unit":
            return isEmptyValue(value);
          // false is a value: only a required boolean without one is missing
          case "Boolean":
            return value === null || value === undefined;
          default:
            return false;
        }
      });

      this.hasAttributeValidationErrors = hasMissingRequiredValues;
    } catch {
      // If anything goes wrong while building fields or sanitizing, mark the shape as invalid.
      // Detailed error handling / messaging can be added later if needed.
      this.hasAttributeValidationErrors = true;
    }
  }

  updateAttributes(attributes: InstanceAttributeModel) {
    // Create a new object to ensure we're not sharing references
    this.instanceAttributes = { ...attributes };
    this.sanitizedAttrs = structuredClone(attributes);

    // Re-run attribute validation whenever attributes change
    this.validateAttributes();
  }

  getKeyAttributes(): string[] {
    const keyAttributes = this.serviceModel.key_attributes
      ? [...this.serviceModel.key_attributes]
      : [];
    // We also want to add the service_identity if it exists (Embedded Entities don't have it)
    if ("service_identity" in this.serviceModel && this.serviceModel.service_identity) {
      keyAttributes.push(this.serviceModel.service_identity);
    }

    return keyAttributes;
  }

  /**
   * Filters attributes to only include keys that are defined in the service model.
   * Excludes system fields like "id" that are not part of the service model definition.
   */
  private filterAllowedAttributes(
    serviceModel: ServiceModel | EmbeddedEntity,
    attributes: InstanceAttributeModel
  ): InstanceAttributeModel {
    const allowedAttributeKeys = new Set<string>([
      ...(serviceModel.attributes?.map((attribute) => attribute.name) || []),
      ...(serviceModel.embedded_entities?.map((entity) => entity.name) || []),
      ...(serviceModel.inter_service_relations?.map((relation) => relation.name) || []),
    ]);

    return Object.fromEntries(
      Object.entries(attributes).filter(([key]) => allowedAttributeKeys.has(key))
    );
  }

  /**
   * Processes embedded entities for a given shape and returns a new attributes object with embedded entities added.
   * Each attribute gets the entities that fill it (getEmbeddedIdsByAttribute); a read-only
   * attribute has none on the canvas, so it keeps its value. Transforms nested embedded entities recursively.
   */
  private processEmbeddedEntities(
    shape: ServiceEntityShape,
    attributes: InstanceAttributeModel,
    canvasState: Map<string, ServiceEntityShape>,
    isCreating: boolean
  ): InstanceAttributeModel {
    const embeddedEntities = shape.serviceModel.embedded_entities || [];
    const idsByAttribute = shape.getEmbeddedIdsByAttribute(canvasState);

    const processedAttributes = { ...attributes };

    embeddedEntities.forEach((embeddedEntity) => {
      const embeddedItems = (idsByAttribute.get(embeddedEntity.name) || [])
        .map((connectedId) => canvasState.get(connectedId))
        .filter(
          (connectedShape): connectedShape is ServiceEntityShape =>
            connectedShape?.entityType === "embedded"
        )
        .map((connectedShape) =>
          this.transformEmbeddedEntityAttributes(connectedShape, canvasState, isCreating)
        );

      if (embeddedItems.length > 0) {
        processedAttributes[embeddedEntity.name] =
          embeddedEntity.upper_limit === 1 ? embeddedItems[0] : embeddedItems;
      }
    });

    return processedAttributes;
  }

  /**
   * Processes inter-service relations for a given shape and returns a new attributes object with relations added.
   * Handles filtering based on isCreating flag.
   *
   * A connected shape staged to be deleted leaves the relation. A connected id that isn't on the
   * canvas stays: it is a relation the instance has, to an instance the composer didn't load or
   * that was taken off the canvas, and the update replaces the attributes, so leaving it out
   * would unlink it.
   */
  private processInterServiceRelations(
    shape: ServiceEntityShape,
    attributes: InstanceAttributeModel,
    canvasState: Map<string, ServiceEntityShape>,
    isCreating: boolean
  ): InstanceAttributeModel {
    const interServiceRelations = isCreating
      ? shape.serviceModel.inter_service_relations?.filter(
          (relation) => relation.modifier !== "r"
        ) || []
      : shape.serviceModel.inter_service_relations || [];

    const processedAttributes = { ...attributes };

    interServiceRelations.forEach((relation) => {
      const relationKey = getInterServiceRelationKey(relation);
      const relationIds: string[] = [];
      shape.connections.forEach((connectedIds, connectionKey) => {
        connectedIds.forEach((connectedId) => {
          const connectedShape = canvasState.get(connectedId);
          const isPartOfRelation = connectedShape
            ? connectedShape.getEntityType() === relation.entity_type &&
              !connectedShape.isMarkedForDeletion
            : connectionKey === relationKey;

          if (isPartOfRelation && !relationIds.includes(connectedId)) {
            relationIds.push(connectedId);
          }
        });
      });

      // Always set the relation attribute if there are valid connections, otherwise remove it to clear stale connections
      if (relationIds.length > 0) {
        processedAttributes[relation.name] =
          relation.upper_limit === 1 ? relationIds[0] : relationIds;
      } else {
        // Remove the relation if there are no valid connections
        delete processedAttributes[relation.name];
      }
    });

    return processedAttributes;
  }

  /**
   * Recursively transforms an embedded entity shape into its attributes representation
   * Excludes read-only attributes (modifier "r") only when creating (not updating)
   */
  private transformEmbeddedEntityAttributes(
    embeddedShape: ServiceEntityShape,
    canvasState: Map<string, ServiceEntityShape>,
    isCreating: boolean
  ): InstanceAttributeModel {
    let attributes = embeddedShape.instanceAttributes || {};
    if (isCreating) {
      const readOnlyKeys = new Set(
        embeddedShape.serviceModel.attributes
          ?.filter((attribute) => attribute.modifier === "r")
          .map((attribute) => attribute.name) || []
      );
      attributes = Object.fromEntries(
        Object.entries(attributes).filter(([key]) => !readOnlyKeys.has(key))
      );
    }

    const attributesWithRelations = this.processInterServiceRelations(
      embeddedShape,
      attributes,
      canvasState,
      isCreating
    );

    // Process nested embedded entities
    const attributesWithEmbedded = this.processEmbeddedEntities(
      embeddedShape,
      attributesWithRelations,
      canvasState,
      isCreating
    );

    // Filter to only include allowed keys from the embedded entity's service model (excludes system fields like "id")
    const filteredAttributes = this.filterAllowedAttributes(
      embeddedShape.serviceModel,
      attributesWithEmbedded
    );

    // Sanitize attributes to convert empty strings to null (same as normal form page)
    const isInEditMode = !isCreating;
    const fieldCreator = new FieldCreator(new CreateModifierHandler(), isInEditMode);
    const fields = fieldCreator.create({
      attributes: embeddedShape.serviceModel.attributes || [],
      embedded_entities: embeddedShape.serviceModel.embedded_entities || [],
      inter_service_relations: embeddedShape.serviceModel.inter_service_relations || [],
    });

    return sanitizeAttributes(fields, filteredAttributes);
  }

  /**
   * The order item for this shape in its current state. Embedded entities have none: they are
   * nested in their parent's attributes.
   *
   * @param canvasState - The full canvas state map to resolve connected shapes
   * @returns The order item, or null for an embedded entity
   */
  getOrderItem(canvasState: Map<string, ServiceEntityShape>): ServiceOrderItemRequest | null {
    // Only include Core and Relation types (embedded entities are nested in their parent's attributes)
    if (this.entityType !== "core" && this.entityType !== "relation") {
      return null;
    }

    // An instance staged to be deleted only orders its delete; its attributes don't matter
    if (this.isMarkedForDeletion) {
      return {
        instance_id: String(this.id),
        service_entity: this.getEntityType(),
        config: {},
        action: "delete",
        attributes: null,
        edits: null,
      };
    }

    const isCreating = this.isNew;
    let attributes = this.instanceAttributes || {};
    if (isCreating) {
      const readOnlyKeys = new Set(
        this.serviceModel.attributes
          ?.filter((attribute) => attribute.modifier === "r")
          .map((attribute) => attribute.name) || []
      );
      attributes = Object.fromEntries(
        Object.entries(attributes).filter(([key]) => !readOnlyKeys.has(key))
      );
    }

    // Process inter_service_relations
    const attributesWithRelations = this.processInterServiceRelations(
      this,
      attributes,
      canvasState,
      isCreating
    );

    // Process embedded entities
    const attributesWithEmbedded = this.processEmbeddedEntities(
      this,
      attributesWithRelations,
      canvasState,
      isCreating
    );

    // Filter to only include allowed keys from the service model (excludes system fields like "id")
    const filteredAttributes = this.filterAllowedAttributes(
      this.serviceModel,
      attributesWithEmbedded
    );

    // Sanitize attributes to convert empty strings to null (same as normal form page)
    const isInEditMode = !isCreating;
    const fieldCreator = new FieldCreator(new CreateModifierHandler(), isInEditMode);
    const fields = fieldCreator.create({
      attributes: this.serviceModel.attributes || [],
      embedded_entities: this.serviceModel.embedded_entities || [],
      inter_service_relations: this.serviceModel.inter_service_relations || [],
    });
    const sanitizedAttributes = sanitizeAttributes(fields, filteredAttributes);

    const action: ServiceOrderItemAction | null = this.isNew ? "create" : "update";

    return {
      instance_id: String(this.id),
      service_entity: this.getEntityType(),
      config: {},
      action: action,
      attributes: Object.keys(sanitizedAttributes).length > 0 ? sanitizedAttributes : null,
      edits: null,
    };
  }
}
