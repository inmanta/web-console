import { dia, shapes, util } from "@inmanta/rappid";
import {
  global_FontFamily_monospace,
  global_palette_white,
} from "@patternfly/react-tokens";
import { updateLabelPosition } from "./helpers";
import expandButton from "./icons/expand-icon.svg";
import { ColumnData, EntityType, HeaderColor } from "./interfaces";

/**
 * https://resources.jointjs.com/tutorial/custom-elements
 * https://resources.jointjs.com/tutorial/ts-shape
 *
 * actions that are in ServiceEntity returns updated state of the object, we follow convention introduced by JointJS team in their demos
 */
export class ServiceEntityBlock extends shapes.standard.HeaderedRecord {
  defaults() {
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
        isCollapsed: false,
        attrs: {
          body: {
            class: "joint-entityBlock-body",
            strokeWidth: 0,
            cursor: "default",
          },
          header: {
            strokeWidth: 0,
            cursor: "grab",
          },
          headerLabel: {
            fontFamily: global_FontFamily_monospace.var,
            textTransform: "uppercase",
            fill: global_palette_white.var,
            fontSize: 14,
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
            fontSize: 12,
            //pointerEvents: "none",
            cursor: "default",
            itemText: {
              textWrap: false,
            },
          },
          itemLabels_1: {
            class: "joint-entityBlock-itemLabels-one",
            fontSize: 12,
            textAnchor: "end",
            x: `calc(0.5 * w - 10)`,
            cursor: "default",
          },
        },
      },
      super.defaults,
    );
  }

  protected _setColumns(data: Array<ColumnData> = [], initialSetting = true) {
    const names: Array<{
      id: string;
      label: string;
      span: number;
    }> = [];
    const values: Array<{
      id: string;
      label: string;
    }> = [];
    let dataToIterate = [...data];

    if (initialSetting && data.length > 4) {
      this.set("dataToDisplay", data);
      this.set("isCollapsed", true);
      dataToIterate = data.slice(0, 4);
    }

    dataToIterate.forEach((item) => {
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
        },
      );

      if (truncatedName.includes(`\u2026`)) {
        this.attr(`itemLabel_${item.name}/data-tooltip`, item.name);
        this.attr(`itemLabel_${item.name}/data-tooltip-position`, "right");

        names.push({ ...nameObject, label: item.name.slice(0, 15) + `\u2026` });
      } else {
        names.push(nameObject);
      }

      const value: { id: string; label: string } = {
        id: `${item.name}_value`,
        label: "",
      };

      if (
        typeof item.value === "object" &&
        !Array.isArray(item.value) &&
        item.value !== null
      ) {
        value.label = "{...}";

        ///Add event and add data to display in Dictionary Modal
        this.attr(`itemLabel_${item.name}_value/event`, "element:showDict");
        this.attr(
          `itemLabel_${item.name}_value/dict`,
          JSON.stringify({
            title: item.name,
            value: item.value,
          }),
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
            },
          );

          if (reproducedDisplayText.includes(`\u2026`)) {
            value.label =
              item.value.toString().replace(/\s+/g, " ").slice(0, 16) +
              `\u2026`;
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
        tagName: "rect",
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
      {
        tagName: "rect",
        selector: "spacer",
      },
      {
        tagName: "rect",
        selector: "buttonBody",
      },
      {
        tagName: "image",
        selector: "toggleButton",
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
  setName(name: string, options?: object): this {
    const shortenName = util.breakText(
      name,
      { width: 140, height: 30 },
      {
        "font-size": this.attr("headerLabel/fontSize"),
        "font-family": this.attr("headerLabel/fontFamily"),
      },
      {
        ellipsis: true,
      },
    );

    this.set("entityName", name);
    this.attr(["headerLabel", "data-testid"], "header-" + name);

    if (shortenName.includes(`\u2026`)) {
      return this.attr(
        ["headerLabel", "text"],
        name.replace(/\s+/g, " ").slice(0, 16) + `\u2026`,
        options,
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
   * Appends columns to the entity and optionally initializes a expand/collapse button.
   *
   * @param {Array<ColumnData>} data - The array of column data to append.
   * @param {boolean} [initializeButton=true] - Flag indicating whether to initialize a button to expand/collapse.
   * @returns {this} The updated entity block.
   */
  appendColumns(data: Array<ColumnData>, initializeButton = true): this {
    this._setColumns(data, initializeButton);

    if (initializeButton && this.get("isCollapsed")) {
      this.appendButton();
    }

    return this;
  }

  /**
   * Updates the columns of the entity and optionally sets the collapsed state.
   *
   * @param {Array<ColumnData>} data - The array of column data to set.
   * @param {boolean} [shouldBeCollapsed=true] - Flag indicating whether the entity should be collapsed.
   * @returns {this} The updated entity block.
   */
  updateColumns(data: Array<ColumnData>, shouldBeCollapsed = true): this {
    this._setColumns(data, shouldBeCollapsed);

    return this;
  }

  /**
   * Appends a button to the entity block.
   *
   * This method sets the padding and attributes for the spacer, button body, and toggle button.
   * It positions the button based on the bounding box of the entity block.
   *
   * @returns {void}
   */
  appendButton(): void {
    this.set("padding", {
      bottom: 44,
      left: 10,
      right: 10,
      top: 40,
    });

    const bbox = this.getBBox();

    this.attr("spacer", {
      class: "joint-entityBlock-spacer",
      opacity: 0.1,
      strokeWidth: 1,
      y: bbox.height - 33,
      width: 264,
      height: 1,
      cursor: "default",
    });
    this.attr("buttonBody", {
      event: "element:toggleButton:pointerdown",
      preserveAspectRatio: "none",
      cursor: "pointer",
      opacity: 0,
      y: bbox.height - 32,
      width: 264,
      height: 32,
    });
    this.attr("toggleButton", {
      event: "element:toggleButton:pointerdown",
      "xlink:href": expandButton,
      preserveAspectRatio: "none",
      cursor: "pointer",
      y: bbox.height - 24,
      x: bbox.width / 2 - 8,
      width: 16,
      height: 16,
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
}

export const Link = shapes.standard.Link.define(
  "Link",
  {
    // attributes
    z: -1,
    attrs: {
      wrapper: {
        connection: true,
        strokeWidth: 10,
      },
      line: {
        class: "joint-link-line",
        targetMarker: {
          class: "joint-link-marker",
          type: "path",
          d: "M 0 -5 10 0 0 5 z",
        },
        sourceMarker: {
          class: "joint-link-marker",
          type: "path",
          d: "M 0 -5 10 0 0 5 z",
        },
        connection: true,
        strokeWidth: 2,
      },
    },
  },
  {
    // prototype
  },
  {
    // static
    attributes: {
      "auto-orient": {
        qualify: function () {
          return (this as any).model.isLink();
        },
        set: updateLabelPosition,
      },
    },
  },
);

export const LinkView = dia.LinkView.extend({
  update(...theArgs) {
    dia.LinkView.prototype.update.apply(this, theArgs as []);
    this.updateLabels();
  },
});

Object.assign(shapes, {
  LinkView,
  Link,
  app: {
    ServiceEntityBlock,
  },
});
