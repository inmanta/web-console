import { dia, shapes, util } from "@inmanta/rappid";
import {
  t_chart_color_yellow_300,
  t_chart_color_blue_400,
  t_chart_color_purple_300,
  t_chart_global_fill_color_white,
  t_global_background_color_primary_default,
  t_global_border_radius_small,
  t_global_font_family_mono,
  t_global_font_size_body_default,
  t_global_font_size_body_lg,
} from "@patternfly/react-tokens";
import { EmbeddedEntity, Field, InstanceAttributeModel, ServiceModel } from "@/Core";
import { sanitizeAttributes } from "@/Data";
import { ServiceOrderItemAction } from "@/Slices/Orders/Core/Types";
import { CreateModifierHandler, FieldCreator } from "@/UI/Components/ServiceInstanceForm";
import { RelationsDictionary } from "../../Data";
import {
  checkEmbeddedEntityConnections,
  checkInterServiceRelationConnections,
  getEmbeddedEntityMissingConnections,
  getInterServiceRelationMissingConnections,
} from "../../Data/Helpers/connectionValidationUtils";
import { ComposerServiceOrderItem } from "../../Data/Helpers/deploymentHelpers";
import { getEmbeddedEntityKey } from "../../Data/Helpers/shapeUtils";

/**
 * Base configuration for a service entity rendered on the composer canvas.
 */
export interface ServiceEntityBase {
  entityType: EntityType;
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

interface ColumnData {
  name: string;
  [key: string]: unknown;
}

export type EntityType = "core" | "embedded" | "relation";

export const HeaderColors: Record<EntityType, string> = {
  core: t_chart_color_yellow_300.var,
  embedded: t_chart_color_blue_400.var,
  relation: t_chart_color_purple_300.var,
};

/**
 * JointJS shape that represents a service, embedded entity, or inter-service relation on the canvas.
 * Tracks connections, attributes, and provides helpers for validation and order-item generation.
 */
export class ServiceEntityShape extends shapes.standard.HeaderedRecord {
  connections: Map<string, string[]>;
  serviceModel: ServiceModel | EmbeddedEntity;
  relationsDictionary: RelationsDictionary;
  instanceAttributes: InstanceAttributeModel;
  sanitizedAttrs: InstanceAttributeModel;
  readonly: boolean;
  isNew: boolean;
  lockedOnCanvas: boolean;
  id: string;
  entityType: EntityType;
  orderItem: ComposerServiceOrderItem | null;
  hasAttributeValidationErrors: boolean;

  constructor(initializationOptions: ServiceEntityOptions) {
    super();

    this.connections = new Map<string, string[]>();
    this.serviceModel = initializationOptions.serviceModel;
    this.relationsDictionary = initializationOptions.relationsDictionary;
    this.instanceAttributes = initializationOptions.instanceAttributes;
    this.sanitizedAttrs = JSON.parse(JSON.stringify(initializationOptions.instanceAttributes));
    this.readonly = initializationOptions.readonly;
    this.isNew = initializationOptions.isNew;
    this.lockedOnCanvas = initializationOptions.lockedOnCanvas;
    this.id = initializationOptions.id;
    this.entityType = initializationOptions.entityType;
    this.orderItem = null;
    this.hasAttributeValidationErrors = false;

    this._initializeFromOptions(initializationOptions);
  }
  defaults() {
    // Recursively assigns default properties. That means if a property already exists on the child,
    // the child property won't be replaced even if the parent property of same name has a different value.
    // It is not exactly the same as using the spread operator.
    // The spread operator would replace any parent properties if we defined those properties on the child.
    // See https://resources.jointjs.com/tutorial/ts-shape for more details.
    return util.defaultsDeep(
      {
        type: "app.ServiceEntityShape",
        columns: [],
        padding: { top: 40, bottom: 10, left: 10, right: 10 },
        size: { width: 264 },
        itemMinLabelWidth: 120,
        itemHeight: 25,
        itemOffset: 0,
        itemOverflow: true,
        attrs: {
          body: {
            class: "joint-entityBlock-body",
            strokeWidth: 0,
            cursor: "default",
            rx: t_global_border_radius_small.value,
            fill: t_global_background_color_primary_default.var,
          },
          header: {
            strokeWidth: 0,
            cursor: "grab",
            d: "M1,0 h257 q6,0 6,6 v24 h-264 v-24 q0,-6 6,-6",
          },
          headerLabel: {
            fontFamily: t_global_font_family_mono.var,
            textTransform: "uppercase",
            fill: t_chart_global_fill_color_white.var,
            fontSize: t_global_font_size_body_lg.var,
            textWrap: {
              ellipsis: true,
              height: 30,
            },
            cursor: "grab",
          },
          group_1: {
            cursor: "default",
          },
          itemBodies: {
            cursor: "default",
          },
          itemLabels: {
            class: "joint-entityBlock-itemLabels",
            fontSize: t_global_font_size_body_default.var,
            cursor: "default",
            itemText: {
              textWrap: false,
            },
          },
          itemLabels_1: {
            class: "joint-entityBlock-itemLabels-one",
            fontSize: t_global_font_size_body_default.var,
            textAnchor: "end",
            x: "calc(0.5 * w - 10)",
            cursor: "default",
          },
        },
      },
      super.defaults
    );
  }

