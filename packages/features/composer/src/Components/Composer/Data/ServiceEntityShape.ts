import {
  EmbeddedEntity,
  Field,
  InstanceAttributeModel,
  ServiceModel,
  ServiceOrderItemAction,
  ServiceOrderItemRequest,
} from "@inmanta/web-console-core";
import { sanitizeAttributes } from "@inmanta/web-console-core/Common";
import { CreateModifierHandler, FieldCreator } from "@inmanta/web-console-core/FormState";
import { SuggestionVariables } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { SHAPE_HEADER_HEIGHT, SHAPE_ROW_HEIGHT, SHAPE_WIDTH } from "../config/shapeConfig";
import {
  checkEmbeddedEntityConnections,
  checkInterServiceRelationConnections,
  getEmbeddedEntityMissingConnections,
  getInterServiceRelationMissingConnections,
} from "./Helpers/connectionValidationUtils";
import { RelationsDictionary } from "./Helpers/createRelationsDictionary";
import { findTopRootInstance } from "./Helpers/findTopRootInstance";
import { getEmbeddedEntityKey } from "./Helpers/shapeUtils";

/**
 * Base configuration for a service entity rendered on the composer canvas.
 */
export interface ServiceEntityBase {
  entityType: EntityShapeType;
  serviceModel: ServiceModel | EmbeddedEntity;
  instanceAttributes: InstanceAttributeModel;
  readonly: boolean;
  isNew: boolean;
  rootEntities: Record<string, string[]>;
  interServiceRelations: Record<string, string[]>;
  embeddedEntities: Record<string, string[]>;
  id: string;
}

/**
 * Full configuration used to construct a `ServiceEntityShape`.
 */
export interface ServiceEntityOptions extends ServiceEntityBase {
  lockedOnCanvas: boolean;
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
 * A service, embedded entity, or inter-service relation on the composer canvas.
 * Tracks its connections, attributes and position, and provides helpers for validation
 * and order-item generation. It holds no rendering state: the canvas draws it.
 */
export class ServiceEntityShape {
  readonly id: string;
  connections: Map<string, string[]>;
  serviceModel: ServiceModel | EmbeddedEntity;
  relationsDictionary: RelationsDictionary;
  instanceAttributes: InstanceAttributeModel;
  sanitizedAttrs: InstanceAttributeModel;
  readonly: boolean;
  isNew: boolean;
  lockedOnCanvas: boolean;
  entityType: EntityShapeType;
  orderItem: ServiceOrderItemRequest | null;
  hasAttributeValidationErrors: boolean;
  isLayersCollapsed: boolean;

  /** Hidden because an ancestor collapsed its layers. */
  isHidden: boolean;
  parentIds: Set<string>;

  /** The size the canvas measured for the card, used by the layouts. */
  size: Size;
  private _position: Point;

