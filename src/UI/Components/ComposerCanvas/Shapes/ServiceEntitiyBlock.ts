import { dia, shapes, util } from "@inmanta/rappid";
import {
  t_chart_global_fill_color_white,
  t_global_background_color_primary_default,
  t_global_border_radius_small,
  t_global_font_family_mono,
  t_global_font_size_body_default,
  t_global_font_size_body_lg,
} from "@patternfly/react-tokens";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import {
  CreateModifierHandler,
  FieldCreator,
  createFormState,
} from "@/UI/Components/ServiceInstanceForm";
import { dispatchAddInterServiceRelationToTracker } from "../Context/dispatchers";
import { getKeyAttributesNames } from "../Helpers";
import { ColumnData, EntityType, HeaderColor, ComposerEntityOptions } from "../interfaces";
import { InterServiceRelationOnCanvasWithMin } from "../interfaces";

/**
 * https://resources.jointjs.com/tutorial/custom-elements
 * https://resources.jointjs.com/tutorial/ts-shape
 * https://docs.jointjs.com/api/shapes/standard/HeaderedRecord/
 *
 * actions that are in ServiceEntity returns updated state of the object, we follow convention introduced by JointJS team in their demos
 */
export class ServiceEntityBlock extends shapes.standard.HeaderedRecord {
  constructor(options?: ComposerEntityOptions) {
    super();

    // If options are provided, initialize the entity with the provided configuration
    if (options) {
      this._initializeFromOptions(options);
    }
  }
  defaults() {
    // Recursively assigns default properties. That means if a property already exists on the child,
    // the child property won't be replaced even if the parent property of same name has a different value.
    // It is not exactly the same as using the spread operator.
    // The spread operator would replace any parent properties if we defined those properties on the child.
    // See https://resources.jointjs.com/tutorial/ts-shape for more details.
    return util.defaultsDeep(
      {
        type: "app.ServiceEntityBlock",
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
            //pointerEvents: "none",
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

  protected _setColumns(data: Array<ColumnData> = []) {
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

        ///Add event and add data to display in Dictionary Modal
        this.attr(`itemLabel_${item.name}_value/event`, "element:showDict");
        this.attr(
          `itemLabel_${item.name}_value/dict`,
          JSON.stringify({
            title: item.name,
            value: item.value,
          })
        );
        this.attr(`itemLabel_${item.name}_value/cursor`, "pointer");
      } else {
        value.label = String(item.value);

        if (item.value !== undefined && item.value !== null) {
          //reproduce internal formatting of the text base on actual dimensions, if text includes elipsis add Tooltip
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
    this.removeInvalidLinks();

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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  initialize(...args: any[]) {
    super.initialize(...args);
    this._setColumns(this.get("columns"));
  }

  onColumnsChange() {
    if (this.hasChanged("columns")) {
      this._setColumns(this.get("columns"));
    }
  }

  /**
   * Sets the name of the entity and updates the header label with a shortened version if necessary.
   *
   * @param {string} name - The name to set for the entity.
   * @param {object} [options] - Optional settings for the attribute update.
   * @returns {this} The current instance for method chaining.
   */
  setName(name: string, displayText: string | null, options?: object): this {
    const usedName = displayText || name; // displayText is used to display the name of the embedded entity, this value is nullable, that's why we fallback to name
    const shortenName = util.breakText(
      usedName,
      { width: 140, height: 30 },
      {
        "font-size": this.attr("headerLabel/fontSize"),
        "font-family": this.attr("headerLabel/fontFamily"),
      },
      {
        ellipsis: true,
      }
    );

    this.set("entityName", name); //regardless of the type, name is still assigned to the entityName attribute, which is then used in all of the logic regarding the keeping track of the loose elements or the stencil state
    this.attr(["headerLabel", "data-testid"], "header-" + usedName);

    if (shortenName.includes("\u2026")) {
      return this.attr(
        ["headerLabel", "text"],
        usedName.replace(/\s+/g, " ").slice(0, 16) + "\u2026",
        options
      );
    } else {
      return this.attr(["headerLabel", "text"], shortenName, options);
    }
  }

  /**
   * Retrieves the inter-service relations of the entity.
   *
   * @returns {Map<dia.Cell.ID, string> | null} - Map of relations
   */
  getRelations(): Map<dia.Cell.ID, string> | null {
    const relations = this.get("relatedTo");

    return relations || null;
  }

  /**
   * Adds a inter-service relation to the entity.
   *
   * @param {dia.Cell.ID} id - The identifier of the relation.
   * @param {string} relationName - The name of the relation.
   */
  addRelation(id: dia.Cell.ID, relationName: string): void {
    const currentRelation = this.getRelations();

    if (currentRelation) {
      this.set("relatedTo", currentRelation.set(id, relationName));
    } else {
      const relationMap = new Map();

      this.set("relatedTo", relationMap.set(id, relationName));
    }
  }

  /**
   * Removes a  inter-service relation by its identifier.
   *
   * @param {string} id - The identifier of the relation to remove.
   * @returns {boolean} True if the relation was removed, false otherwise.
   */
  removeRelation(id: string): boolean {
    const currentRelation = this.getRelations();
    let wasThereRelationToRemove = false;

    if (currentRelation) {
      wasThereRelationToRemove = currentRelation.delete(id);
      this.set("relatedTo", currentRelation);
    }

    return wasThereRelationToRemove;
  }

  /**
   * Retrieves the name of the entity.
   *
   * @returns {string} The name of the entity.
   */
  getName(): string {
    return this.get("entityName");
  }

  /**
   * Sets the tab color based on the entity type.
   *
   * @param {EntityType} type - The type of the entity.
   * @returns {this} updated entity block - this.attr(x, y) returns updated object - or the current entity block as default scenario
   */
  setTabColor(type: EntityType): this {
    switch (type) {
      case EntityType.CORE:
        return this.attr(["header", "fill"], HeaderColor.CORE);
      case EntityType.EMBEDDED:
        return this.attr(["header", "fill"], HeaderColor.EMBEDDED);
      case EntityType.RELATION:
        return this.attr(["header", "fill"], HeaderColor.RELATION);
      default:
        return this;
    }
  }

  /**
   * Sets the columns of the entity.
   *
   * @param {Array<ColumnData>} data - The array of column data to set.
   * @returns {this} The updated entity block.
   */
  setColumns(data: Array<ColumnData>): this {
    this._setColumns(data);
    return this;
  }

  /**
   * Converts the entity to a JSON representation.
   *
   * @returns {dia.Cell.JSON<any, dia.Element.Attributes>} The JSON representation of the entity.
   */
  toJSON(): dia.Cell.JSON<any, dia.Element.Attributes> {
    const json = super.toJSON();

    // keeping only the `items` attribute as columns are omitted in our use-case
    delete json.columns;

    return json;
  }

  /**
   * Initializes the entity from the provided ComposerEntityOptions.
   * This method contains all the logic that was previously in createComposerEntity.
   *
   * @param {ComposerEntityOptions} options - The configuration options for the entity.
   * @private
   */
  private _initializeFromOptions(options: ComposerEntityOptions): void {
    const {
      serviceModel,
      isCore,
      isInEditMode,
      attributes,
      isEmbeddedEntity = false,
      holderName = "",
      embeddedTo,
      isBlockedFromEditing = false,
      cantBeRemoved = false,
      stencilName,
      id,
      isFromInventoryStencil = false,
    } = options;

    // Set the entity name
    if (isEmbeddedEntity && "type" in serviceModel) {
      this.setName(serviceModel.name, serviceModel.type);
    } else {
      this.setName(serviceModel.name, null);
    }

    // Set custom ID if provided
    if (id) {
      this.set("id", id);
    }

    // Configure entity type and properties
    if (isEmbeddedEntity) {
      this.setTabColor(EntityType.EMBEDDED);
      this.set("embeddedTo", embeddedTo);
      this.set("isEmbeddedEntity", isEmbeddedEntity);
      this.set("holderName", holderName);
    } else if (isCore) {
      this.set("isCore", isCore);
      this.setTabColor(EntityType.CORE);
    } else {
      this.setTabColor(EntityType.RELATION);
      this.set("stencilName", stencilName);
    }

    // Set common properties
    this.set("isInEditMode", isInEditMode);
    this.set("serviceModel", serviceModel);
    this.set("isBlockedFromEditing", isBlockedFromEditing);
    this.set("cantBeRemoved", cantBeRemoved);

    // For inventory stencil entities, override the editing state to be blocked
    if (isFromInventoryStencil) {
      this.set("isBlockedFromEditing", true);
    }

    // Handle inter-service relations
    if (serviceModel.inter_service_relations.length > 0 && !isFromInventoryStencil) {
      this._addInterServiceRelationsToTracker(serviceModel);
    }

    // Handle attributes
    if (attributes) {
      const keyAttributes = getKeyAttributesNames(serviceModel);

      this._updateAttributes(keyAttributes, attributes, true);
    } else {
      // When no attributes are provided, create default values from the service model
      // This ensures boolean attributes with default values are properly initialized
      const fieldCreator = new FieldCreator(new CreateModifierHandler());
      const fields = fieldCreator.attributesToFields(serviceModel.attributes);
      const defaultAttributes = createFormState(fields);

      this.set("instanceAttributes", defaultAttributes);
      this.set("sanitizedAttrs", defaultAttributes);
    }
  }

  /**
   * Adds inter-service relations to the tracker.
   *
   * @param {ServiceModel | EmbeddedEntity} serviceModel - ServiceModel or EmbeddedEntity object
   * @private
   */
  private _addInterServiceRelationsToTracker(serviceModel: ServiceModel | EmbeddedEntity): void {
    this.set("relatedTo", new Map());
    const relations: InterServiceRelationOnCanvasWithMin[] = [];

    serviceModel.inter_service_relations.forEach((relation) => {
      if (relation.lower_limit > 0) {
        relations.push({
          name: relation.entity_type,
          min: relation.lower_limit,
          currentAmount: 0,
        });
      }
    });

    dispatchAddInterServiceRelationToTracker(this.id, serviceModel.name, relations);
  }

  /**
   * Public method to update entity attributes.
   *
   * @param {InstanceAttributeModel} serviceInstanceAttributes - attributes of given instance/entity
   * @param {boolean} isInitial - boolean indicating whether should we updateAttributes or edit - default = true
   * @public
   */
  public updateEntityAttributes(
    serviceInstanceAttributes: InstanceAttributeModel,
    isInitial = false
  ): void {
    const serviceModel = this.get("serviceModel") as ServiceModel | EmbeddedEntity;

    const existingAttributes = this.get("instanceAttributes") || {};
    const finalAttributes = { ...existingAttributes, ...serviceInstanceAttributes };
    const attributeKeys = getKeyAttributesNames(serviceModel);

    this._updateAttributes(attributeKeys, finalAttributes, isInitial);
  }

  /**
   * Updates attributes for the entity.
   * This method was moved from the general.ts file.
   *
   * @param {string[]} keyAttributes - names of the attributes that we iterate for the values
   * @param {InstanceAttributeModel} serviceInstanceAttributes - attributes of given instance/entity
   * @param {boolean} isInitial - boolean indicating whether should we updateAttributes or edit - default = true
   * @private
   */
  private _updateAttributes(
    keyAttributes: string[],
    serviceInstanceAttributes: InstanceAttributeModel,
    isInitial = true
  ): void {
    // Normalize input - ensure we have valid attributes to work with
    const attributes = serviceInstanceAttributes || {};
    const hasKeyAttributes = keyAttributes && keyAttributes.length > 0;

    // Always set the instance attributes
    this.set("instanceAttributes", attributes);

    // Set sanitized attributes on initial update if not already set
    if (isInitial && !this.get("sanitizedAttrs")) {
      this.set("sanitizedAttrs", attributes);
    }

    // Only create display columns if we have key attributes to show
    if (hasKeyAttributes) {
      const attributesToDisplay = keyAttributes.map((key) => ({
        name: key,
        value:
          attributes[key] !== undefined && attributes[key] !== null ? String(attributes[key]) : "",
      }));

      this.setColumns(attributesToDisplay);
    }
  }
}

Object.assign(shapes, {
  app: {
    ServiceEntityBlock,
  },
});