  protected _setColumnItems(data: Array<ColumnData> = []) {
    const names: Array<{
      id: string;
      label: string;
      span: number;
    }> = [];
    const values: Array<{
      id: string;
      label: string;
    }> = [];

    data.forEach((item) => {
      if (!item.name) {
        return;
      }

      const nameObject = {
        id: item.name,
        label: item.name,
        span: 2,
      };

      //out-of-the-box headeredRecord doesn't truncate attribute name, only their values
      const truncatedName = util.breakText(
        item.name.toString(),
        { width: 90, height: 22 },
        {
          "font-size": this.attr("itemLabels_1/fontSize"),
          "font-family": this.attr("itemLabels_1/fontFamily"),
        },
        {
          ellipsis: true,
        }
      );

      if (truncatedName.includes("\u2026")) {
        this.attr(`itemLabel_${item.name}/data-tooltip`, item.name);
        this.attr(`itemLabel_${item.name}/data-tooltip-position`, "right");

        names.push({ ...nameObject, label: item.name.slice(0, 15) + "\u2026" });
      } else {
        names.push(nameObject);
      }

      const value: { id: string; label: string } = {
        id: `${item.name}_value`,
        label: "",
      };

      if (typeof item.value === "object" && !Array.isArray(item.value) && item.value !== null) {
        value.label = "{...}";
      } else {
        value.label = String(item.value);

        if (item.value !== undefined && item.value !== null) {
          // reproduce internal formatting of the text base on actual dimensions, if text includes ellipsis add Tooltip
          const reproducedDisplayText = util.breakText(
            item.value.toString().replace(/\s+/g, " "),
            { width: 90, height: 22 },
            {
              "font-size": this.attr("itemLabels_1/fontSize"),
              "font-family": this.attr("itemLabels_1/fontFamily"),
            },
            {
              ellipsis: true,
            }
          );

          if (reproducedDisplayText.includes("\u2026")) {
            value.label = item.value.toString().replace(/\s+/g, " ").slice(0, 16) + "\u2026";
            this.attr(`itemLabel_${item.name}_value/data-tooltip`, item.value);
          }
        }
      }

      values.push(value);
    });

    this.set("items", [names, values]);
    return this;
  }

  protected _setColumns(data: Array<ColumnData> = []) {
    this._setColumnItems(data);
    return this;
  }

  setColumns(data: Array<ColumnData>): this {
    this._setColumns(data);
    return this;
  }

  preinitialize(): void {
    this.markup = [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "path",
        selector: "header",
      },

      {
        tagName: "text",
        selector: "headerLabel",
      },
      {
        tagName: "image",
        selector: "info",
      },
    ];
  }

  initialize(...initializeArguments) {
    super.initialize(...initializeArguments);
    const columns = this.get("columns") || [];
    if (columns.length > 0) {
      this._setColumns(columns);
    }
  }

  private _initializeFromOptions(initializationOptions: ServiceEntityOptions) {
    const {
      entityType: type,
      interServiceRelations,
      embeddedEntities,
      rootEntities,
    } = initializationOptions;
    this.attr(["header", "fill"], HeaderColors[type]);
    this.setDisplayName();

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

    // Prepare columns for display (will be rendered in initialize method)
    const keyAttributes = this.getKeyAttributes();
    if (keyAttributes.length > 0) {
      const displayAttributes = keyAttributes.map((key) => ({
        name: key,
        value:
          this.instanceAttributes[key] !== undefined && this.instanceAttributes[key] !== null
            ? String(this.instanceAttributes[key])
            : "",
      }));
      // Set columns - initialize will handle rendering via _setColumns
      this.set("columns", displayAttributes);
    } else {
      this.set("columns", []);
    }
  }