  constructor(initializationOptions: ServiceEntityOptions) {
    this.id = initializationOptions.id;
    this.connections = new Map<string, string[]>();
    this.serviceModel = initializationOptions.serviceModel;
    this.relationsDictionary = initializationOptions.relationsDictionary;
    this.instanceAttributes = initializationOptions.instanceAttributes;
    this.sanitizedAttrs = JSON.parse(JSON.stringify(initializationOptions.instanceAttributes));
    this.readonly = initializationOptions.readonly;
    this.isNew = initializationOptions.isNew;
    this.lockedOnCanvas = initializationOptions.lockedOnCanvas;
    this.entityType = initializationOptions.entityType;
    this.orderItem = null;
    this.hasAttributeValidationErrors = false;
    this.isLayersCollapsed = false;
    this.isHidden = false;
    this.parentIds = new Set<string>();
    // An estimate until the canvas has measured the card
    this.size = {
      width: SHAPE_WIDTH,
      height: SHAPE_HEADER_HEIGHT + Math.max(1, this.getKeyAttributes().length) * SHAPE_ROW_HEIGHT,
    };
    this._position = { x: 0, y: 0 };

    const { interServiceRelations, embeddedEntities, rootEntities } = initializationOptions;

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
   * Gets the position of the card's top-left corner, or moves it when given coordinates.
   */
  position(): Point;
  position(x: number, y: number): this;
  position(x?: number, y?: number): Point | this {
    if (x === undefined || y === undefined) {
      return { ...this._position };
    }
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

    return typeName && serviceName ? `${typeName} - ${serviceName}` : typeName || serviceName;
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
    // Invalidate cached orderItem to trigger recomputation
    this.orderItem = null;
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
    // Invalidate cached orderItem - will be recomputed when needed
    this.orderItem = null;
  }

  getConnections(): Map<string, string[]> {
    return this.connections;
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

  validateConnection(targetEntity: ServiceEntityShape): boolean {
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

    /**
     * Do not allow users to create new connections for relations marked as "rw" and not new.
     */
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

    // For "rw" relations, only block creating new connections on existing shapes.
    // New shapes are allowed to satisfy their own rw requirements.
    if (modifier === "rw" && !this.isNew) {
      return false;
    }

    const existingConnections = this.connections.get(relationKey || relationType) || [];

    // Check if adding this connection would exceed the upper limit
    if (rules.upper_limit !== undefined && rules.upper_limit !== null) {
      if (existingConnections.length >= rules.upper_limit) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if this shape is missing required connections (lower_limit not met)
   * Uses the shape's serviceModel to determine required connections instead of the relationsDictionary
   * @returns true if the shape is missing required connections, false otherwise
   */
  /**
   * Helper method to check if a required connection type has enough connections
   */

  isMissingConnections(): boolean {
    // Embedded entities can never be standalone - they must always have at least one connection
    if (this.entityType === "embedded") {
      const totalConnections = Array.from(this.connections.values()).reduce(
        (sum, array) => sum + array.length,
        0
      );
      if (totalConnections === 0) {
        return true;
      }
    }

    // Check embedded entities
    if ("embedded_entities" in this.serviceModel) {
      for (const embeddedEntity of this.serviceModel.embedded_entities) {
        if (checkEmbeddedEntityConnections(this, embeddedEntity)) {
          return true;
        }
      }
    }

    // Check inter-service relations
    if ("inter_service_relations" in this.serviceModel) {
      for (const relation of this.serviceModel.inter_service_relations) {
        if (checkInterServiceRelationConnections(this, relation)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Gets a list of missing connections for this shape.
   * Returns an array of objects containing the connection name and how many are missing.
   * @returns Array of { name: string, missing: number, required: number } objects
   */
  getMissingConnections(): Array<{
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
      const totalConnections = Array.from(this.connections.values()).reduce(
        (sum, array) => sum + array.length,
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

        if (relationsForEmbedded) {
          Object.entries(relationsForEmbedded).forEach(([parentName, parentRules]) => {
            // Do not report declared inter-service targets as missing "parent" relations.
            if (interServiceTargets.has(parentName.toLowerCase())) {
              return;
            }
            if (parentRules.lower_limit <= 0) {
              return;
            }
            missing.push({
              type: "parent",
              entityType: parentName,
              name: parentName,
              missing: parentRules.lower_limit,
              required: parentRules.lower_limit,
            });
          });
        }
      }
    }

    // Check embedded entities
    if ("embedded_entities" in this.serviceModel) {
      for (const embeddedEntity of this.serviceModel.embedded_entities) {
        const missingConnection = getEmbeddedEntityMissingConnections(this, embeddedEntity);
        if (missingConnection) {
          missing.push({ ...missingConnection, type: "embedded" });
        }
      }
    }

    // Check inter-service relations
    if ("inter_service_relations" in this.serviceModel) {
      for (const relation of this.serviceModel.inter_service_relations) {
        const missingConnection = getInterServiceRelationMissingConnections(this, relation);
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
    this.sanitizedAttrs = JSON.parse(JSON.stringify(attributes));
    // Invalidate cached orderItem - will be recomputed when needed
    this.orderItem = null;

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
   * Handles filtering based on isCreating flag and transforms nested embedded entities recursively.
   */
  private processEmbeddedEntities(
    shape: ServiceEntityShape,
    attributes: InstanceAttributeModel,
    canvasState: Map<string, ServiceEntityShape>,
    isCreating: boolean
  ): InstanceAttributeModel {
    const embeddedEntities = isCreating
      ? shape.serviceModel.embedded_entities?.filter((entity) => entity.modifier !== "r") || []
      : shape.serviceModel.embedded_entities || [];

    const processedAttributes = { ...attributes };

    embeddedEntities.forEach((embeddedEntity) => {
      const entityKey = getEmbeddedEntityKey(embeddedEntity);
      const connectedIds = shape.connections.get(entityKey) || [];

      const embeddedItems = connectedIds
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
      const relationIds: string[] = [];
      shape.connections.forEach((connectedIds) => {
        connectedIds.forEach((connectedId) => {
          const connectedShape = canvasState.get(connectedId);
          if (
            connectedShape?.getEntityType() === relation.entity_type &&
            !relationIds.includes(connectedId)
          ) {
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
   * Updates the cached orderItem based on current state.
   * Should be called when canvasState changes or when this shape's connections/attributes change.
   *
   * @param canvasState - The full canvas state map to resolve connected shapes
   */
  updateOrderItem(canvasState: Map<string, ServiceEntityShape>): void {
    // Only include Core and Relation types (embedded entities are nested in their parent's attributes)
    if (this.entityType !== "core" && this.entityType !== "relation") {
      this.orderItem = null;

      return;
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

    this.orderItem = {
      instance_id: String(this.id),
      service_entity: this.getEntityType(),
      config: {},
      action: action,
      attributes: Object.keys(sanitizedAttributes).length > 0 ? sanitizedAttributes : null,
      edits: null,
    };
  }

  /**
   * Gets the cached orderItem, computing it if necessary.
   * Returns null for embedded entities (they should be nested in their parent's attributes).
   *
   * @param canvasState - The full canvas state map to resolve connected shapes
   * @returns ServiceOrderItemRequest or null for embedded entities
   */
  toServiceOrderItem(canvasState: Map<string, ServiceEntityShape>): ServiceOrderItemRequest | null {
    if (this.orderItem === null) {
      this.updateOrderItem(canvasState);
    }

    return this.orderItem;
  }
}
