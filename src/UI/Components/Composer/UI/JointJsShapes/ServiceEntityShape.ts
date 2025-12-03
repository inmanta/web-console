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
import { EmbeddedEntity, InstanceAttributeModel, InterServiceRelation, ServiceModel } from "@/Core";
import { RelationsDictionary } from "../../Data";

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

    constructor(initOptions: ServiceEntityOptions) {
        super();

        this.connections = new Map<string, string[]>();
        this.serviceModel = initOptions.serviceModel;
        this.relationsDictionary = initOptions.relationsDictionary;
        this.instanceAttributes = initOptions.instanceAttributes;
        this.sanitizedAttrs = JSON.parse(JSON.stringify(initOptions.instanceAttributes));
        this.readonly = initOptions.readonly;
        this.isNew = initOptions.isNew;
        this.lockedOnCanvas = initOptions.lockedOnCanvas;
        this.id = initOptions.id;
        this.entityType = initOptions.entityType;

        this._initializeFromOptions(initOptions);
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

    /**
     * Internal method to set column items without removing links.
     * Used when updating columns after links have been created.
     */
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
        return this;
    }

    protected _setColumns(data: Array<ColumnData> = []) {
        this._setColumnItems(data);
        this.removeInvalidLinks();
        return this;
    }

    onColumnsChange() {
        if (this.hasChanged("columns")) {
            this._setColumns(this.get("columns"));
        }
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

    initialize(...args) {
        super.initialize(...args);
        const columns = this.get("columns") || [];
        if (columns.length > 0) {
            this._setColumns(columns);
        }
    }

    private _initializeFromOptions(initOptions: ServiceEntityOptions) {
        const { entityType: type, interServiceRelations, embeddedEntities, rootEntities } = initOptions;
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
                value: this.instanceAttributes[key] !== undefined && this.instanceAttributes[key] !== null
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
        const name = ('type' in this.serviceModel && this.serviceModel.type)
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
            return this.attr(
                ["headerLabel", "text"],
                name.replace(/\s+/g, " ").slice(0, 16) + "\u2026",
            );
        } else {
            return this.attr(["headerLabel", "text"], shortenName);
        }
    }

    getEntityName(): string {
        return ('type' in this.serviceModel && this.serviceModel.type)
            ? this.serviceModel.type
            : this.serviceModel.name;
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

        const updated = existing.filter((c) => c !== relationId);

        if (updated.length === 0) {
            this.connections.delete(relationType);
        } else {
            this.connections.set(relationType, updated);
        }
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
    private checkRequiredConnections(
        lowerLimit: bigint | number | null | undefined,
        connectionKey: string,
        skipReadOnly: boolean
    ): boolean {
        // Skip read-only for existing entities
        if (skipReadOnly && !this.isNew) {
            return false;
        }

        const limit = typeof lowerLimit === 'bigint'
            ? Number(lowerLimit)
            : (lowerLimit ?? 0);

        // If lower_limit is 0 or undefined, no connection is required
        if (limit === 0) {
            return false;
        }

        const connectionsForType = this.connections.get(connectionKey) || [];
        const connectedCount = connectionsForType.length;

        // If we have fewer connections than required, the shape is missing connections
        return connectedCount < limit;
    }

    isMissingConnections(): boolean {
        // Embedded entities can never be standalone - they must always have at least one connection
        if (this.entityType === "embedded") {
            const totalConnections = Array.from(this.connections.values()).reduce((sum, arr) => sum + arr.length, 0);
            if (totalConnections === 0) {
                return true;
            }
        }

        // Check embedded entities
        if ('embedded_entities' in this.serviceModel) {
            for (const embeddedEntity of this.serviceModel.embedded_entities) {
                // Use the same key logic as when storing: entity.type || entity.name
                const entityKey = embeddedEntity.type || embeddedEntity.name;

                if (this.checkRequiredConnections(
                    embeddedEntity.lower_limit,
                    entityKey,
                    embeddedEntity.modifier === "r"
                )) {
                    return true;
                }
            }
        }

        // Check inter-service relations
        if ('inter_service_relations' in this.serviceModel) {
            for (const relation of this.serviceModel.inter_service_relations) {
                // Use the same key logic as when storing: relation.entity_type || relation.name
                const relationKey = relation.entity_type || relation.name;

                if (this.checkRequiredConnections(
                    relation.lower_limit,
                    relationKey,
                    relation.modifier === "r"
                )) {
                    return true;
                }
            }
        }

        return false;
    }


    getAttributes(): InstanceAttributeModel {
        return this.attributes;
    }

    getSanitizedAttributes(): InstanceAttributeModel {
        return this.sanitizedAttrs;
    }

    updateAttributes(attributes: InstanceAttributeModel) {
        this.instanceAttributes = attributes;
        this.sanitizedAttrs = JSON.parse(JSON.stringify(attributes));

        const keyAttributes = this.getKeyAttributes();

        if (keyAttributes.length > 0) {
            const displayAttributes = keyAttributes.map((key) => ({
                name: key,
                value: attributes[key] !== undefined && attributes[key] !== null ? String(attributes[key]) : "",
            }));

            // Safely update columns - use requestAnimationFrame to ensure shape is ready
            // Use _setColumnItems instead of set("columns") to avoid triggering removeInvalidLinks
            // which might cause issues if the shape isn't fully rendered
            requestAnimationFrame(() => {
                try {
                    // Check if shape is in a graph and has a size (indicating it's rendered)
                    const graph = this.graph;
                    const size = this.get("size");
                    if (graph && size && size.width && size.height) {
                        // Use _setColumnItems to avoid removing links during updates
                        // This is safer than set("columns") which triggers removeInvalidLinks
                        this._setColumnItems(displayAttributes);
                    } else {
                        // If shape not ready, store columns for later initialization
                        // This will be picked up by the initialize method
                        this.set("columns", displayAttributes);
                    }
                } catch (e) {
                    // Shape not ready yet, store columns for later initialization
                    // This will be picked up by the initialize method
                    this.set("columns", displayAttributes);
                }
            });
        } else {
            // Clear columns if no key attributes
            requestAnimationFrame(() => {
                try {
                    const graph = this.graph;
                    if (graph) {
                        this.set("columns", []);
                    }
                } catch (e) {
                    // Ignore if shape not ready
                }
            });
        }
    }

    /**
     * Safely updates the columns display after the shape is added to the graph.
     * Uses requestAnimationFrame to ensure the shape is fully rendered.
     * Does NOT call removeInvalidLinks() to avoid removing links that were just created.
     */
    updateColumnsDisplay() {
        const columns = this.get("columns") || [];
        if (columns.length === 0) {
            return;
        }

        // Use requestAnimationFrame to ensure the shape is fully rendered
        requestAnimationFrame(() => {
            try {
                const size = this.get("size");
                if (size && size.width && size.height) {
                    // Use _setColumnItems instead of _setColumns to avoid removing links
                    this._setColumnItems(columns);
                }
            } catch (e) {
                // Shape not ready yet, try again on next frame
                requestAnimationFrame(() => {
                    try {
                        const size = this.get("size");
                        if (size && size.width && size.height) {
                            // Use _setColumnItems instead of _setColumns to avoid removing links
                            this._setColumnItems(columns);
                        }
                    } catch (e2) {
                        // Ignore if still not ready
                    }
                });
            }
        });
    }

    getKeyAttributes(): string[] {
        const keyAttributes = this.serviceModel.key_attributes || [];
        // We also want to add the service_identity if it exists (Embedded Entities don't have it)
        if ("service_identity" in this.serviceModel && this.serviceModel.service_identity) {
            keyAttributes.push(this.serviceModel.service_identity);
        }

        return keyAttributes;
    }

}

Object.assign(shapes, {
    app: {
        ServiceEntityShape,
    },
});