  /**
   * Converts the entity to a JSON representation.
   *
   * @returns {dia.Cell.JSON<any, dia.Element.Attributes>} The JSON representation of the entity.
   * Note: The `any` type here is part of JointJS's type definition and is required by the library's API.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): dia.Cell.JSON<any, dia.Element.Attributes> {
    const json = super.toJSON();

    // keeping only the `items` attribute as columns are omitted in our use-case
    delete json.columns;

    return json;
  }

  /**
   * Sets the display name of the header label with a shortened version if necessary.
   *
   * @param {string} name - The name to set for the entity.
   * @param {object} [options] - Optional settings for the attribute update.
   * @returns {this} The current instance for method chaining.
   */
  setDisplayName(): this {
    // For embedded entities, use the type if available, otherwise use name
    // For service models, only name is available
    const name =
      "type" in this.serviceModel && this.serviceModel.type
        ? this.serviceModel.type
        : this.serviceModel.name;
    const shortenName = util.breakText(
      name,
      { width: 140, height: 30 },
      {
        "font-size": this.attr("headerLabel/fontSize"),
        "font-family": this.attr("headerLabel/fontFamily"),
      },
      {
        ellipsis: true,
      }
    );

    this.attr(["headerLabel", "data-testid"], "header-" + name);

    if (shortenName.includes("\u2026")) {
      return this.attr(["headerLabel", "text"], name.replace(/\s+/g, " ").slice(0, 16) + "\u2026");
    } else {
      return this.attr(["headerLabel", "text"], shortenName);
    }
  }

  getEntityName(): string {
    return "type" in this.serviceModel && this.serviceModel.type
      ? this.serviceModel.type
      : this.serviceModel.name;
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

  validateConnection(targetEntity: ServiceEntityShape): boolean {
    const relationType = targetEntity.getEntityName();
    const currentEntityName = this.getEntityName();
    const allowedRelations = this.relationsDictionary[currentEntityName];

    if (!allowedRelations) {
      return false;
    }

    const rules = allowedRelations[relationType];

    if (!rules) {
      return false;
    }

    /**
     * Do not allow users to create new connections for relations marked as "rw" and not new.
     */
    let modifier: string | undefined;

    if ("inter_service_relations" in this.serviceModel) {
      const relation = this.serviceModel.inter_service_relations?.find(
        (rel) => rel.entity_type === relationType || rel.name === relationType
      );
      if (relation) {
        modifier = relation.modifier;
      }
    }

    if (!modifier && "embedded_entities" in this.serviceModel) {
      const embedded = this.serviceModel.embedded_entities?.find(
        (entity) => (entity.type || entity.name) === relationType
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

    const existingConnections = this.connections.get(relationType) || [];

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
  getMissingConnections(): Array<{ name: string; missing: number; required: number }> {
    const missing: Array<{ name: string; missing: number; required: number }> = [];

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
        const entityKey = this.getEntityName();
        const relationsForEmbedded = this.relationsDictionary[entityKey];

        if (relationsForEmbedded) {
          Object.keys(relationsForEmbedded).forEach((parentName) => {
            missing.push({
              name: parentName,
              missing: 1,
              required: 1,
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
          missing.push(missingConnection);
        }
      }
    }

    // Check inter-service relations
    if ("inter_service_relations" in this.serviceModel) {
      for (const relation of this.serviceModel.inter_service_relations) {
        const missingConnection = getInterServiceRelationMissingConnections(this, relation);
        if (missingConnection) {
          missing.push(missingConnection);
        }
      }
    }

    return missing;
  }

  getAttributes(): InstanceAttributeModel {
    return this.attributes;
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
          case "Boolean":
          case "Enum":
          case "Text":
          case "Textarea":
          case "TextList":
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

    const keyAttributes = this.getKeyAttributes();
    const displayAttributes =
      keyAttributes.length > 0
        ? keyAttributes.map((key) => ({
            name: key,
            value:
              attributes[key] !== undefined && attributes[key] !== null
                ? String(attributes[key])
                : "",
          }))
        : [];

    this.setColumns(displayAttributes);
  }

  updateColumnsDisplay() {
    const columns = this.get("columns") || [];
    if (columns.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      try {
        const size = this.get("size");
        if (size && size.width && size.height) {
          this._setColumnItems(columns);
        }
      } catch {
        requestAnimationFrame(() => {
          try {
            const size = this.get("size");
            if (size && size.width && size.height) {
              this._setColumnItems(columns);
            }
          } catch {
            // Ignore if still not ready
          }
        });
      }
    });
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
            connectedShape?.getEntityName() === relation.entity_type &&
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

    // Process nested embedded entities
    const attributesWithEmbedded = this.processEmbeddedEntities(
      embeddedShape,
      attributes,
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
      instance_id: this.id,
      service_entity: this.getEntityName(),
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
   * @returns ComposerServiceOrderItem or null for embedded entities
   */
  toServiceOrderItem(
    canvasState: Map<string, ServiceEntityShape>
  ): ComposerServiceOrderItem | null {
    if (this.orderItem === null) {
      this.updateOrderItem(canvasState);
    }
    return this.orderItem;
  }
}

Object.assign(shapes, {
  app: {
    ServiceEntityShape,
  },
});
