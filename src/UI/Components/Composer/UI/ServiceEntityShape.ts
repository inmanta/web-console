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
import { RelationsDictionary } from "../Data";

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
        this._setColumns(this.get("columns"));
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
        this.connections.set(relationType, [...this.connections.get(relationType) || [], relationId]);
    }

    removeConnection(relationId: string, relationType: string) {
        this.connections.set(relationType, this.connections.get(relationType)?.filter((c) => c !== relationId) || []);
    }

    getConnections(): Map<string, string[]> {
        return this.connections;
    }

    getMissingConnections(): string[] {
        // go through the relations dictionary and return the relation types that are not connected, 
        // and that have a lower limit
        const currentEntityName = this.serviceModel.name;
        const missingConnections: string[] = [];

        // Get all allowed relations for this entity
        const allowedRelations = this.relationsDictionary[currentEntityName];

        if (!allowedRelations) {
            return missingConnections;
        }

        // Check each relation type to see if it meets the lower limit
        Object.entries(allowedRelations).forEach(([relationType, rules]) => {
            const existingConnections = this.connections.get(relationType) || [];

            // If the number of existing connections is less than the lower limit, add to missing
            if (existingConnections.length < rules.lower_limit) {
                missingConnections.push(relationType);
            }
        });

        return missingConnections;
    }

    validateConnection(targetEntity: ServiceEntityShape): boolean {
        const relationType = targetEntity.getEntityName();
        const currentEntityName = this.getEntityName();
        const allowedRelations = this.relationsDictionary[currentEntityName];

        if (!allowedRelations) {
            return false;
        }

        const rules = allowedRelations[relationType];

        const existingConnections = this.connections.get(relationType) || [];

        // Check if adding this connection would exceed the upper limit
        if (existingConnections.length >= rules.upper_limit) {
            return false;
        }

        return true;
    }

    getAttributes(): InstanceAttributeModel {
        return this.attributes;
    }

    getSanitizedAttributes(): InstanceAttributeModel {
        return this.sanitizedAttrs;
    }

    updateAttributes(attributes: InstanceAttributeModel) {
        this.attributes = attributes;
        this.sanitizedAttrs = JSON.parse(JSON.stringify(attributes));

        const keyAttributes = this.getKeyAttributes();

        if (keyAttributes.length > 0) {
            const displayAttributes = keyAttributes.map((key) => ({
                name: key,
                value: attributes[key] !== undefined && attributes[key] !== null ? String(attributes[key]) : "",
            }));

            this._setColumns(displayAttributes);
        }
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